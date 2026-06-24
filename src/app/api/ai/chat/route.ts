import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are TuitiBot, the helpful assistant for Tuitility — a free online tools platform with 96+ calculators, converters, PDF tools, and utility tools.

Your job:
1. Greet users warmly and offer to help find tools.
2. When a user asks about a tool or describes a need, suggest the most relevant tool(s) from the provided matchedTools list.
3. If the user misspells or describes a tool vaguely, use the matchedTools context to figure out what they mean.
4. If MULTIPLE tools match the user's query (e.g. "image" matches Image Converter, Image to WebP, etc.), list ALL of them so the user can pick.
5. If the user wants to submit a request or contact the team, collect their name, email, and a description of their request/feedback conversationally.
6. For general chat not about tools, answer helpfully but keep it brief.
7. Always be friendly, concise, and use emojis sparingly.

IMPORTANT — Tool link format:
Always format each tool suggestion EXACTLY like this, with a markdown link:
**Tool Name** — short description
[Tool Name](/exact/url/path)

For example:
**Fraction Calculator** — Perform fraction operations with step-by-step visualization
[Fraction Calculator](/math/calculators/fraction-calculator)

If multiple tools match, list them all:
**Image Converter** — Convert images between 30+ formats
[Image Converter](/utility-tools/image-tools/image-converter)

**Image to WebP Converter** — Convert images to WebP format
[Image to WebP Converter](/utility-tools/image-tools/image-to-webp-converter)

Never make up tools or URLs that aren't in the matchedTools list. If no matchedTools are provided and you're unsure, ask the user to describe what they need.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, matchedTools } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const toolContext = matchedTools && matchedTools.length > 0
      ? `\n\nRelevant tools on this site:\n${matchedTools.map((t: { name: string; url: string; desc: string }) => `- ${t.name}: ${t.desc} (${t.url})`).join('\n')}`
      : '';

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
            { role: 'system', content: SYSTEM_PROMPT + toolContext },
            ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: true,
        }),
        signal: AbortSignal.timeout(10000), // 10s timeout to fall back quickly if queued/stuck
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(`Primary model ${model} failed or timed out. Falling back to nvidia/nemotron-3-ultra-550b-a55b:free... Error: ${errMsg}`);
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
            { role: 'system', content: SYSTEM_PROMPT + toolContext },
            ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
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
              if (trimmed.startsWith(':')) {
                // Keep-alive comment from OpenRouter, forward it to client to prevent timeout
                controller.enqueue(encoder.encode(':\n'));
                continue;
              }
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
