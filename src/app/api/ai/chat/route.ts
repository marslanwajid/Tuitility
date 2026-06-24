import { NextRequest } from 'next/server';
import { allTools } from '../../../../data/allTools';

// Allow up to 60s for streaming responses on Vercel (Pro plan)
// On free/hobby plan this caps at 10s, but setting it signals intent
export const maxDuration = 60;

// Build the full tool catalog once at module load (names and URLs only to minimize token count and prevent rate limiting)
const TOOL_CATALOG = allTools
  .map((t: { name: string; url: string }) => `- ${t.name} | ${t.url}`)
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
**Tool Name** — short description (write a brief 1-sentence description based on what the tool does)
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

    if (!process.env.GROQ_API_KEY && !process.env.CEREBRAS_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'No LLM API keys (Groq, Cerebras, or OpenRouter) are configured on the server' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Limit conversation history to last 10 messages to prevent token overflow on free models
    const recentMessages = messages.slice(-10);

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    let res: Response | undefined = undefined;
    let success = false;
    let lastError = '';

    // 1. Try Groq (Primary, fast)
    if (!success && process.env.GROQ_API_KEY) {
      try {
        console.log('Attempting Groq stream...');
        res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1500,
            stream: true,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          success = true;
          console.log('Groq stream request succeeded.');
        } else {
          const errText = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn(`Groq primary failed. Falling back... Error: ${lastError}`);
      }
    }

    // 2. Try Cerebras (Secondary fallback)
    if (!success && process.env.CEREBRAS_API_KEY) {
      try {
        console.log('Attempting Cerebras stream...');
        res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-oss-120b',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1500,
            stream: true,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          success = true;
          console.log('Cerebras stream request succeeded.');
        } else {
          const errText = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn(`Cerebras fallback failed. Falling back... Error: ${lastError}`);
      }
    }

    // 3. Try OpenRouter (Tertiary fallback, primary free model)
    if (!success && process.env.OPENROUTER_API_KEY) {
      try {
        console.log('Attempting OpenRouter primary stream...');
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://tuitility.vercel.app',
            'X-OpenRouter-Title': 'Tuitility',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1500,
            stream: true,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          success = true;
          console.log('OpenRouter primary stream request succeeded.');
        } else {
          const errText = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn(`OpenRouter primary failed. Falling back... Error: ${lastError}`);
      }
    }

    // 4. Try OpenRouter (Final fallback, Nemotron)
    if (!success && process.env.OPENROUTER_API_KEY) {
      try {
        console.log('Attempting OpenRouter secondary stream...');
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://tuitility.vercel.app',
            'X-OpenRouter-Title': 'Tuitility',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1500,
            stream: true,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (res.ok) {
          success = true;
          console.log('OpenRouter secondary stream request succeeded.');
        } else {
          const errText = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn(`OpenRouter secondary failed. Error: ${lastError}`);
      }
    }

    if (!success || !res) {
      return new Response(
        JSON.stringify({ error: `All chat model providers failed. Last error: ${lastError || 'No provider configured'}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
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
