import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, scores } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured on the server. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const prompt = `You are a world-class personality psychologist and MBTI specialist. Provide a sophisticated, clinical-grade analysis for the MBTI type: ${type}.

Analysis Context:
- Extraversion vs Introversion (E/I): ${scores.EI > 0 ? 'Introverted' : 'Extraverted'} (Score bias: ${scores.EI})
- Sensing vs Intuition (S/N): ${scores.SN > 0 ? 'Intuitive' : 'Sensing'} (Score bias: ${scores.SN})
- Thinking vs Feeling (T/F): ${scores.TF > 0 ? 'Feeling' : 'Thinking'} (Score bias: ${scores.TF})
- Judging vs Perceiving (J/P): ${scores.JP > 0 ? 'Perceiving' : 'Judging'} (Score bias: ${scores.JP})

Instructions for Depth and Detail:
1. Tone: Maintain a highly professional, sophisticated, empathetic, and academically-grounded clinical psychologist tone. Avoid generic platitudes, horoscope-like statements, or informal greetings.
2. Structure your output exactly with the following Markdown headers:

### Strategic Personality Analysis
Write 2-3 detailed paragraphs analyzing this type's general orientation, core motivations, and cognitive style. Explain how the combination of these preferences forms their unique personality profile.

### Cognitive Processing & Decision Making
Write 2-3 detailed paragraphs explaining their cognitive function stack (Dominant, Auxiliary, Tertiary, Inferior). Discuss how they gather information and make decisions, highlighting both conscious strengths and unconscious blind spots.

### Interpersonal Dynamics & Communication Style
Write 2-3 detailed paragraphs outlining how this type interacts in relationships, social groups, and professional environments. Explain their typical communication style, emotional expression, and conflict-resolution patterns.

### Professional Strengths & Optimization Strategies
Write 2-3 detailed paragraphs about their ideal work environment, career paths, and natural professional talents. Suggest concrete strategies they can use to leverage their strengths for career growth.

### Targeted Personal Growth Trajectories
Write 2-3 detailed paragraphs providing actionable suggestions for personal development. Focus on how to integrate their inferior function, overcome common pitfalls of their type, and build resilience.`;

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
        max_tokens: 2500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `OpenRouter API responded with status ${res.status}`;
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const data = await res.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      return NextResponse.json({ error: 'No response content generated from AI model.' }, { status: 502 });
    }

    return NextResponse.json({ narrative: generatedText });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to process AI analysis.' }, { status: 500 });
  }
}
