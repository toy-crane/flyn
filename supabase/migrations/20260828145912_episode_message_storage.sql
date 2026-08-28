-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP POLICY episode_endings_select_own ON public.episode_endings;

DROP TABLE public.episode_endings;

CREATE OR REPLACE FUNCTION public.complete_episode_run_fallback (
  episode_id uuid,
  messages   jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
  recorded_kind text;
  recorded_outcome text;
begin
  if player is null then
    raise exception 'A signed-in user is required to complete an episode run.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(complete_episode_run_fallback.messages)
      is distinct from 'array'
  then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(complete_episode_run_fallback.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  select played.ending_kind, played.ending_outcome
  into recorded_kind, recorded_outcome
  from public.episode_plays played
  where played.user_id = player
    and played.episode_id = complete_episode_run_fallback.episode_id
    and played.finished_at is not null;

  if not found then
    raise exception 'Episode % has no ending.',
      complete_episode_run_fallback.episode_id
      using errcode = '22023';
  end if;

  if not public.episode_run_matches_ending(
    complete_episode_run_fallback.messages,
    recorded_kind,
    recorded_outcome
  ) then
    raise exception 'Episode % transcript does not match its ending.',
      complete_episode_run_fallback.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (
    user_id,
    episode_id,
    messages,
    completed_at,
    completed_by_fallback
  )
  values (
    player,
    complete_episode_run_fallback.episode_id,
    complete_episode_run_fallback.messages,
    now(),
    true
  )
  on conflict on constraint episode_runs_pkey do update
  set messages = case
        when public.episode_run_extends_snapshot(
          public.episode_runs.messages,
          excluded.messages
        )
          and public.episode_run_matches_ending(
            public.episode_runs.messages,
            recorded_kind,
            recorded_outcome
          )
          then public.episode_runs.messages
        else excluded.messages
      end,
      completed_at = excluded.completed_at,
      completed_by_fallback = true,
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.complete_episode_run (
  episode_id uuid,
  messages   jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  ending_count integer;
  matching_ending_count integer;
  player uuid := (select auth.uid());
  recorded_kind text;
  recorded_outcome text;
begin
  if player is null then
    raise exception 'A signed-in user is required to complete an episode run.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(complete_episode_run.messages) is distinct from 'array' then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(complete_episode_run.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  select played.ending_kind, played.ending_outcome
  into recorded_kind, recorded_outcome
  from public.episode_plays played
  where played.user_id = player
    and played.episode_id = complete_episode_run.episode_id
    and played.finished_at is not null;

  if not found then
    raise exception 'Episode % has no ending.', complete_episode_run.episode_id
      using errcode = '22023';
  end if;

  select
    count(*),
    count(*) filter (
      where part #>> '{data,kind}' = recorded_kind
        and part #>> '{data,outcome}' = recorded_outcome
    )
  into ending_count, matching_ending_count
  from jsonb_array_elements(complete_episode_run.messages) message
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(message -> 'parts') = 'array' then message -> 'parts'
      else '[]'::jsonb
    end
  ) part
  where part ->> 'type' = 'data-ending';

  if ending_count <> 1 or matching_ending_count <> 1 then
    raise exception 'Episode % transcript does not match its ending.',
      complete_episode_run.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (
    user_id,
    episode_id,
    messages,
    completed_at,
    completed_by_fallback
  )
  values (
    player,
    complete_episode_run.episode_id,
    complete_episode_run.messages,
    now(),
    false
  )
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      completed_at = excluded.completed_at,
      completed_by_fallback = false,
      updated_at = now()
  where public.episode_runs.completed_at is null
    or (
      public.episode_runs.completed_by_fallback
      and public.episode_run_extends_snapshot(
        excluded.messages,
        public.episode_runs.messages
      )
    );
end;
$function$;

CREATE FUNCTION public.episode_is_current (
  target_episode uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.episodes target
    where target.id = episode_is_current.target_episode
      and not exists (
        select 1
        from public.episodes earlier
        left join public.episode_plays played
          on played.user_id = (select auth.uid())
          and played.episode_id = earlier.id
          and played.finished_at is not null
        where earlier.story_id = target.story_id
          and earlier.number < target.number
          and played.id is null
      )
  );
$function$;

COMMENT ON FUNCTION public.episode_is_current(uuid) IS 'Reports whether the caller has finished every earlier episode of the story this one belongs to.';

REVOKE ALL ON FUNCTION public.episode_is_current(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.episode_is_current(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.finish_episode (
  episode_id          uuid,
  kind                text,
  outcome             text,
  memory_choice       text DEFAULT NULL::text,
  memory_relationship text DEFAULT NULL::text,
  memory_question     text DEFAULT NULL::text,
  language_level      text DEFAULT NULL::text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
  recorded integer;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  if not public.episode_is_current(finish_episode.episode_id) then
    raise exception 'Episode % is not the current episode in its story.',
      finish_episode.episode_id
      using errcode = '22023';
  end if;

  -- 아직 플레이를 열지 않은 채 결말이 도착할 수 있다. 그때는 이 한 문장이
  -- 플레이를 만들면서 닫는다.
  insert into public.episode_plays (
    user_id,
    episode_id,
    ending_kind,
    ending_outcome,
    memory_choice,
    memory_relationship,
    memory_question,
    finished_at
  )
  values (
    player,
    finish_episode.episode_id,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question,
    now()
  )
  on conflict on constraint episode_plays_one_per_episode do update
  set ending_kind = excluded.ending_kind,
      ending_outcome = excluded.ending_outcome,
      memory_choice = excluded.memory_choice,
      memory_relationship = excluded.memory_relationship,
      memory_question = excluded.memory_question,
      finished_at = excluded.finished_at
  where public.episode_plays.finished_at is null;

  get diagnostics recorded = row_count;

  if recorded = 1 and finish_episode.language_level is not null then
    insert into public.language_levels (user_id, level)
    values (player, finish_episode.language_level)
    on conflict on constraint language_levels_pkey do update
    set level = excluded.level,
        observed_at = now();
  end if;

  return recorded = 1;
end;
$function$;

COMMENT ON FUNCTION public.finish_episode(uuid,text,text,text,text,text,text) IS 'Records the ending and story memory of the caller''s current episode. Returns true only to the request that closed the play.';

CREATE OR REPLACE FUNCTION public.save_episode_run_fallback (
  episode_id uuid,
  messages   jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
begin
  if player is null then
    raise exception 'A signed-in user is required to save an episode.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(save_episode_run_fallback.messages) is distinct from 'array' then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(save_episode_run_fallback.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  if exists (
    select 1
    from public.episode_plays played
    where played.user_id = player
      and played.episode_id = save_episode_run_fallback.episode_id
      and played.finished_at is not null
  ) then
    return;
  end if;

  if not public.episode_is_current(save_episode_run_fallback.episode_id) then
    raise exception 'Episode % is not the current episode in its story.',
      save_episode_run_fallback.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (user_id, episode_id, messages)
  values (
    player,
    save_episode_run_fallback.episode_id,
    save_episode_run_fallback.messages
  )
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      updated_at = now()
  where public.episode_runs.completed_at is null
    and not public.episode_run_extends_snapshot(
      public.episode_runs.messages,
      excluded.messages
    );
end;
$function$;

CREATE OR REPLACE FUNCTION public.save_episode_run (
  episode_id uuid,
  messages   jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  player uuid := (select auth.uid());
begin
  if player is null then
    raise exception 'A signed-in user is required to save an episode.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(save_episode_run.messages) is distinct from 'array' then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(save_episode_run.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  if exists (
    select 1
    from public.episode_plays played
    where played.user_id = player
      and played.episode_id = save_episode_run.episode_id
      and played.finished_at is not null
  ) then
    return;
  end if;

  if not public.episode_is_current(save_episode_run.episode_id) then
    raise exception 'Episode % is not the current episode in its story.',
      save_episode_run.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (user_id, episode_id, messages)
  values (player, save_episode_run.episode_id, save_episode_run.messages)
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$function$;

CREATE TABLE public.episode_corrections (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  message_id uuid                     NOT NULL,
  user_id    uuid                     NOT NULL,
  original   text                     NOT NULL,
  corrected  text                     NOT NULL,
  reason     text                     NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_corrections IS 'One correction attached to a user message. Shown in the app as 배울 표현.';

COMMENT ON COLUMN public.episode_corrections.original IS 'The part of what the person wrote that was off.';

COMMENT ON COLUMN public.episode_corrections.corrected IS 'The corrected sentence, with every correction on this message applied.';

COMMENT ON COLUMN public.episode_corrections.reason IS 'One Korean line saying why.';

ALTER TABLE public.episode_corrections
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_corrected_usable CHECK (length(btrim(corrected)) >= 1 AND length(btrim(corrected)) <= 1000);

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_original_usable CHECK (length(btrim(original)) >= 1 AND length(btrim(original)) <= 1000);

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_pkey PRIMARY KEY (id);

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_reason_usable CHECK (length(btrim(reason)) >= 1 AND length(btrim(reason)) <= 300);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_corrections TO anon;

GRANT INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_corrections TO authenticated;

GRANT ALL ON public.episode_corrections TO service_role;

CREATE INDEX episode_corrections_user_id_idx ON public.episode_corrections (user_id);

CREATE INDEX episode_corrections_message_id_idx ON public.episode_corrections (message_id);

CREATE POLICY episode_corrections_select_own ON public.episode_corrections
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.episode_messages (
  id         uuid                     NOT NULL,
  play_id    uuid                     NOT NULL,
  user_id    uuid                     NOT NULL,
  "position" integer                  NOT NULL,
  role       text                     NOT NULL,
  parts      jsonb                    NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_messages IS 'One AI SDK UI message per row, ordered inside a play by position.';

COMMENT ON COLUMN public.episode_messages.id IS 'The id the AI SDK gave this message. Shared by the app, the server and this row.';

COMMENT ON COLUMN public.episode_messages."position" IS 'Where the message sits in the conversation. The server decides it, not the client clock.';

COMMENT ON COLUMN public.episode_messages.parts IS 'AI SDK UI message parts, kept as one JSON document. Limited to 256 KiB per message.';

ALTER TABLE public.episode_messages
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_ordered_in_play UNIQUE (play_id, "position");

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_owned_id UNIQUE (id, user_id);

ALTER TABLE public.episode_corrections
  ADD CONSTRAINT episode_corrections_message_id_user_id_fkey FOREIGN KEY (message_id, user_id) REFERENCES public.episode_messages(id, user_id) ON DELETE CASCADE;

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_parts_array CHECK (jsonb_typeof(parts) = 'array'::text);

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_parts_size CHECK (octet_length(parts::text) <= 262144);

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_pkey PRIMARY KEY (id);

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_position_usable CHECK ("position" >= 0);

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_role_known CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]));

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_messages TO anon;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_messages TO authenticated;

GRANT ALL ON public.episode_messages TO service_role;

CREATE INDEX episode_messages_user_id_idx ON public.episode_messages (user_id);

CREATE POLICY episode_messages_select_own ON public.episode_messages
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.episode_plays (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id             uuid                     NOT NULL,
  episode_id          uuid                     NOT NULL,
  started_at          timestamp with time zone DEFAULT now() NOT NULL,
  ending_kind         text,
  ending_outcome      text,
  memory_choice       text,
  memory_relationship text,
  memory_question     text,
  finished_at         timestamp with time zone
);

CREATE POLICY episode_corrections_write_own_message ON public.episode_corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM (public.episode_messages written
     JOIN public.episode_plays played ON ((played.id = written.play_id)))
  WHERE ((written.id = episode_corrections.message_id) AND (written.role = 'user'::text) AND (played.finished_at IS NULL))))));

