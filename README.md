# Grammar Sentence Builder - Vercel 배포용

친구에게 링크로 공유하기 위한 Vercel 배포용 프로젝트입니다. Gemini API 키는 브라우저에 노출되지 않고 Vercel 환경변수에서만 사용됩니다.

## 파일 구조

```text
vercel-sentence-builder/
├── index.html
├── api/
│   └── analyze-wrong.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Vercel 환경변수

Vercel 프로젝트 설정의 Environment Variables에 아래 값을 추가하세요.

- Key: `GEMINI_API_KEY`
- Value: 본인의 Gemini API 키

## 배포 순서

1. 이 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel에서 해당 GitHub 저장소를 Import합니다.
3. Environment Variables에 `GEMINI_API_KEY`를 추가합니다.
4. Deploy를 누릅니다.
5. 생성된 Vercel 주소를 친구에게 공유합니다.

## 주의

- `index.html` 안에는 Gemini API 키가 들어 있지 않습니다.
- `.env` 파일은 만들더라도 GitHub에 올리지 마세요. `.gitignore`에 포함되어 있습니다.
- 친구의 진행상황, 오답노트, 킵 문장은 각자의 브라우저 localStorage에 저장됩니다.
