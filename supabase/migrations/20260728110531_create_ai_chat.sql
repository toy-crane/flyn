SET check_function_bodies = false;
CREATE FUNCTION public.chat_messages_touch_room()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  update public.chat_rooms
  set updated_at = now()
  where id = new.chat_room_id;
  return new;
end;
$function$;
CREATE FUNCTION public.chat_rooms_touch()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;
CREATE TABLE public.chat_messages (id text NOT NULL, chat_room_id uuid NOT NULL, role text NOT NULL, content text NOT NULL, status text DEFAULT 'complete'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 20000);
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_id_length CHECK (char_length(id) >= 1 AND char_length(id) <= 128);
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (chat_room_id, id);
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_role CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]));
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_status CHECK (status = ANY (ARRAY['complete'::text, 'stopped'::text]));
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
CREATE INDEX chat_messages_room_created_idx ON public.chat_messages (chat_room_id, created_at, id);
CREATE TRIGGER chat_messages_touch_room AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.chat_messages_touch_room();
CREATE TABLE public.chat_rooms (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid DEFAULT auth.uid() NOT NULL, title text DEFAULT '새 채팅'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY "own chat messages readable" ON public.chat_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.chat_rooms
  WHERE ((chat_rooms.id = chat_messages.chat_room_id) AND (chat_rooms.user_id = ( SELECT auth.uid() AS uid))))));
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_chat_room_id_fkey FOREIGN KEY (chat_room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;
ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 500);
ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
GRANT DELETE, SELECT ON public.chat_rooms TO authenticated;
GRANT INSERT (id, user_id) ON public.chat_rooms TO authenticated;
GRANT ALL ON public.chat_rooms TO service_role;
CREATE INDEX chat_rooms_user_updated_idx ON public.chat_rooms (user_id, updated_at DESC);
CREATE TRIGGER chat_rooms_touch BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.chat_rooms_touch();
CREATE POLICY "own chat rooms creatable" ON public.chat_rooms FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "own chat rooms deletable" ON public.chat_rooms FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "own chat rooms readable" ON public.chat_rooms FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
