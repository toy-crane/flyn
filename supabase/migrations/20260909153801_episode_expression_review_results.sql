-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

DROP POLICY episode_corrections_select_own ON public.episode_corrections;

DROP POLICY episode_corrections_write_own_message ON public.episode_corrections;

DROP TABLE public.episode_corrections;

CREATE TABLE public.episode_expression_results (
  message_id      uuid  NOT NULL,
  user_id         uuid  DEFAULT auth.uid() NOT NULL,
  status          text  NOT NULL,
  fixed           text,
  entries         jsonb,
  situation       text,
  meaning         text,
  example         text,
  example_meaning text
);

ALTER TABLE public.episode_expression_results
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_expression_results
  ADD CONSTRAINT episode_expression_results_complete CHECK (
CASE
    WHEN status = 'corrected'::text THEN num_nonnulls(fixed, entries, situation, meaning, example, example_meaning) = 6 AND length(btrim(fixed)) >= 1 AND length(btrim(fixed)) <=
      1000 AND jsonb_typeof(entries) = 'array'::text AND jsonb_array_length(entries) > 0 AND octet_length(entries::text) <= 65536 AND length(btrim(situation)) >= 1 AND
      length(btrim(situation)) <= 160 AND length(btrim(meaning)) >= 1 AND length(btrim(meaning)) <= 1000 AND length(btrim(example)) >= 1 AND length(btrim(example)) <= 1000 AND
      length(btrim(example_meaning)) >= 1 AND length(btrim(example_meaning)) <= 1000
    ELSE num_nonnulls(fixed, entries, situation, meaning, example, example_meaning) = 0
END);

ALTER TABLE public.episode_expression_results
  ADD CONSTRAINT episode_expression_results_message_id_user_id_fkey FOREIGN KEY (message_id, user_id) REFERENCES public.episode_messages(id, user_id) ON DELETE CASCADE;

ALTER TABLE public.episode_expression_results
  ADD CONSTRAINT episode_expression_results_pkey PRIMARY KEY (message_id);

ALTER TABLE public.episode_expression_results
  ADD CONSTRAINT episode_expression_results_status_known CHECK (status = ANY (ARRAY['corrected'::text, 'natural'::text, 'unclear'::text]));

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_expression_results TO anon;

GRANT INSERT (entries, example, example_meaning, fixed, meaning, message_id, situation, status) ON public.episode_expression_results TO authenticated;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_expression_results TO authenticated;

GRANT ALL ON public.episode_expression_results TO service_role;

CREATE INDEX episode_expression_results_user_id_idx ON public.episode_expression_results (user_id);

CREATE POLICY episode_expression_results_select_own ON public.episode_expression_results
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY episode_expression_results_write_own_message ON public.episode_expression_results
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_messages written
  WHERE ((written.id = episode_expression_results.message_id) AND (written.role = 'user'::text))))));