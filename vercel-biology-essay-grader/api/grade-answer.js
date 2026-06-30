const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash'];

function buildPrompt({ question, modelAnswer, keywords, rubric, studentAnswer }) {
  return `너는 고등학교 생명과학 서술형 답안을 채점하는 교사야.
아래 기준만 근거로 학생 답안을 엄격하지만 학습에 도움이 되게 채점해.
추측으로 없는 내용을 만들어내지 말고, 학생 답안에 실제로 들어 있는 개념만 인정해.

[문제]
${question}

[모범 답안]
${modelAnswer}

[핵심 키워드]
${(keywords || []).join(', ')}

[채점 기준]
${(rubric || []).map((item, index) => `${index + 1}. ${item}`).join('\n')}

[학생 답안]
${studentAnswer}

반드시 아래 JSON 형식으로만 답해. 마크다운 코드블록은 쓰지 마.
{
  "score": 0,
  "gradeLabel": "상/중/하 중 하나",
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "missingKeywords": ["누락 키워드 1", "누락 키워드 2"],
  "conceptErrors": ["잘못된 개념 1"],
  "improvements": ["보완할 점 1", "보완할 점 2"],
  "modelAnswer": "학생 수준에 맞게 다듬은 모범 답안",
  "studyTip": "다음에 기억할 한 줄 팁"
}`;
}

function parseJsonResponse(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.' });
  }

  const { question, modelAnswer, keywords, rubric, studentAnswer } = req.body || {};
  if (!question || !modelAnswer || !studentAnswer || !studentAnswer.trim()) {
    return res.status(400).json({ error: '문제, 모범 답안, 학생 답안이 필요합니다.' });
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt({ question, modelAnswer, keywords, rubric, studentAnswer }) }]
      }
    ],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  };

  try {
    let lastError = '';

    for (const model of GEMINI_MODELS) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();

      if (response.ok) {
        const data = JSON.parse(responseText);
        const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n') || '';
        const grading = parseJsonResponse(text);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(grading);
      }

      lastError = responseText;
      if (response.status !== 404) break;
    }

    return res.status(502).json({ error: 'Gemini API 요청에 실패했습니다.', detail: lastError });
  } catch (error) {
    console.error('Biology grading error:', error);
    return res.status(500).json({ error: 'AI 채점 중 오류가 발생했습니다.' });
  }
}
