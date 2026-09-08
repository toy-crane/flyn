-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP FUNCTION public.finish_episode(episode_id uuid, kind text, outcome text, memory_choice text, memory_relationship text, memory_question text, language_level text);

ALTER TABLE public.episode_plays
  DROP CONSTRAINT episode_plays_one_per_episode;

DROP POLICY episode_plays_start_own ON public.episode_plays;

DROP FUNCTION public.episode_is_current(target_episode uuid);

CREATE FUNCTION public.episode_is_current (
  target_episode uuid,
  target_run     uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.episodes target
    join public.story_runs run
      on run.id = episode_is_current.target_run
      and run.user_id = (select auth.uid())
      and run.story_id = target.story_id
    where target.id = episode_is_current.target_episode
      and not exists (
        select 1
        from public.episodes earlier
        left join public.episode_plays played
          on played.run_id = run.id
          and played.episode_id = earlier.id
          and played.finished_at is not null
        where earlier.story_id = target.story_id
          and earlier.number < target.number
          and played.id is null
      )
  );
$function$;

COMMENT ON FUNCTION public.episode_is_current(uuid,uuid) IS 'Reports whether this run belongs to the caller and has finished every earlier episode of the story this one belongs to.';

REVOKE ALL ON FUNCTION public.episode_is_current(uuid, uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.episode_is_current(uuid, uuid) TO authenticated;

CREATE FUNCTION public.finish_episode (
  run_id              uuid,
  episode_id          uuid,
  kind                text,
  outcome             text,
  memory_choice       text DEFAULT NULL::text,
  memory_relationship text DEFAULT NULL::text,
  memory_question     text DEFAULT NULL::text,
  language_level      text DEFAULT NULL::text
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
    finish_episode.run_id
  ) then
    raise exception 'Episode % is not the current episode in run %.',
      finish_episode.episode_id, finish_episode.run_id
      using errcode = '22023';
  end if;

  -- 아직 플레이를 열지 않은 채 결말이 도착할 수 있다. 그때는 이 한 문장이
  -- 플레이를 만들면서 닫는다.
  insert into public.episode_plays (
    user_id,
    run_id,
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
    finish_episode.run_id,
    finish_episode.episode_id,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question,
    now()
  )
  on conflict on constraint episode_plays_one_per_run do update
  set ending_kind = excluded.ending_kind,
      ending_outcome = excluded.ending_outcome,
      memory_choice = excluded.memory_choice,
      memory_relationship = excluded.memory_relationship,
      memory_question = excluded.memory_question,
      finished_at = excluded.finished_at
  where public.episode_plays.finished_at is null;

  get diagnostics recorded = row_count;

  if recorded = 1 and finish_episode.language_level is not null then
    insert into public.language_levels (user_id, level)
    values (player, finish_episode.language_level)
    on conflict on constraint language_levels_pkey do update
    set level = excluded.level,
        observed_at = now();
  end if;

  return recorded = 1;
end;
$function$;

COMMENT ON FUNCTION public.finish_episode(uuid,uuid,text,text,text,text,text,text) IS 'Records the ending and story memory of the current episode in the caller''s run. Returns true only to the request that closed the play.';

REVOKE ALL ON FUNCTION public.finish_episode(uuid, uuid, text, text, text, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.finish_episode(uuid, uuid, text, text, text, text, text, text) TO authenticated;

CREATE FUNCTION public.touch_story_run()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if new.role <> 'user' then
    return new;
  end if;

  update public.story_runs
  set last_user_message_at = greatest(
    coalesce(public.story_runs.last_user_message_at, new.created_at),
    new.created_at
  )
  from public.episode_plays played
  where played.id = new.play_id
    and public.story_runs.id = played.run_id;

  return new;
end;
$function$;

COMMENT ON FUNCTION public.touch_story_run() IS 'Moves the run''s last_user_message_at forward when a user message lands. The only writer of that column.';

REVOKE ALL ON FUNCTION public.touch_story_run() FROM PUBLIC;

CREATE TRIGGER episode_messages_touch_run
  AFTER INSERT ON public.episode_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_story_run();

COMMENT ON TABLE public.episode_plays IS 'One account playing one episode inside one run: when it started, how it ended, and the story memory it left.';

-- 이미 있는 행에 회차를 달아야 하므로 널을 허용한 채로 먼저 붙인다. 아래에서
-- 기존 기록을 회차로 묶어 채운 뒤 NOT NULL로 조인다.
ALTER TABLE public.episode_plays
  ADD COLUMN run_id uuid;

COMMENT ON COLUMN public.episode_plays.run_id IS 'The run this play belongs to. Story memory never crosses it.';

CREATE TABLE public.story_runs (
  id                   uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id              uuid                     DEFAULT auth.uid() NOT NULL,
  story_id             uuid                     NOT NULL,
  started_at           timestamp with time zone DEFAULT now() NOT NULL,
  last_user_message_at timestamp with time zone
);

COMMENT ON TABLE public.story_runs IS 'One account playing one story from episode 1. Created by the first user message, never by opening a scene.';

COMMENT ON COLUMN public.story_runs.started_at IS 'When this run began, which is when its first user message arrived. Shown as the record card title.';

COMMENT ON COLUMN public.story_runs.last_user_message_at IS 'When this run last received a user message. Written by a trigger, so reading a record cannot move it.';

ALTER TABLE public.story_runs
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.story_runs
  ADD CONSTRAINT story_runs_owned_id UNIQUE (id, user_id);

ALTER TABLE public.story_runs
  ADD CONSTRAINT story_runs_pkey PRIMARY KEY (id);

ALTER TABLE public.story_runs
  ADD CONSTRAINT story_runs_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE RESTRICT;

ALTER TABLE public.story_runs
  ADD CONSTRAINT story_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.story_runs TO anon;

GRANT INSERT (story_id) ON public.story_runs TO authenticated;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.story_runs TO authenticated;

GRANT ALL ON public.story_runs TO service_role;

CREATE INDEX story_runs_user_id_last_message_idx ON public.story_runs (user_id, last_user_message_at DESC);

CREATE INDEX story_runs_story_id_idx ON public.story_runs (story_id);

CREATE POLICY story_runs_select_own ON public.story_runs
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY story_runs_start_own ON public.story_runs
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

-- 기존 기록을 회차로 옮긴다.
--
-- 회차가 없던 시절에는 한 사람이 한 화를 한 번만 플레이할 수 있었으므로, 한
-- 사람이 한 스토리에서 남긴 기록은 언제나 한 흐름이다. 그래서 (사람, 스토리)
-- 짝마다 회차 하나를 만들어 그 아래로 통째로 옮긴다. 대화, 결말, 교정과 이야기
-- 기억은 플레이에 매달려 있어 이 이동으로 함께 따라온다. 없는 대화를 만들어
-- 채우지 않는다.
--
-- 2026-09-09 로컬 데이터에서 (사람, 화) 중복 0건, 메시지 행이 하나도 없는 플레이
-- 0건을 확인했다. 그 세기는 역할을 가리지 않으므로, 첫 장면만 저장하고 사용자가
-- 말하지 않은 플레이는 걸리지 않는다. 그런 플레이만 가진 (사람, 스토리)는 여기서
-- 회차를 받되 `last_user_message_at`이 NULL로 남아 대화 기록과 최근 대화에
-- 나오지 않는다. 사용자가 말하지 않은 진입을 기록으로 세우지 않는 수락 기준 4·9와
-- 같은 판단이다. 원격에 그런 묶음이 몇 개인지는 이 자리에서 확인하지 않았다.
-- docs/follow-ups/runs-backfilled-without-a-user-message.md를 본다.
INSERT INTO public.story_runs (user_id, story_id, started_at)
SELECT played.user_id, episode.story_id, min(played.started_at)
FROM public.episode_plays played
JOIN public.episodes episode ON episode.id = played.episode_id
GROUP BY played.user_id, episode.story_id;

UPDATE public.episode_plays played
SET run_id = run.id
FROM public.episodes episode, public.story_runs run
WHERE episode.id = played.episode_id
  AND run.user_id = played.user_id
  AND run.story_id = episode.story_id;

-- 옮긴 회차의 최근 대화 시각은 그 회차에 남은 사용자 메시지에서 읽는다. 앞으로는
-- `public.touch_story_run`이 같은 값을 민다.
UPDATE public.story_runs run
SET last_user_message_at = latest.at
FROM (
  SELECT played.run_id, max(message.created_at) AS at
  FROM public.episode_messages message
  JOIN public.episode_plays played ON played.id = message.play_id
  WHERE message.role = 'user'
  GROUP BY played.run_id
) latest
WHERE latest.run_id = run.id;

ALTER TABLE public.episode_plays
  ALTER COLUMN run_id SET NOT NULL;

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_one_per_run UNIQUE (run_id, episode_id);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_run_id_user_id_fkey FOREIGN KEY (run_id, user_id) REFERENCES public.story_runs(id, user_id) ON DELETE CASCADE;

REVOKE INSERT (episode_id) ON public.episode_plays FROM authenticated;

GRANT INSERT (episode_id, run_id) ON public.episode_plays TO authenticated;

CREATE POLICY episode_plays_start_own ON public.episode_plays
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND public.episode_is_current(episode_id, run_id)));