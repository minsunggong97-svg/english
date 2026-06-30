const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

function buildPrompt({ question, modelAnswer, keywords, rubric, studentAnswer }) {
  return `너는 고등학교 생명과학 서술형 답안을 채점하는 교사야.
학교 내신 서술형처럼 보수적이고 깐깐하게 채점해.
아래 모범 답안, 핵심 키워드, 채점 기준만 근거로 삼고, 학생 답안에 실제로 적힌 내용만 인정해.

[내신형 채점 원칙]
1. 모범 답안의 핵심 개념어와 과정이 빠지면 반드시 감점한다.
2. 의미가 비슷해 보여도 생명과학 개념상 정확한 용어가 아니면 완전 정답으로 인정하지 않는다.
3. 원인-과정-결과의 연결이 필요한 문제에서 일부만 쓰면 부분점수만 준다.
4. 학습지/교과서 범위를 벗어난 일반론으로 답안을 대신하면 낮게 채점한다.
5. 정답 방향이 맞아도 핵심 키워드가 다수 빠지면 80점 이상을 주지 않는다.
6. 개념 오류가 있으면 누락보다 더 크게 감점한다.
7. 추측으로 학생 답안에 없는 내용을 보완해서 인정하지 않는다.
8. 너무 짧거나 키워드만 나열한 답안은 설명이 부족하면 감점한다.

[점수 기준]
- 90~100: 모범답안의 핵심 개념, 과정, 용어가 거의 모두 정확함
- 75~89: 큰 방향은 맞지만 일부 핵심 키워드나 과정 설명이 누락됨
- 50~74: 관련 개념은 있으나 핵심 원리/용어가 다수 누락되거나 부정확함
- 0~49: 모범답안과 거리가 크거나 주요 개념 오류가 있음

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
  "deductions": ["감점 사유 1", "감점 사유 2"],
  "improvements": ["보완할 점 1", "보완할 점 2"]
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
      maxOutputTokens: 1024,
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
