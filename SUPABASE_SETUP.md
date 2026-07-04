# Supabase Progress Sync Setup

이 문서는 `grammar-cloze.html`의 로그인 기반 학습 데이터 동기화를 Supabase로 연결하기 위한 설정 안내입니다.

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. Project Settings > API에서 아래 값을 확인합니다.
   - Project URL
   - anon public key
3. `service_role key`는 절대 `grammar-cloze.html`에 넣지 않습니다.

## 2. Auth 설정

Authentication > Providers에서 사용할 로그인 방식을 켭니다.

현재 앱은 Google OAuth 로그인 방식을 사용합니다.

- Google provider: 켜기
- Google Cloud OAuth Client ID와 Client Secret 연결
- Supabase의 Google Callback URL을 Google Cloud Console의 Authorized redirect URIs에 등록

Email provider나 Magic Link는 이 앱에서 사용하지 않습니다.

## 3. Site URL과 Redirect URL 설정

Authentication > URL Configuration에서 배포 주소를 등록합니다.

예:

- Site URL: `https://minsunggong97-svg.github.io/english/`
- Redirect URLs:
  - `https://minsunggong97-svg.github.io/english/grammar-cloze.html`
  - 로컬 테스트 주소가 있다면 같이 추가

## 4. Database SQL 실행

Supabase SQL Editor에서 아래 SQL을 실행합니다.

```sql
create table if not exists public.cloze_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress_key text not null default 'grammar-cloze-progress-v1',
  progress_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cloze_progress enable row level security;

drop policy if exists "Users can read own cloze progress" on public.cloze_progress;
drop policy if exists "Users can insert own cloze progress" on public.cloze_progress;
drop policy if exists "Users can update own cloze progress" on public.cloze_progress;

create policy "Users can read own cloze progress"
on public.cloze_progress
for select
using (auth.uid() = user_id);

create policy "Users can insert own cloze progress"
on public.cloze_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update own cloze progress"
on public.cloze_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 5. grammar-cloze.html 설정값 입력

`grammar-cloze.html`에서 아래 상수를 찾습니다.

```javascript
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
```

Supabase Project URL과 anon public key를 입력합니다.

예:

```javascript
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';
```

이 값은 브라우저에 공개되는 값입니다. 반드시 RLS 정책을 켜서 사용자 본인 데이터만 접근 가능하게 해야 합니다.

## 6. 동작 방식

- 로그인하지 않은 사용자는 기존처럼 `localStorage`에 저장됩니다.
- 사용자는 `Google 계정으로 로그인` 버튼을 눌러 Google OAuth 창에서 로그인합니다.
- 로그인한 사용자는 `localStorage`에 저장하면서 Supabase에도 같이 저장됩니다.
- 로그인 직후 서버 기록과 로컬 기록을 비교해 더 최신인 기록을 사용합니다.
- Supabase 연결이나 저장에 실패해도 앱은 멈추지 않고 `localStorage`만으로 계속 동작합니다.

## 7. 확인 항목

1. Supabase 설정값이 비어 있으면 로그인 UI가 "동기화 설정 필요" 상태로 보이는가?
2. `Google 계정으로 로그인` 버튼을 누르면 Google OAuth 창으로 이동하는가?
3. Google 로그인 후 다시 `grammar-cloze.html`로 돌아오는가?
4. 로그인 후 문제를 풀고 채점하면 `cloze_progress`에 데이터가 저장되는가?
5. 다른 기기나 다른 브라우저에서 같은 Google 계정으로 로그인했을 때 점수와 진행 상태가 복원되는가?
6. 로그아웃 후에도 로컬 저장 모드로 앱이 정상 동작하는가?
