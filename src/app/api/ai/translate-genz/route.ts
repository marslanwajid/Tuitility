import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, toGenZ } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured on the server. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const prompt = toGenZ
      ? `Translate the following formal or standard English text into modern Gen Z slang. Make it sound authentic, using current terms like 'no cap', 'fr fr', 'slay', 'bestie', 'rizz', 'sus', 'lowkey', 'highkey', 'bet', 'simp', etc. Keep the original meaning but change the vibe completely. Do not wrap the output in markdown code blocks or quotes. Just output the translation itself directly.\n\nText: "${text}"`
      : `Translate the following Gen Z slang into clear, professional, standard English. If there are complex slang terms, translate the main message clearly first, then list the terms with brief explanations under it in a clean format without using double asterisks (**) or markdown formatting. Keep the output clean and professional.\n\nText: "${text}"`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://tuitility.vercel.app',
        'X-OpenRouter-Title': 'Tuitility',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `OpenRouter API responded with status ${res.status}`;
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const data = await res.json();
    console.log('OpenRouter API Response Data:', JSON.stringify(data));
    let generatedText = data.choices?.[0]?.message?.content || '';

    // Remove code block backticks if AI returns them
    if (generatedText.startsWith('```') && generatedText.endsWith('```')) {
      generatedText = generatedText.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }
    
    // Remove quotes around translation if model added them
    generatedText = generatedText.trim().replace(/^"(.*)"$/, '$1');

    return NextResponse.json({ translation: generatedText.trim() });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process translation.' }, { status: 500 });
  }
}
