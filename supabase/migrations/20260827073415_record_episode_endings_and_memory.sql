-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.finish_episode (
  season              smallint,
  episode             smallint,
  kind                text,
  outcome             text,
  memory_choice       text     DEFAULT NULL::text,
  memory_relationship text     DEFAULT NULL::text,
  memory_question     text     DEFAULT NULL::text,
  language_level      text     DEFAULT NULL::text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
  last_finished integer;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  -- 마지막으로 끝낸 화를 기준으로 삼는다. 개수로 세면 중간의 한 행이 사라졌을
  -- 때 다음 화가 이미 있는 번호를 가리켜 그 시즌이 영영 막힌다.
  select coalesce(max(e.episode), 0) into last_finished
  from public.episode_endings e
  where e.user_id = player
    and e.season = finish_episode.season;

  -- 화는 순서대로만 끝난다. 다음에 끝낼 수 있는 화는 언제나 하나뿐이고, 이미
  -- 끝낸 화를 다시 보내는 것은 규칙 위반이 아니라 같은 사실의 재도착이다.
  if
    finish_episode.episode <> last_finished + 1
    and finish_episode.episode > last_finished
  then
    raise exception 'Episode % is not the next episode of season %.',
      finish_episode.episode, finish_episode.season
      using errcode = '22023';
  end if;

  -- 같은 화의 결말이 동시에 두 번 도착해도 뒤의 것이 오류가 되지 않는다. 먼저
  -- 도착한 판정이 그 시즌의 사실로 남고 나중 것은 조용히 지나간다.
  insert into public.episode_endings (
    user_id,
    season,
    episode,
    kind,
    outcome,
    memory_choice,
    memory_relationship,
    memory_question
  )
  values (
    player,
    finish_episode.season,
    finish_episode.episode,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question
  )
  -- 충돌 대상을 열 이름으로 적으면 같은 이름의 인자와 헷갈린다. 기본키를
  -- 이름으로 가리키면 그 모호함이 없다.
  on conflict on constraint episode_endings_pkey do nothing;

  -- 언어 수준은 시즌이 아니라 이 사람에게 붙는다. 화가 끝날 때마다 그 시점의
  -- 관찰로 덮어쓴다. 이번 장면이 아무 말도 남기지 않았으면 지난 관찰을 지우지
  -- 않고 그대로 둔다.
  if finish_episode.language_level is not null then
    insert into public.language_levels (user_id, level)
    values (player, finish_episode.language_level)
    on conflict on constraint language_levels_pkey do update
    set level = excluded.level,
        observed_at = now();
  end if;
end;
$function$;

COMMENT ON FUNCTION public.finish_episode(smallint,smallint,text,text,text,text,text,text) IS 'Records the ending and story memory of the caller''s current episode. Refuses to skip ahead and never overwrites a recorded ending.';

REVOKE ALL ON FUNCTION public.finish_episode(smallint, smallint, text, text, text, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.finish_episode(smallint, smallint, text, text, text, text, text, text) TO authenticated;

CREATE TABLE public.episode_endings (
  user_id             uuid                     NOT NULL,
  season              smallint                 NOT NULL,
  episode             smallint                 NOT NULL,
  kind                text                     NOT NULL,
  outcome             text                     NOT NULL,
  memory_choice       text,
  memory_relationship text,
  memory_question     text,
  finished_at         timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_endings IS 'One row per finished episode. Progress is derived from these rows; running episodes are never stored.';

COMMENT ON COLUMN public.episode_endings.season IS 'Season the episode belongs to. Story memory continues within one season.';

COMMENT ON COLUMN public.episode_endings.episode IS 'Episode number inside the season. The script itself lives in the API server.';

COMMENT ON COLUMN public.episode_endings.kind IS 'How the incident ended: 성공, 타협 or 실패.';

COMMENT ON COLUMN public.episode_endings.outcome IS 'One Korean line naming what happened, written by the model that closed the scene.';

COMMENT ON COLUMN public.episode_endings.memory_choice IS 'What the person did in this incident. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_endings.memory_relationship IS 'How the relationship changed. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_endings.memory_question IS 'The question this incident opened. Null when the closing scene left no memory lines.';

ALTER TABLE public.episode_endings
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_episode_usable CHECK (episode >= 1 AND episode <= 100);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_kind_known CHECK (kind = ANY (ARRAY['성공'::text, '타협'::text, '실패'::text]));

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_choice_usable CHECK (memory_choice IS NULL OR length(btrim(memory_choice)) >= 1 AND length(btrim(memory_choice)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_question_usable CHECK (memory_question IS NULL OR length(btrim(memory_question)) >= 1 AND length(btrim(memory_question)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_relationship_usable
    CHECK (memory_relationship IS NULL OR length(btrim(memory_relationship)) >= 1 AND length(btrim(memory_relationship)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_outcome_usable CHECK (length(btrim(outcome)) >= 1 AND length(btrim(outcome)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_pkey PRIMARY KEY (user_id, season, episode);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_season_usable CHECK (season >= 1 AND season <= 100);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Hand-written: default privileges hand every new table in `public` to anon,
-- authenticated and service_role, including TRUNCATE, which RLS does not
-- restrain. Those grants are applied by CREATE TABLE itself, so they are not a
-- schema difference and the generated diff cannot carry the revoke that
-- `supabase/schemas/60-policies.sql` declares.
REVOKE ALL ON public.episode_endings FROM anon, authenticated, service_role;

GRANT SELECT ON public.episode_endings TO authenticated;

GRANT ALL ON public.episode_endings TO service_role;

CREATE POLICY episode_endings_select_own ON public.episode_endings
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.language_levels (
  user_id     uuid                     NOT NULL,
  level       text                     NOT NULL,
  observed_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.language_levels IS 'The latest reading of how this person writes English. One row per account, overwritten as episodes end.';

COMMENT ON COLUMN public.language_levels.level IS 'One Korean line describing the level, written by the model that closed the scene.';

ALTER TABLE public.language_levels
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_level_usable CHECK (length(btrim(level)) >= 1 AND length(btrim(level)) <= 300);

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_pkey PRIMARY KEY (user_id);

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Hand-written: default privileges hand every new table in `public` to anon,
-- authenticated and service_role, including TRUNCATE, which RLS does not
-- restrain. Those grants are applied by CREATE TABLE itself, so they are not a
-- schema difference and the generated diff cannot carry the revoke that
-- `supabase/schemas/60-policies.sql` declares.
REVOKE ALL ON public.language_levels FROM anon, authenticated, service_role;

GRANT SELECT ON public.language_levels TO authenticated;

GRANT ALL ON public.language_levels TO service_role;

CREATE POLICY language_levels_select_own ON public.language_levels
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));