-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.record_english_message()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  spoken text;
begin
  if new.role <> 'user' or new.expression_status is null then
    return new;
  end if;

  select string_agg(part->>'text', ' ') into spoken
  from jsonb_array_elements(new.parts) part
  where part->>'type' = 'text';

  if spoken ~ '[A-Za-z]' and spoken !~ '[가-힣ㄱ-ㅎㅏ-ㅣ]' then
    insert into public.learning_events (kind, source_id, user_id, occurred_at)
    values ('english_message', new.id, new.user_id, new.created_at)
    on conflict do nothing;
  end if;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.record_english_message() FROM PUBLIC;

CREATE FUNCTION public.record_episode_completion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if new.finished_at is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.finished_at is not null then
    return new;
  end if;

  if new.finished_at is not null then
    insert into public.learning_events (kind, source_id, user_id, occurred_at)
    values ('episode_completed', new.id, new.user_id, new.finished_at)
    on conflict do nothing;
  end if;
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.record_episode_completion() FROM PUBLIC;

CREATE TRIGGER episode_messages_record_english
  AFTER INSERT OR UPDATE OF expression_status ON public.episode_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.record_english_message();

CREATE TRIGGER episode_plays_record_completion
  AFTER INSERT OR UPDATE OF finished_at ON public.episode_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.record_episode_completion();

CREATE TABLE public.learning_events (
  created_at timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  kind        text                     NOT NULL,
  source_id   uuid                     NOT NULL,
  user_id     uuid                     NOT NULL,
  occurred_at timestamp with time zone NOT NULL
);

COMMENT ON TABLE public.learning_events IS 'Permanent study facts without conversation text or endings; run deletion does not erase them.';

CREATE TRIGGER learning_events_set_timestamps
  BEFORE INSERT OR UPDATE ON public.learning_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.learning_events
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.learning_events
  ADD CONSTRAINT learning_events_kind_check CHECK (kind = ANY (ARRAY['english_message'::text, 'episode_completed'::text]));

ALTER TABLE public.learning_events
  ADD CONSTRAINT learning_events_pkey PRIMARY KEY (kind, source_id);

ALTER TABLE public.learning_events
  ADD CONSTRAINT learning_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.learning_events TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.learning_events TO authenticated;

GRANT ALL ON public.learning_events TO service_role;

CREATE INDEX learning_events_user_time_idx ON public.learning_events (user_id, occurred_at);

CREATE POLICY learning_events_select_own ON public.learning_events
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE ON public.story_plays TO authenticated;

CREATE POLICY story_plays_delete_own ON public.story_plays
  FOR DELETE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));
