import { NextRequest } from 'next/server';
import { allTools } from '../../../../data/allTools';

// Allow up to 60s for streaming responses on Vercel (Pro plan)
// On free/hobby plan this caps at 10s, but setting it signals intent
export const maxDuration = 60;

// Build the full tool catalog once at module load
const TOOL_CATALOG = allTools
  .map((t: { name: string; url: string; desc: string }) => `- ${t.name} | ${t.url} | ${t.desc}`)
  .join('\n');

const SYSTEM_PROMPT = `You are TuitiBot, the specialized assistant for Tuitility — a free online tools platform.

CRITICAL RULES (NEVER BREAK THESE):
1. You are strictly a tool discovery and tool request assistant. You do NOT write code, solve general equations, answer general knowledge/trivia questions, write essays, or perform any general assistant tasks.
2. If the user asks you to do anything other than finding, listing, or requesting a tool on Tuitility (such as writing a Python/JavaScript script, solving math homework, explaining general concepts, or chatting about random topics), you MUST politely refuse and redirect them to finding or requesting tools on Tuitility.
   - Example refusal: "I am TuitiBot, and I only help you find and request tools on Tuitility! 🛠️ Let me know what calculator or tool you need, and I'll point you to the right place or offer to submit a request to our team!"
3. You may ONLY suggest tools from the TOOL CATALOG below. This is the COMPLETE list of every tool on the site.
4. Do NOT invent, imagine, or guess any tool that is not in the catalog. There are NO other tools.
5. If the user asks for a tool that does NOT exist in the catalog, say: "We don't have that tool yet! Would you like me to submit a request to our team to build it? Just say **yes** and I'll set that up for you. 🚀"
6. If the user says yes/ok/sure to submitting a request, respond with exactly: REQUEST_TOOL_FORM
7. When suggesting tools, use ONLY the exact name and URL from the catalog.

TOOL LINK FORMAT — always format like this:
**Tool Name** — short description
[Tool Name](/exact/url/from/catalog)

If multiple tools match, list ALL matching ones from the catalog.

BEHAVIOR:
- Greet users warmly.
- Be friendly, concise, use emojis sparingly.
- Absolutely refuse any non-tool, general programming, scripting, mathematics, homework, or trivia queries. Politely reiterate your narrow scope.
- If the user misspells a tool name, find the closest match in the catalog.
- If the user's query matches multiple tools (e.g. "image" or "pdf"), list ALL matching tools from the catalog.

===== TOOL CATALOG (COMPLETE — nothing else exists) =====
${TOOL_CATALOG}
===== END CATALOG =====`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Limit conversation history to last 10 messages to prevent token overflow on free models
    const recentMessages = messages.slice(-10);

    let res;
    let model = 'openrouter/free';

    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://tuitility.vercel.app',
          'X-OpenRouter-Title': 'Tuitility',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recentMessages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.3,
          max_tokens: 1500,
          stream: true,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(`Primary model ${model} failed or timed out. Falling back... Error: ${errMsg}`);
      model = 'nvidia/nemotron-3-ultra-550b-a55b:free';
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://tuitility.vercel.app',
          'X-OpenRouter-Title': 'Tuitility',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recentMessages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.3,
          max_tokens: 1500,
          stream: true,
        }),
        signal: AbortSignal.timeout(30000),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err.error?.message || `OpenRouter error ${res.status}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const encoder = new TextEncoder();
    const reader = res.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response body' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith(':')) continue;
              if (!trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(JSON.stringify({ content }) + '\n'));
                }
              } catch { /* skip malformed chunk */ }
            }
          }
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            console.error("Stream error detail:", e);
            controller.enqueue(encoder.encode(JSON.stringify({ error: `Stream interrupted: ${(e as Error).message}` }) + '\n'));
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process chat';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
