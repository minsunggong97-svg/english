const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.' });
  }

  try {
    let lastError = '';

    for (const model of GEMINI_MODELS) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });

      const responseText = await response.text();

      if (response.ok) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(responseText);
      }

      lastError = responseText;
      if (response.status !== 404) break;
    }

    return res.status(502).json({ error: 'Gemini API 요청에 실패했습니다.', detail: lastError });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
