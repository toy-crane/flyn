-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.saved_expressions (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id      uuid                     DEFAULT auth.uid() NOT NULL,
  kind         text                     NOT NULL,
  episode_id   uuid                     NOT NULL,
  message_id   uuid,
  utterance_at smallint,
  english      text                     NOT NULL,
  meaning      text,
  speaker      text,
  original     text,
  entries      jsonb,
  created_at   timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.saved_expressions IS 'One English sentence the person saved by hand. Shown in the app as 표현 노트.';

COMMENT ON COLUMN public.saved_expressions.kind IS 'Where it was saved from: utterance, correction or guidance. Decides which columns are filled.';

COMMENT ON COLUMN public.saved_expressions.episode_id IS 'The script this came from. Survives deleting the run, so the card keeps its story and number.';

COMMENT ON COLUMN public.saved_expressions.message_id IS 'The message it sat next to. Null once that message is gone; the row stays.';

COMMENT ON COLUMN public.saved_expressions.utterance_at IS 'Which utterance inside the scene, for character lines only.';

COMMENT ON COLUMN public.saved_expressions.english IS 'The saved English sentence.';

COMMENT ON COLUMN public.saved_expressions.meaning IS 'One Korean line saying what the character said. Made once when saved, for character lines only.';

COMMENT ON COLUMN public.saved_expressions.speaker IS 'Who said it, for character lines only.';

COMMENT ON COLUMN public.saved_expressions.original IS 'What the person wrote, for corrections and guidance only.';

COMMENT ON COLUMN public.saved_expressions.entries IS 'Which parts were off, what replaced them and why, as one JSON array. Corrections and guidance only.';

ALTER TABLE public.saved_expressions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_english_usable CHECK (length(btrim(english)) >= 1 AND length(btrim(english)) <= 1000);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_entries_array CHECK (entries IS NULL OR jsonb_typeof(entries) = 'array'::text);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_entries_size CHECK (entries IS NULL OR octet_length(entries::text) <= 8192);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE RESTRICT;

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_kind_known CHECK (kind = ANY (ARRAY['utterance'::text, 'correction'::text, 'guidance'::text]));

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_learning_whole CHECK ((kind <> 'utterance'::text) = (original IS NOT NULL) AND (kind <> 'utterance'::text) = (entries IS NOT NULL));

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_meaning_usable CHECK (meaning IS NULL OR length(btrim(meaning)) >= 1 AND length(btrim(meaning)) <= 1000);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.episode_messages(id) ON DELETE SET NULL;

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_original_usable CHECK (original IS NULL OR length(btrim(original)) >= 1 AND length(btrim(original)) <= 1000);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_pkey PRIMARY KEY (id);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_speaker_usable CHECK (speaker IS NULL OR length(btrim(speaker)) >= 1 AND length(btrim(speaker)) <= 60);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_utterance_at_usable CHECK (utterance_at IS NULL OR utterance_at >= 0 AND utterance_at <= 100);

ALTER TABLE public.saved_expressions
  ADD CONSTRAINT saved_expressions_utterance_whole CHECK ((kind = 'utterance'::text) = (meaning IS NOT NULL) AND (kind = 'utterance'::text) = (speaker IS
    NOT NULL) AND (kind = 'utterance'::text) = (utterance_at IS NOT NULL));

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.saved_expressions TO anon;

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.saved_expressions TO authenticated;

-- Hosted defaults may include table-wide INSERT, which overrides column grants.
REVOKE INSERT ON public.saved_expressions FROM authenticated;

GRANT INSERT (english, entries, episode_id, kind, meaning, message_id, original, speaker, utterance_at) ON public.saved_expressions TO authenticated;

GRANT ALL ON public.saved_expressions TO service_role;

CREATE INDEX saved_expressions_user_id_created_at_idx ON public.saved_expressions (user_id, created_at DESC);

CREATE INDEX saved_expressions_episode_id_idx ON public.saved_expressions (episode_id);

CREATE UNIQUE INDEX saved_expressions_one_per_source_idx ON public.saved_expressions (message_id, COALESCE(utterance_at::integer, '-1'::integer))
  WHERE message_id IS NOT NULL;

CREATE POLICY saved_expressions_erase_own ON public.saved_expressions
  FOR DELETE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY saved_expressions_save_own ON public.saved_expressions
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM (public.episode_messages written
     JOIN public.episode_plays played ON ((played.id = written.play_id)))
  WHERE ((written.id = saved_expressions.message_id) AND (written.user_id = ( SELECT auth.uid() AS uid)) AND (played.episode_id = saved_expressions.episode_id) AND (written.role =
        CASE
            WHEN (saved_expressions.kind = 'utterance'::text) THEN 'assistant'::text
            ELSE 'user'::text
        END)))) AND ((kind = 'utterance'::text) OR (EXISTS ( SELECT 1
   FROM public.episode_expression_results judged
  WHERE ((judged.message_id = saved_expressions.message_id) AND (judged.status = 'corrected'::text)))))));

CREATE POLICY saved_expressions_select_own ON public.saved_expressions
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));