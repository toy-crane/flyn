-- schemas/profiles.sql와 동일 상태. db diff 출력에서 Supabase 기본 권한이 만든
-- 줄(anon·authenticated의 MAINTAIN/REFERENCES/TRIGGER/TRUNCATE, service_role의
-- ALL)은 걷어냈다 — create table이 alter default privileges로 자동으로 붙이는
-- 것이라 우리 결정으로 커밋하면 잘못된 신호가 된다(scratch_notes도 이미 같은
-- 권한을 갖고 있다). 남은 grant만이 이 테이블이 실제로 정한 것이다.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(display_name) between 1 and 50)
);

create function public.profiles_normalize()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.display_name := btrim(new.display_name);
  return new;
end;
$$;

create trigger profiles_normalize
  before insert or update on public.profiles
  for each row execute function public.profiles_normalize();

create function public.profiles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.profiles_touch();

alter table public.profiles enable row level security;

create policy "own profile readable" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "own profile updatable" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.sync_profile_email();
