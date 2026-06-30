# Biology Essay Grader - Vercel 배포용

생명과학 학습지를 기반으로 만든 서술형 답안 AI 채점 앱입니다.

## 기능

- 서술형 문제 49개 내장
- 대분류별 문제 필터: 인체의 면역반응, 유전정보와 생식세포, 생물의 진화와 다양성
- 직접 답안 입력
- Gemini 기반 AI 채점
- 점수, 등급, 잘한 점, 누락 키워드, 개념 오류, 보완점, 모범답안 제공
- 브라우저 `localStorage`에 답안과 피드백 저장
- 미완료/복습 필요 문제 필터

## 파일 구조

```text
vercel-biology-essay-grader/
├── index.html
├── api/
│   └── grade-answer.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Vercel 환경변수

Vercel 프로젝트 설정의 Environment Variables에 아래 값을 추가하세요.

- Key: `GEMINI_API_KEY`
- Value: 본인의 Gemini API 키

## 배포 방법

1. GitHub 저장소를 Vercel에서 Import합니다.
2. Root Directory를 `vercel-biology-essay-grader`로 지정합니다.
3. Environment Variables에 `GEMINI_API_KEY`를 추가합니다.
4. Deploy를 실행합니다.

## 주의

- `index.html`에는 API 키가 들어 있지 않습니다.
- `.env` 파일은 로컬에서만 사용하고 GitHub에 올리지 마세요.
- 사용자의 답안과 피드백 기록은 각자의 브라우저에 저장됩니다.
