-- schemas/apple_credentials.sql와 동일 상태.
--
-- **db diff가 revoke를 만들어 주지 않는다.** 생성물에는 service_role GRANT만
-- 있었고, create function이 EXECUTE를 PUBLIC에 기본으로 주는 사실은 diff에
-- 잡히지 않는다 — 그대로 커밋했으면 anon과 authenticated가 두 함수를 그대로
-- 부를 수 있었다. 아래 revoke 두 줄은 손으로 채운 것이고, 이 마이그레이션에서
-- 가장 중요한 줄이다.

create schema private;

create table private.apple_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.apple_credentials enable row level security;

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

revoke execute on function public.store_apple_refresh_token(uuid, text) from public;
revoke execute on function public.read_apple_refresh_token(uuid) from public;

grant execute on function public.store_apple_refresh_token(uuid, text) to service_role;
grant execute on function public.read_apple_refresh_token(uuid) to service_role;
