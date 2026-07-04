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

이 앱의 로그인 UI는 Google OAuth 버튼만 제공합니다.

## 3. Site URL과 Redirect URL 설정

Authentication > URL Configuration에서 배포 주소를 등록합니다.

예:

- Site URL: `https://english-rho-tawny.vercel.app/`
- Redirect URLs:
  - `https://english-rho-tawny.vercel.app/index.html`
  - `https://english-rho-tawny.vercel.app/grammar-cloze.html`
  - 로컬 테스트 주소가 있다면 같이 추가

## 4. Database SQL 실행

Supabase SQL Editor에서 아래 SQL을 실행합니다.

```sql
create table if not exists public.app_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  app_key text not null,
  progress_key text not null default 'app-progress-v1',
  progress_json jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, app_key)
);

alter table public.app_progress enable row level security;

drop policy if exists "Users can read own app progress" on public.app_progress;
drop policy if exists "Users can insert own app progress" on public.app_progress;
drop policy if exists "Users can update own app progress" on public.app_progress;

create policy "Users can read own app progress"
on public.app_progress
for select
using (auth.uid() = user_id);

create policy "Users can insert own app progress"
on public.app_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update own app progress"
on public.app_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 5. HTML 설정값 입력

`index.html`과 `grammar-cloze.html`에서 아래 상수를 찾습니다.

```javascript
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
```

두 파일 모두 같은 Supabase Project URL과 anon public key를 사용해야 로그인 세션이 공유됩니다.

예:

```javascript
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';
```

이 값은 브라우저에 공개되는 값입니다. 반드시 RLS 정책을 켜서 사용자 본인 데이터만 접근 가능하게 해야 합니다.

## 6. 동작 방식

- 로그인하지 않은 사용자는 기존처럼 `localStorage`에 저장됩니다.
- 사용자는 `Google 계정으로 로그인` 버튼을 눌러 Google OAuth 창에서 로그인합니다.
- `index.html`과 `grammar-cloze.html`은 같은 Supabase 세션을 공유합니다.
- 로그인한 사용자는 `localStorage`에 저장하면서 Supabase `app_progress` 테이블에도 같이 저장됩니다.
- 어법배열은 `app_key = sentence-builder`, 빈칸채우기는 `app_key = grammar-cloze`로 분리 저장됩니다.
- 로그인 직후 서버 기록과 로컬 기록을 비교해 더 최신인 기록을 사용합니다.
- Supabase 연결이나 저장에 실패해도 앱은 멈추지 않고 `localStorage`만으로 계속 동작합니다.

## 7. 확인 항목

1. Supabase 설정값이 비어 있으면 로그인 UI가 "동기화 설정 필요" 상태로 보이는가?
2. `Google 계정으로 로그인` 버튼을 누르면 Google OAuth 창으로 이동하는가?
3. Google 로그인 후 다시 로그인 버튼을 누른 페이지로 돌아오는가?
4. 한 페이지에서 로그인한 뒤 다른 페이지로 이동해도 로그인 상태가 유지되는가?
5. 한 페이지에서 로그아웃하면 다른 페이지에서도 로그아웃 상태가 되는가?
6. 로그인 후 문제를 풀고 채점하면 `app_progress`에 앱별 `app_key`로 데이터가 저장되는가?
7. 다른 기기나 다른 브라우저에서 같은 Google 계정으로 로그인했을 때 점수와 진행 상태가 복원되는가?
8. 로그아웃 후에도 로컬 저장 모드로 앱이 정상 동작하는가?
