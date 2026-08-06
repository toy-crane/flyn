-- 인증 사용자와 1:1인 비공개 프로필. 공개 사용자 카드가 아니다(GLOSSARY.md).
-- 이 파일을 고친 뒤 bun run db:diff <name>으로 마이그레이션을 생성한다.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- 원본은 auth.users다. 생성 때 복사하고, Auth 이메일이 바뀌면 트리거가 따라간다.
  --
  -- not null이 무엇을 거는가: 이메일 없는 사용자가 생기면 가입 자체가 실패한다.
  -- 지금 세 경로가 모두 이메일을 보장하고(config.toml의 apple email_optional =
  -- false, auth.sms enable_signup = false), 빈 문자열을 조용히 채우는 것보다
  -- 크게 깨지는 쪽을 택한다 — 프로필 없는 사용자를 만들지 않는다.
  email text not null,
  display_name text,
  -- null이면 아이디 온보딩 전이다. 값이 생기면 아래 제약과 고유 인덱스가
  -- 형식과 중복을 최종 방어한다.
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- display_name이 null인 상태가 곧 "온보딩 전"이다. null에는 이 check가 걸리지
  -- 않는다(null은 constraint를 통과한다).
  --
  -- 상한 500은 UX 규칙이 아니라 **남용 방지 backstop**이다. 사람이 보는 길이는
  -- 입력칸의 maxLength가 grapheme 단위로 막는데, 여기서 같은 숫자를 코드 포인트로
  -- 다시 세면 단위가 달라 영원히 어긋난다 — 그래서 여기는 넉넉히 두고 다투지
  -- 않는다. 50 grapheme이 만들 수 있는 최대치보다 크게 잡았다.
  constraint profiles_display_name_length
    check (char_length(display_name) between 1 and 500),
  constraint profiles_username_format
    check (
      username is null
      or (
        char_length(username) between 4 and 20
        and username ~ '^[a-z0-9][a-z0-9_.]{2,18}[a-z0-9]$'
        and username !~ '\.\.'
        and username not in (
          'admin',
          'administrator',
          'flyn',
          'official',
          'root',
          'staff',
          'support',
          'system'
        )
      )
    )
);

create unique index profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

-- 저장 값은 앞뒤의 보이지 않는 문자를 잘라낸 값이다. 그것뿐인 이름은 여기서
-- ''가 되어 위 check가 거부한다 — null로 바꾸지 않는다. 조용히 이름을 지우면
-- 사용자가 다음 실행에서 영문도 모른 채 온보딩으로 되돌아간다.
--
-- **앱의 display-name.ts와 같은 집합이어야 한다.** 한쪽만 바뀌면 앱이 막는
-- 이름을 DB가 받거나 그 반대가 된다. `btrim(x)`는 인자가 하나면 ASCII 스페이스
-- 하나만 지워서, 탭·NBSP·전각공백은 물론 제로폭 공백까지 통과시켰다.
--
-- 잘라내는 것은 **양 끝뿐이다.** 가운데는 둔다 — U+200D(ZWJ)가 이모지를 잇는
-- 문자라 걷어내면 가족 이모지가 쪼개진다.
create function public.profiles_normalize()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  invisible constant text :=
    '[[:cntrl:] ' || U&'\00a0\1680\2000-\200d\2028\2029\202f\205f\3000\feff' || ']';
begin
  new.display_name := regexp_replace(
    new.display_name,
    '^' || invisible || '+|' || invisible || '+$',
    '',
    'g'
  );
  new.username := lower(new.username);
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
--
-- revoke가 먼저 오는 이유: create table이 anon·authenticated에 Dxtm(TRUNCATE·
-- REFERENCES·TRIGGER·MAINTAIN)을 자동으로 붙이는데, RLS는 테이블 전체 연산을
-- 가르지 않아 truncate가 정책을 그대로 지나간다. 권한을 열거해 지우면 지금 모르는
-- 권한(MAINTAIN이 PG17에서 그랬듯)을 놓치므로 `revoke all`로 0에서 시작한다.
-- **순서가 뒤집히면 아래 grant까지 함께 지워진다.**
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, username) on table public.profiles to authenticated;

-- 생성·삭제는 클라이언트 권한이 아니다. 생성은 auth.users 트리거가, 삭제는
-- on delete cascade가 맡는다.
grant select, insert, update, delete on table public.profiles to service_role;

-- 입력 중 확인은 UX를 위한 힌트다. 최종 중복 방어는 위 고유 인덱스가 맡는다.
-- SECURITY DEFINER로 모든 프로필을 확인하되, 호출자에게 다른 사용자의 아이디를
-- 열거할 수 있는 행 접근 권한은 주지 않는다.
create function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate_username is not null
    and char_length(lower(candidate_username)) between 4 and 20
    and lower(candidate_username) ~ '^[a-z0-9][a-z0-9_.]{2,18}[a-z0-9]$'
    and lower(candidate_username) !~ '\.\.'
    and lower(candidate_username) not in (
      'admin',
      'administrator',
      'flyn',
      'official',
      'root',
      'staff',
      'support',
      'system'
    )
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(candidate_username)
        and id <> (select auth.uid())
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to authenticated;
grant execute on function public.is_username_available(text) to service_role;

-- 프로필 행은 사용자 생성과 같은 경계에서 생긴다. 세션이 앱에 돌아왔을 때
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

-- 이메일 변경 UI는 없지만 Auth 원본이 바뀌면 복제본이 따라간다.
--
-- **null은 따라가지 않는다.** auth.users.email은 nullable인데 profiles.email은
-- not null이라, 마지막 이메일 신원이 풀리는 등으로 원본이 null이 되면 이
-- 트리거가 23502를 일으켜 **그 auth 작업 전체가 실패한다** — 사용자에게는
-- 정체불명의 "Database error"로 보인다.
--
-- 대가는 프로필에 직전 이메일이 남는 것이다. 열의 not null을 지키면서
-- 인증 트랜잭션을 깨지 않는 최소 선택이라 이쪽을 택한다.
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
  when (new.email is not null and new.email is distinct from old.email)
  execute function public.sync_profile_email();
