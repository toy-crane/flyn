-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.utterance_meanings (
  message_id   uuid                     NOT NULL,
  utterance_at smallint                 NOT NULL,
  user_id      uuid                     DEFAULT auth.uid() NOT NULL,
  meaning      text,
  claim_token  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  expires_at   timestamp with time zone DEFAULT (clock_timestamp() + '00:00:30'::interval) NOT NULL
);

ALTER TABLE public.utterance_meanings
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.utterance_meanings
  ADD CONSTRAINT utterance_meanings_meaning_check CHECK (meaning IS NULL OR length(btrim(meaning)) >= 1 AND length(btrim(meaning)) <= 1000);

ALTER TABLE public.utterance_meanings
  ADD CONSTRAINT utterance_meanings_message_id_user_id_fkey FOREIGN KEY (message_id, user_id) REFERENCES public.episode_messages(id, user_id) ON DELETE CASCADE;

ALTER TABLE public.utterance_meanings
  ADD CONSTRAINT utterance_meanings_pkey PRIMARY KEY (message_id, utterance_at);

ALTER TABLE public.utterance_meanings
  ADD CONSTRAINT utterance_meanings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.utterance_meanings
  ADD CONSTRAINT utterance_meanings_utterance_at_check CHECK (utterance_at >= 0 AND utterance_at <= 100);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.utterance_meanings TO anon;

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.utterance_meanings TO authenticated;

-- 열 단위 grant는 환경의 전체 INSERT/UPDATE 기본 권한보다 좁아야 한다.
REVOKE INSERT, UPDATE ON public.utterance_meanings FROM authenticated;

GRANT INSERT (claim_token, meaning, message_id, utterance_at) ON public.utterance_meanings TO authenticated;

GRANT UPDATE (claim_token, expires_at, meaning) ON public.utterance_meanings TO authenticated;

GRANT ALL ON public.utterance_meanings TO service_role;

CREATE INDEX utterance_meanings_user_id_idx ON public.utterance_meanings (user_id);

CREATE POLICY utterance_meanings_delete_pending ON public.utterance_meanings
  FOR DELETE
  TO authenticated
  USING (((( SELECT auth.uid() AS uid) = user_id) AND (meaning IS NULL)));

CREATE POLICY utterance_meanings_insert_own ON public.utterance_meanings
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_messages m
  WHERE ((m.id = utterance_meanings.message_id) AND (m.role = 'assistant'::text))))));

CREATE POLICY utterance_meanings_read_own ON public.utterance_meanings
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY utterance_meanings_update_pending ON public.utterance_meanings
  FOR UPDATE
  TO authenticated
  USING (((( SELECT auth.uid() AS uid) = user_id) AND (meaning IS NULL)))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));