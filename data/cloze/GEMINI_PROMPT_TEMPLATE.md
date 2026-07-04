# Gemini Cloze JSON Prompt Template

너는 고등학교 영어 내신 대비용 어법/서술형/어휘 빈칸 문제 데이터를 만드는 전문가다.
아래 입력 자료를 바탕으로 `schema.example.json`과 완전히 호환되는 JSON만 출력하라.

## 절대 규칙

- JSON만 출력한다.
- Markdown 코드블록을 쓰지 않는다.
- 설명문, 주석, 머리말, 맺음말을 쓰지 않는다.
- `schemaVersion`은 반드시 `1`이다.
- 모든 문자열은 유효한 JSON 문자열이어야 한다.
- 모든 `id`는 `passageId`를 prefix로 사용해 기존 파일과 절대 중복되지 않게 만든다.
- `answer`에 들어가는 모든 토큰은 반드시 같은 blank의 `choices`에도 포함되어야 한다.
- `passageParts`에 등장하는 모든 blank id는 반드시 `blanks` object 안에 존재해야 한다.
- `blanks` object 안의 모든 key는 반드시 `passageParts`에 등장해야 한다.
- `type`은 `grammar`, `writing`, `vocab` 중 하나만 사용한다.
- `writing`, `vocab` 세트는 대응하는 `grammar` 세트의 `id`를 `sourceSetId`로 가져야 한다.
- `vocab` blank는 반드시 `difficulty`를 1~5 정수로 가진다.
- `vocab` blank는 반드시 `translations`와 `pronunciations`에 같은 id의 항목을 가진다.

## 생성 범위

- 각 Part마다 `grammar`, `writing`, `vocab` 세트를 만든다.
- `grammar`는 내신 어법 빈칸 중심으로 만든다.
- `writing`은 전체 문장을 배열시키지 말고, 실제 서술형 예상 핵심 구문만 짧게 빈칸화한다.
- `vocab`은 문맥상 중요한 어휘, 구동사, collocation, 추상명사, 학술 어휘를 중심으로 만든다.
- 각 blank의 `explanation`은 학생이 왜 그 답을 골라야 하는지 한국어로 간결하게 설명한다.

## 권장 문항 수

- Part별 grammar blank: 8~12개
- Part별 writing blank: 3~5개
- Part별 vocab blank: 6~12개

## 입력 자료

### passageId

`여기에-passage-id를-넣으세요`

### title

`여기에 지문 제목을 넣으세요`

### groupLabel

`사이드바에 표시할 큰 지문 이름을 넣으세요`

### 모의고사형 지문 분할

여기에 `*_모의고사지문분할.md` 내용을 붙여 넣으세요.

### 문장별 상세 문법 해설

여기에 `*_문장별_상세문법해설_*.md` 내용을 붙여 넣으세요.

### 참고 schema

`schema.example.json` 구조를 그대로 따른다.

## 출력 전 자체 검증

출력하기 전에 내부적으로 다음을 확인하라.

- JSON.parse가 가능한가?
- 최상위에 `schemaVersion`, `passageId`, `title`, `groupLabel`, `sets`, `translations`, `pronunciations`가 있는가?
- 모든 set id가 유일한가?
- 모든 blank id가 유일한가?
- 모든 answer token이 choices에 포함되는가?
- 모든 sourceSetId가 실제 grammar set id를 가리키는가?
- writing blank가 너무 긴 전체 문장 배열이 아니라 핵심 구문 배열인가?
- vocab difficulty가 1~5인가?

위 조건을 모두 만족하는 JSON만 최종 출력하라.
