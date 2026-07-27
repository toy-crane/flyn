-- Apple 계정 삭제에 쓸 refresh token 보관소(§6). 계정 삭제 전에 이 token으로
-- Apple에서 사용자 승인을 취소한다 — docs/decisions/store-apple-revocation-token.md.
--
-- **자물쇠가 셋이다.**
--
-- 1. `private`는 config.toml의 `api.schemas`에 없다. PostgREST는 이 스키마를
--    아예 서비스하지 않는다 — secret 키로 요청해도 PGRST106으로 거절한다.
--    권한 실수 하나로 뚫리지 않는다는 뜻이고, 이것이 `public`에 두고 grant만
--    비우는 것과의 결정적 차이다.
-- 2. Data API 롤에는 스키마 USAGE조차 주지 않는다.
-- 3. 정책 없는 RLS. 앞의 둘이 무너져도 보이는 행이 없다.
--
-- 그러면 서버는 어떻게 닿는가. Hono가 가진 것은 PostgREST를 타는
-- supabase-js뿐이라 이 스키마에 직접 갈 수 없다. 그래서 `public`에 security
-- definer 함수 두 개를 두고 EXECUTE를 service_role에만 준다 — Supabase가
-- 노출하지 않는 스키마를 다루는 표준 방식이다.
--
-- 부수 효과가 하나 더 있다. 생성 타입은 `--schema public`만 훑으므로
-- `refresh_token`이 모바일 타입 표면에서 사라진다. public에 뒀을 때는
-- `supabase.from("apple_credentials").select("refresh_token")`이 타입 오류 없이
-- 컴파일됐다 — 런타임에 막히더라도 타입이 그 실수를 권해서는 안 된다.

create schema private;

create table private.apple_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- 절대 UI·로그·분석 이벤트·오류 응답에 싣지 않는다.
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.apple_credentials enable row level security;

-- 정책을 하나도 만들지 않는다. 부재가 결정이다 — 이 표를 읽어야 하는 주체는
-- RLS를 우회하는 소유자로 도는 아래 두 함수뿐이다.

-- 같은 사용자가 다시 Apple로 로그인하면 새 token으로 갈아끼운다.
create function public.store_apple_refresh_token(
  p_user_id uuid,
  p_refresh_token text
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into private.apple_credentials (user_id, refresh_token)
  values (p_user_id, p_refresh_token)
  on conflict (user_id) do update
    set refresh_token = excluded.refresh_token,
        updated_at = now();
$$;

create function public.read_apple_refresh_token(p_user_id uuid)
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select refresh_token from private.apple_credentials where user_id = p_user_id;
$$;

-- create function은 EXECUTE를 PUBLIC에 기본으로 준다. 거두지 않으면 anon과
-- authenticated가 그대로 부를 수 있다 — 이 두 줄이 실제 경계다.
revoke execute on function public.store_apple_refresh_token(uuid, text) from public;
revoke execute on function public.read_apple_refresh_token(uuid) from public;

grant execute on function public.store_apple_refresh_token(uuid, text) to service_role;
grant execute on function public.read_apple_refresh_token(uuid) to service_role;
