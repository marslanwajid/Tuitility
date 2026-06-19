import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, scores } = await request.json();

    // Sourcing API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server. Please check your environment variables.' },
        { status: 400 }
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2500,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `Gemini REST API responded with status ${res.status}`;
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const data = await res.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json({ error: 'No response content generated from AI model.' }, { status: 502 });
    }

    return NextResponse.json({ narrative: generatedText });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to process AI analysis.' }, { status: 500 });
  }
}
