-- 인증 사용자와 1:1인 비공개 프로필. 공개 사용자 카드가 아니다(GLOSSARY.md).
-- 이 파일을 고친 뒤 bun run db:diff <name>으로 마이그레이션을 생성한다.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- 원본은 auth.users다. 생성 때 복사하고, Auth 이메일이 바뀌면 트리거가 따라간다.
  --
  -- not null이 무엇을 거는가: 이메일 없는 사용자가 생기면 가입 자체가 실패한다.
  -- 지금 세 경로가 모두 이메일을 보장하고(config.toml의 apple email_optional =
  -- false, auth.sms enable_signup = false), 빈 문자열을 조용히 채우는 것보다
  -- 크게 깨지는 쪽이 §2의 의도다 — 프로필 없는 사용자를 만들지 않는다.
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- display_name이 null인 상태가 곧 "온보딩 전"이다. null에는 이 check가 걸리지
  -- 않는다(null은 constraint를 통과한다).
  constraint profiles_display_name_length
    check (char_length(display_name) between 1 and 50)
);

-- 저장 값은 앞뒤 공백을 제거한 값이다. 공백뿐인 이름은 여기서 ''가 되어 위
-- check가 거부한다 — null로 바꾸지 않는다. 조용히 이름을 지우면 사용자가 다음
-- 실행에서 영문도 모른 채 온보딩으로 되돌아간다.
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

-- 클라이언트에는 updated_at 열 권한이 없다(아래 grant). 갱신은 여기서만 일어난다.
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

-- RLS와 열 권한을 함께 쓴다. 정책은 어느 **행**을 만지는지만 가르고, 그 행의
-- 어느 **열**을 바꾸는지는 못 막는다 — email·id를 지키는 것은 아래 grant다.
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

-- 생성·삭제는 클라이언트 권한이 아니다. 생성은 auth.users 트리거가, 삭제는
-- on delete cascade가 맡는다(§1).
grant select, insert, update, delete on table public.profiles to service_role;

-- 프로필 행은 사용자 생성과 같은 경계에서 생긴다(§2). 세션이 앱에 돌아왔을 때
-- 행은 이미 존재해야 하며, 앱은 행이 없으면 온보딩으로 가장하지 않고 무결성
-- 오류를 낸다.
--
-- security definer인 이유: 트리거를 실행하는 것은 supabase_auth_admin이고 그
-- 롤에는 public.profiles 권한이 없다. 소유자(postgres) 권한으로 돌아 RLS도 함께
-- 우회한다.
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

-- 이메일 변경 UI는 만들지 않지만(§가정) Auth 원본이 바뀌면 복제본이 따라간다.
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
