-- schemas/apple_credentials.sql와 동일 상태. db diff 출력에서 Supabase 기본
-- 권한이 만든 줄(anon·authenticated의 MAINTAIN/REFERENCES/TRIGGER/TRUNCATE,
-- service_role의 ALL)은 걷어냈다 — create table이 alter default privileges로
-- 자동으로 붙이는 것이라 우리 결정으로 커밋하면 잘못된 신호가 된다.

create table public.apple_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apple_credentials enable row level security;

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

grant select, insert, update, delete on table public.apple_credentials to service_role;
