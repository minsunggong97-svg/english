# Cloze JSON Data

이 폴더는 `grammar-cloze.html`에 외부 지문 문제를 안전하게 추가하기 위한 JSON 파일을 보관합니다.

## 추가 방법

1. `schema.example.json` 형식에 맞춰 새 지문 JSON을 만듭니다.
2. 생성한 파일을 `data/cloze/` 아래에 저장합니다.
3. `data/cloze-manifest.json`의 `files` 배열에 파일 경로를 추가합니다.
4. 앱을 열어 사이드바에 새 지문이 표시되는지 확인합니다.

## 안전 원칙

- JSON 파일이 깨져 있어도 기존 내장 문제는 그대로 동작합니다.
- 검증을 통과하지 못한 JSON 파일은 앱에 병합되지 않습니다.
- `id`는 기존 문제와 중복되면 안 됩니다.

## Gemini 사용

`GEMINI_PROMPT_TEMPLATE.md`에 원문, 모의고사형 지문 분할, 문장별 상세 문법 해설을 붙여 넣고 JSON을 생성하세요.
