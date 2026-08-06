SET check_function_bodies = false;
DROP TRIGGER chat_messages_touch_room ON public.chat_messages;
DROP FUNCTION public.chat_messages_touch_room();
DROP TRIGGER chat_rooms_touch ON public.chat_rooms;
DROP FUNCTION public.chat_rooms_touch();
DROP POLICY "own chat messages readable" ON public.chat_messages;
DROP TABLE public.chat_messages;
DROP POLICY "own chat rooms creatable" ON public.chat_rooms;
DROP POLICY "own chat rooms deletable" ON public.chat_rooms;
DROP POLICY "own chat rooms readable" ON public.chat_rooms;
DROP TABLE public.chat_rooms;
CREATE FUNCTION public.episode_messages_touch_episode()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  update public.episodes
  set updated_at = now()
  where id = new.episode_id;
  return new;
end;
$function$;
CREATE TABLE public.episode_messages (id text NOT NULL, episode_id uuid NOT NULL, role text NOT NULL, content text NOT NULL, status text DEFAULT 'complete'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.episode_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 20000);
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_id_length CHECK (char_length(id) >= 1 AND char_length(id) <= 128);
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_pkey PRIMARY KEY (episode_id, id);
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_role CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]));
ALTER TABLE public.episode_messages ADD CONSTRAINT episode_messages_status CHECK (status = ANY (ARRAY['complete'::text, 'stopped'::text]));
REVOKE ALL ON public.episode_messages FROM anon;
REVOKE ALL ON public.episode_messages FROM authenticated;
GRANT SELECT ON public.episode_messages TO authenticated;
GRANT ALL ON public.episode_messages TO service_role;
CREATE INDEX episode_messages_episode_created_idx ON public.episode_messages (episode_id, created_at, id);
CREATE TRIGGER episode_messages_touch_episode AFTER INSERT ON public.episode_messages FOR EACH ROW EXECUTE FUNCTION public.episode_messages_touch_episode();
CREATE POLICY "own episode messages readable" ON public.episode_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.episodes
  WHERE ((episodes.id = episode_messages.episode_id) AND (episodes.user_id = ( SELECT auth.uid() AS uid))))));
