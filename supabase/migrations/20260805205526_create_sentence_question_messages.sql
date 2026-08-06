CREATE TABLE public.sentence_question_messages (id text NOT NULL, episode_id uuid NOT NULL, message_id text NOT NULL, role text NOT NULL, content text NOT NULL, status text DEFAULT 'complete'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.sentence_question_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 20000);
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_id_length CHECK (char_length(id) >= 1 AND char_length(id) <= 128);
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_parent_fkey FOREIGN KEY (episode_id, message_id) REFERENCES public.episode_messages(episode_id, id) ON DELETE CASCADE;
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_pkey PRIMARY KEY (episode_id, message_id, id);
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_role CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]));
ALTER TABLE public.sentence_question_messages ADD CONSTRAINT sentence_question_messages_status CHECK (status = ANY (ARRAY['complete'::text, 'stopped'::text]));
-- diff는 새 테이블에 딸려 오는 기본 권한을 되돌리지 않는다. 선언 스키마의
-- revoke 두 줄을 직접 옮겨 적지 않으면 앱 역할이 지난 질문을 통째로 truncate할
-- 수 있고, RLS는 그것을 가르지 않는다.
REVOKE ALL ON public.sentence_question_messages FROM anon;
REVOKE ALL ON public.sentence_question_messages FROM authenticated;
GRANT SELECT ON public.sentence_question_messages TO authenticated;
GRANT ALL ON public.sentence_question_messages TO service_role;
CREATE INDEX sentence_question_messages_thread_idx ON public.sentence_question_messages (episode_id, message_id, created_at, id);
CREATE POLICY "own sentence question messages readable" ON public.sentence_question_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.episodes
  WHERE ((episodes.id = sentence_question_messages.episode_id) AND (episodes.user_id = ( SELECT auth.uid() AS uid))))));