CREATE POLICY episode_messages_erase_open_play ON public.episode_messages
  FOR DELETE
  TO authenticated
  USING (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_plays played
  WHERE ((played.id = episode_messages.play_id) AND (played.finished_at IS NULL))))));

CREATE POLICY episode_messages_write_open_play ON public.episode_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_plays played
  WHERE ((played.id = episode_messages.play_id) AND (played.finished_at IS NULL))))));

COMMENT ON TABLE public.episode_plays IS 'One account playing one episode: when it started, how it ended, and the story memory it left.';

COMMENT ON COLUMN public.episode_plays.id IS 'Stable key the messages and corrections of this play hang from.';

COMMENT ON COLUMN public.episode_plays.episode_id IS 'Stable episode reference. Numbers are only ordering inside a story.';

COMMENT ON COLUMN public.episode_plays.started_at IS 'When this account opened the episode. Set once and never rewritten.';

COMMENT ON COLUMN public.episode_plays.ending_kind IS 'How the incident ended: 성공, 타협 or 실패. Null while the play is still open.';

COMMENT ON COLUMN public.episode_plays.ending_outcome IS 'One Korean line naming what happened, written by the model that closed the scene.';

COMMENT ON COLUMN public.episode_plays.memory_choice IS 'What the person did in this incident. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_plays.memory_relationship IS 'How the relationship changed. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_plays.memory_question IS 'The question this incident opened. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_plays.finished_at IS 'When the permanent ending arrived. Null means the play is still open; a value freezes it.';

