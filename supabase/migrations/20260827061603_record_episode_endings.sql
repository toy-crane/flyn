-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.finish_episode (
  season  smallint,
  episode smallint,
  kind    text,
  outcome text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
  finished integer;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  if exists (
    select 1
    from public.episode_endings e
    where e.user_id = player
      and e.season = finish_episode.season
      and e.episode = finish_episode.episode
  ) then
    return;
  end if;

  select count(*) into finished
  from public.episode_endings e
  where e.user_id = player
    and e.season = finish_episode.season;

  -- 화는 순서대로만 끝난다. 다음에 끝낼 수 있는 화는 언제나 하나뿐이다.
  if finish_episode.episode <> finished + 1 then
    raise exception 'Episode % is not the next episode of season %.',
      finish_episode.episode, finish_episode.season
      using errcode = '22023';
  end if;

  insert into public.episode_endings (user_id, season, episode, kind, outcome)
  values (
    player,
    finish_episode.season,
    finish_episode.episode,
    finish_episode.kind,
    finish_episode.outcome
  );
end;
$function$;

COMMENT ON FUNCTION public.finish_episode(smallint,smallint,text,text) IS 'Records the ending of the caller''s current episode. Refuses to skip ahead and never overwrites a recorded ending.';

REVOKE ALL ON FUNCTION public.finish_episode(smallint, smallint, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.finish_episode(smallint, smallint, text, text) TO authenticated;

CREATE TABLE public.episode_endings (
  user_id     uuid                     NOT NULL,
  season      smallint                 NOT NULL,
  episode     smallint                 NOT NULL,
  kind        text                     NOT NULL,
  outcome     text                     NOT NULL,
  finished_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_endings IS 'One row per finished episode. Progress is derived from these rows; running episodes are never stored.';

COMMENT ON COLUMN public.episode_endings.season IS 'Season the episode belongs to. Story memory continues within one season.';

COMMENT ON COLUMN public.episode_endings.episode IS 'Episode number inside the season. The script itself lives in the API server.';

COMMENT ON COLUMN public.episode_endings.kind IS 'How the incident ended: 성공, 타협 or 실패.';

COMMENT ON COLUMN public.episode_endings.outcome IS 'One Korean line naming what happened, written by the model that closed the scene.';

ALTER TABLE public.episode_endings
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_episode_usable CHECK (episode >= 1);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_kind_known CHECK (kind = ANY (ARRAY['성공'::text, '타협'::text, '실패'::text]));

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_outcome_usable CHECK (length(btrim(outcome)) >= 1 AND length(btrim(outcome)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_pkey PRIMARY KEY (user_id, season, episode);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_season_usable CHECK (season >= 1);

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