ALTER TABLE public.episode_goals ADD COLUMN achieved_message_id text;
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_achieved_message_fkey FOREIGN KEY (episode_id, achieved_message_id) REFERENCES public.episode_messages(episode_id, id);
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_achieved_together CHECK ((achieved_at IS NULL) = (achieved_message_id IS NULL));
CREATE TABLE public.message_feedback (episode_id uuid NOT NULL, message_id text NOT NULL, source_text text NOT NULL, verdict text NOT NULL, improved_sentence text, reasons text[] DEFAULT '{}'::text[] NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_improvable_has_sentence CHECK ((verdict = 'improvable'::text) = (improved_sentence IS NOT NULL));
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_improved_sentence_length CHECK (char_length(improved_sentence) >= 1 AND char_length(improved_sentence) <= 20000);
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_message_fkey FOREIGN KEY (episode_id, message_id) REFERENCES public.episode_messages(episode_id, id) ON DELETE CASCADE;
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_pkey PRIMARY KEY (episode_id, message_id);
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_reasons_count CHECK (cardinality(reasons) >= 0 AND cardinality(reasons) <= 10);
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_source_text_length CHECK (char_length(source_text) >= 1 AND char_length(source_text) <= 20000);
ALTER TABLE public.message_feedback ADD CONSTRAINT message_feedback_verdict CHECK (verdict = ANY (ARRAY['clear'::text, 'improvable'::text]));
-- diff는 새 테이블에 딸려 오는 기본 권한을 되돌리지 않는다. 선언 스키마의
-- revoke 두 줄을 직접 옮겨 적지 않으면 앱 역할이 판정을 통째로 truncate할 수
-- 있고, RLS는 그것을 가르지 않는다.
REVOKE ALL ON public.message_feedback FROM anon;
REVOKE ALL ON public.message_feedback FROM authenticated;
GRANT SELECT ON public.message_feedback TO authenticated;
GRANT ALL ON public.message_feedback TO service_role;
CREATE POLICY "own message feedback readable" ON public.message_feedback FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.episodes
  WHERE ((episodes.id = message_feedback.episode_id) AND (episodes.user_id = ( SELECT auth.uid() AS uid))))));