ALTER TABLE public.episode_plays
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_ending_kind_known CHECK (ending_kind IS NULL OR (ending_kind = ANY (ARRAY['성공'::text, '타협'::text, '실패'::text])));

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_ending_outcome_usable CHECK (ending_outcome IS NULL OR length(btrim(ending_outcome)) >= 1 AND length(btrim(ending_outcome)) <= 300);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_ending_whole CHECK ((ending_kind IS NULL) = (finished_at IS NULL) AND (ending_outcome IS NULL) = (finished_at IS NULL));

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE RESTRICT;

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_memory_choice_usable CHECK (memory_choice IS NULL OR length(btrim(memory_choice)) >= 1 AND length(btrim(memory_choice)) <= 300);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_memory_needs_ending CHECK (finished_at IS NOT NULL OR memory_choice IS NULL AND memory_relationship IS NULL AND memory_question IS NULL);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_memory_question_usable CHECK (memory_question IS NULL OR length(btrim(memory_question)) >= 1 AND length(btrim(memory_question)) <= 300);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_memory_relationship_usable
    CHECK (memory_relationship IS NULL OR length(btrim(memory_relationship)) >= 1 AND length(btrim(memory_relationship)) <= 300);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_one_per_episode UNIQUE (user_id, episode_id);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_owned_id UNIQUE (id, user_id);

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_play_id_user_id_fkey FOREIGN KEY (play_id, user_id) REFERENCES public.episode_plays(id, user_id) ON DELETE CASCADE;

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_pkey PRIMARY KEY (id);

ALTER TABLE public.episode_plays
  ADD CONSTRAINT episode_plays_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_plays TO anon;

GRANT INSERT (episode_id, user_id) ON public.episode_plays TO authenticated;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_plays TO authenticated;

GRANT ALL ON public.episode_plays TO service_role;

CREATE INDEX episode_plays_episode_id_idx ON public.episode_plays (episode_id);

CREATE POLICY episode_plays_select_own ON public.episode_plays
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY episode_plays_start_own ON public.episode_plays
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND public.episode_is_current(episode_id)));