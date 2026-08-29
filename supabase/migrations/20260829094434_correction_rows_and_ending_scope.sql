-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

DROP POLICY episode_corrections_write_own_message ON public.episode_corrections;

ALTER TABLE public.episode_corrections
  ADD COLUMN fixed text NOT NULL;

COMMENT ON COLUMN public.episode_corrections.fixed IS 'The matching part of the corrected sentence.';

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_fixed_usable CHECK (length(btrim(fixed)) >= 1 AND length(btrim(fixed)) <= 1000);

ALTER TABLE public.episode_corrections
  ADD COLUMN pattern text NOT NULL;

COMMENT ON COLUMN public.episode_corrections.pattern IS 'Which rule this is, as an English kebab-case key. Never shown; it keeps the same rule from arriving twice in one episode.';

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_pattern_usable CHECK (length(btrim(pattern)) >= 1 AND length(btrim(pattern)) <= 120);

REVOKE INSERT (corrected, message_id, original, reason) ON public.episode_corrections FROM authenticated;

GRANT INSERT (corrected, fixed, message_id, original, pattern, reason) ON public.episode_corrections TO authenticated;

CREATE POLICY episode_corrections_write_own_message ON public.episode_corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_messages written
  WHERE ((written.id = episode_corrections.message_id) AND (written.role = 'user'::text))))));