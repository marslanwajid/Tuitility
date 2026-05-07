
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt, model = 'gemini-2.5-flash' } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API;

  if (!apiKey) {
    return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        message: 'Error from Gemini API', 
        details: data.error?.message || 'Unknown error' 
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return res.status(500).json({ message: 'Empty response from AI API' });
    }

    return res.status(200).json({ text: resultText });
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
