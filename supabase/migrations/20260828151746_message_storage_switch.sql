-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP FUNCTION public.complete_episode_run_fallback(episode_id uuid, messages jsonb);

DROP FUNCTION public.complete_episode_run(episode_id uuid, messages jsonb);

DROP FUNCTION public.episode_run_extends_snapshot(stored_messages jsonb, snapshot_messages jsonb);

DROP FUNCTION public.episode_run_matches_ending(messages jsonb, kind text, outcome text);

DROP FUNCTION public.save_episode_run_fallback(episode_id uuid, messages jsonb);

DROP FUNCTION public.save_episode_run(episode_id uuid, messages jsonb);

DROP POLICY episode_runs_select_own ON public.episode_runs;

DROP TABLE public.episode_runs;

ALTER TABLE public.episode_corrections
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.episode_messages
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.episode_plays
  ALTER COLUMN user_id SET DEFAULT auth.uid();

REVOKE INSERT ON public.episode_corrections FROM authenticated;

GRANT INSERT (corrected, message_id, original, reason) ON public.episode_corrections TO authenticated;

REVOKE INSERT ON public.episode_messages FROM authenticated;

GRANT INSERT ("position", id, parts, play_id, ROLE) ON public.episode_messages TO authenticated;

REVOKE INSERT (episode_id, user_id) ON public.episode_plays FROM authenticated;

GRANT INSERT (episode_id) ON public.episode_plays TO authenticated;