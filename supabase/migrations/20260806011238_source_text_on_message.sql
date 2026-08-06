ALTER TABLE public.message_feedback DROP CONSTRAINT message_feedback_source_text_length;
ALTER TABLE public.message_feedback DROP COLUMN source_text;
ALTER TABLE public.episode_messages ADD COLUMN source_text text;
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_source_text_length CHECK (source_text IS NULL OR char_length(source_text) >= 1 AND char_length(source_text) <= 20000);
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_source_text_user_only CHECK (source_text IS NULL OR role = 'user'::text);
