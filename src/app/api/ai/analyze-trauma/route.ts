import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { anxietyScore, intrusiveScore, avoidanceScore, negativeScore, functionalScore, totalScore } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured on the server. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Build prompt for clinical analysis of trauma symptom profile
    const prompt = `You are a professional clinical psychologist and trauma specialist. Based on the following assessment results, provide an exceptionally thorough, highly detailed, and compassionate clinical interpretation and evidence-based self-care recommendations. Your output should be comprehensive, multi-paragraph, and deeply explanatory.

Assessment Results:
- Total Score: ${totalScore} out of 80 (severity threshold mapping: 0-19: Minimal, 20-39: Mild, 40-59: Moderate, 60-80: Significant)
- Hyperarousal & Anxiety: ${anxietyScore}/16 (alertness, startle responses, sleep issues, panic)
- Intrusive Thoughts & Memories: ${intrusiveScore}/16 (unwanted memories, flashbacks, nightmares, trigger reactions)
- Avoidance Behaviors: ${avoidanceScore}/16 (avoidance of reminders, emotional disconnection)
- Negative Mood & Cognition: ${negativeScore}/16 (negative beliefs, self-blame, negative emotions, inability to feel positive)
- Functional Impairment: ${functionalScore}/16 (impact on work/study, relationships, concentration, self-destructive patterns)

Instructions for Depth and Detail:
1. Tone: Maintain a professional, clinical, objective, yet deeply supportive and validating tone. Avoid casual or overly informal greetings.
2. Clinical Interpretation: 
   - Write at least 2 to 3 substantial, detailed paragraphs.
   - Explain the significance of the Total Score (${totalScore}/80) and its severity classification in depth.
   - Analyze each subscale score individually. Contrast the highest scoring subscales with the lower ones to describe the user's specific clinical profile (e.g., if Intrusive Thoughts is high but Avoidance is low, explain the raw intrusion of memories vs. their conscious avoidance strategies).
   - Discuss how these subscale scores interact with each other (e.g., how hyperarousal drives functional impairment in concentration and work).
3. Recommended Coping Strategies:
   - Provide 5 to 7 highly specific, evidence-based coping strategies tailored directly to their highest-scoring categories.
   - For EACH strategy, do not just list it. Write a detailed paragraph explaining:
     a. The name of the technique (e.g., Somatic Grounding, 5-4-3-2-1 Technique, Cognitive Reframing, Bilateral Stimulation, Journaling).
     b. The clinical rationale: How it works neurobiologically or psychologically to reduce the specific symptoms they scored high on.
     c. Step-by-step instructions: Exactly how the user should perform the technique (e.g., breathing count, physical posture).
     d. Practical frequency and application: When and how often they should practice it in daily life.
4. Professional Guidance and Next Steps:
   - Write at least 1 to 2 detailed paragraphs.
   - Compassionately but clearly state the necessity of professional medical, psychiatric, or psychological evaluation.
   - Explain what professional modalities (like EMDR, Somatic Experiencing, TF-CBT, or pharmacological support) could offer them beyond self-care.
   - Reiterate that this self-assessment is an educational screening tool and not a definitive diagnosis.

Structure with Markdown Headers exactly as follows:
### Clinical Interpretation
[Insert 2-3 detailed paragraphs here]

### Recommended Coping Strategies
[Insert 5-7 detailed techniques here, with multiple paragraphs/list items outlining step-by-step details for each]

### Professional Guidance and Next Steps
[Insert 1-2 detailed paragraphs here]`;

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
