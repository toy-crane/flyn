-- Apple 계정 삭제에 쓸 refresh token 보관소(§6). 계정 삭제 전에 이 token으로
-- Apple에서 사용자 승인을 취소한다 — docs/decisions/store-apple-revocation-token.md.
--
-- **왜 public에 두면서 서버 전용인가.** 이 저장소가 Data API에 닿는 경로는
-- PostgREST 하나이고, PostgREST가 여는 스키마는 config.toml의
-- `api.schemas = ["public", "graphql_public"]`뿐이다. Hono의 admin 클라이언트도
-- 같은 길로 다니므로, 노출되지 않는 별도 스키마에 두면 서버조차 닿지 못한다.
--
-- 그래서 스키마를 숨기는 대신 **권한을 비운다.** anon·authenticated에는 grant가
-- 하나도 없어 PostgREST가 테이블 접근 자체를 거부하고, 정책 없는 RLS가 두 번째
-- 자물쇠로 남는다(권한이 실수로 생겨도 보이는 행이 없다). 모바일이 쓰는 두 롤
-- 어느 쪽으로도 이 표에 닿을 수 없다는 뜻이고, 이것이 결정 기록이 "프로필에
-- 저장"을 기각하며 요구한 경계다.

create table public.apple_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- 절대 UI·로그·분석 이벤트·오류 응답에 싣지 않는다.
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apple_credentials enable row level security;

-- 정책을 하나도 만들지 않는다. 부재가 결정이다 — 이 표를 읽어야 하는 주체는
-- RLS를 우회하는 service_role뿐이다.

-- profiles_touch와 같은 일을 하지만 따로 둔다. 선언 스키마 파일은 이름 순으로
-- 적용돼 이 파일이 profiles.sql보다 먼저 오고, 남의 함수를 참조하면 그 순서에
-- 묶인다.
create function public.apple_credentials_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger apple_credentials_touch
  before update on public.apple_credentials
  for each row execute function public.apple_credentials_touch();

-- authenticated·anon에는 아무것도 주지 않는다. 명시적 grant가 없으면 Data API
-- 롤은 테이블에 닿지 못한다(auto_expose_new_tables가 unset).
grant select, insert, update, delete on table public.apple_credentials to service_role;
