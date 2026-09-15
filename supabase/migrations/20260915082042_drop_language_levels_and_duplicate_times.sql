-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP FUNCTION
  public.finish_episode(story_play_id uuid, episode_id uuid, kind text, outcome text, memory_choice text, memory_relationship text, memory_question text, language_level text);

-- 삭제 이유: 2026-09-15 사용자가 읽는 곳이 없는 플레이 시작 시각 삭제를 결정했다. 같은 순간은 created_at에 남는다.
ALTER TABLE public.episode_plays DROP COLUMN started_at;

-- 삭제 이유: 2026-09-15 사용자가 읽는 곳이 없는 아이디 변경 시각 삭제를 결정했다. 변경 제한은 username_locked_until이 판정한다.
ALTER TABLE public.profiles DROP COLUMN username_changed_at;

-- 삭제 이유: 2026-09-15 사용자가 읽는 곳이 없는 이전 아이디 반납 시각 삭제를 결정했다. 보호는 protected_until이 판정한다.
ALTER TABLE public.retired_usernames DROP COLUMN retired_at;

-- 삭제 이유: 2026-09-15 사용자가 created_at과 같은 회차 시작 시각 삭제를 결정했다. 대화 기록은 created_at으로 시작 시각과 순서를 읽는다.
ALTER TABLE public.story_plays DROP COLUMN started_at;

DROP TRIGGER language_levels_set_timestamps ON public.language_levels;

DROP POLICY language_levels_select_own ON public.language_levels;

-- 삭제 이유: 2026-09-15 사용자가 앱·서버·프롬프트 어디서도 읽지 않는 계정별 영어 수준 관찰 삭제를 결정했다. 결말과 이야기 기억은 episode_plays에 남는다.
DROP TABLE public.language_levels;

CREATE FUNCTION public.finish_episode (
  story_play_id       uuid,
  episode_id          uuid,
  kind                text,
  outcome             text,
  memory_choice       text DEFAULT NULL::text,
  memory_relationship text DEFAULT NULL::text,
  memory_question     text DEFAULT NULL::text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
  recorded integer;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  -- 회차가 이 사람 것인지도 이 한 줄이 함께 답한다. `security definer`라 RLS가
  -- 걸리지 않으므로, 남의 회차를 닫는 요청을 막는 것이 여기다.
  if not public.episode_is_current(
    finish_episode.episode_id,
    finish_episode.story_play_id
  ) then
    raise exception 'Episode % is not the current episode in run %.',
      finish_episode.episode_id, finish_episode.story_play_id
      using errcode = '22023';
  end if;

  -- 아직 플레이를 열지 않은 채 결말이 도착할 수 있다. 그때는 이 한 문장이
  -- 플레이를 만들면서 닫는다.
  insert into public.episode_plays (
    user_id,
    story_play_id,
    episode_id,
    ending_kind,
    ending_outcome,
    memory_choice,
    memory_relationship,
    memory_question,
    finished_at
  )
  values (
    player,
    finish_episode.story_play_id,
    finish_episode.episode_id,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question,
    now()
  )
  on conflict on constraint episode_plays_one_per_story_play do update
  set ending_kind = excluded.ending_kind,
      ending_outcome = excluded.ending_outcome,
      memory_choice = excluded.memory_choice,
      memory_relationship = excluded.memory_relationship,
      memory_question = excluded.memory_question,
      finished_at = excluded.finished_at
  where public.episode_plays.finished_at is null;

  get diagnostics recorded = row_count;

  return recorded = 1;
end;
$function$;

COMMENT ON FUNCTION public.finish_episode(uuid,uuid,text,text,text,text,text) IS 'Records the ending and story memory of the current episode in the caller''s run. Returns true only to the request that closed the play.';

-- 운영 환경은 새 함수의 EXECUTE를 API 역할에 직접 준다. PUBLIC 회수로는 그
-- 권한이 사라지지 않아 세 역할을 함께 회수한다.
REVOKE ALL ON FUNCTION public.finish_episode(uuid, uuid, text, text, text, text, text) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.finish_episode(uuid, uuid, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_username_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if old.username is not null
    and old.username_locked_until is not null
    and old.username_locked_until > now()
  then
    raise exception 'Account id is locked until %', old.username_locked_until
      using errcode = 'check_violation';
  end if;

  if new.username is not null and public.is_protected_username(new.username, new.id) then
    -- The same code the unique index raises. To the person asking, an id somebody
    -- else gave up last week and an id somebody else holds today are one answer:
    -- not yours, pick another.
    raise exception 'Account id % is still protected', new.username
      using errcode = 'unique_violation';
  end if;

  -- A first id costs nothing and retires nothing: there is no previous id to hold
  -- back, and locking here would trap someone in the value they just typed.
  if old.username is null then
    return new;
  end if;

  -- Taking back an id this account retired earlier releases it, so the row does
  -- not sit there blocking the account that now holds the id.
  delete from public.retired_usernames
  where public.retired_usernames.username = new.username
    and public.retired_usernames.retired_by = new.id;

  -- `on conflict` covers the same id being retired twice: a -> b -> a -> b leaves
  -- one row for `b`, protected from the most recent release rather than the first.
  insert into public.retired_usernames (username, retired_by, protected_until)
  values (old.username, new.id, now() + public.username_change_interval())
  on conflict (username) do update
  set retired_by = excluded.retired_by,
      protected_until = excluded.protected_until;

  new.username_locked_until := now() + public.username_change_interval();

  return new;
end;
$function$;