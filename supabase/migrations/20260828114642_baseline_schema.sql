-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE EXTENSION pgtap WITH SCHEMA extensions;

CREATE FUNCTION public.available_usernames (
  candidates text[]
)
  RETURNS text[]
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select coalesce(array_agg(entry.candidate order by entry.position), '{}'::text[])
  from (
    select candidate, position
    from unnest(candidates) with ordinality as flattened(candidate, position)
    order by position
    limit 10
  ) as entry
  where entry.candidate ~ '^[a-z0-9_]{3,20}$'
    and not public.is_reserved_username(entry.candidate)
    and not public.is_protected_username(entry.candidate, (select auth.uid()))
    and not exists (
      select 1
      from public.profiles
      where public.profiles.username = entry.candidate
        and public.profiles.id is distinct from (select auth.uid())
    );
$function$;

COMMENT ON FUNCTION public.available_usernames(text[]) IS 'Filters a caller''s candidate account ids down to the free ones, in the order given. At most 10 per call.';

REVOKE ALL ON FUNCTION public.available_usernames(text[]) FROM PUBLIC;

GRANT ALL ON FUNCTION public.available_usernames(text[]) TO authenticated;

CREATE FUNCTION public.complete_episode_run_fallback (
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

  select ending.kind, ending.outcome
  into recorded_kind, recorded_outcome
  from public.episode_endings ending
  where ending.user_id = player
    and ending.episode_id = complete_episode_run_fallback.episode_id;

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

COMMENT ON FUNCTION public.complete_episode_run_fallback(uuid,jsonb) IS 'Completes a stopped ending with the longer compatible active transcript.';

REVOKE ALL ON FUNCTION public.complete_episode_run_fallback(uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.complete_episode_run_fallback(uuid, jsonb) TO authenticated;

CREATE FUNCTION public.complete_episode_run (
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

  select ending.kind, ending.outcome
  into recorded_kind, recorded_outcome
  from public.episode_endings ending
  where ending.user_id = player
    and ending.episode_id = complete_episode_run.episode_id;

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

COMMENT ON FUNCTION public.complete_episode_run(uuid,jsonb) IS 'Marks matching ended messages complete. A compatible normal completion can upgrade a fallback once; normal completions are immutable.';

REVOKE ALL ON FUNCTION public.complete_episode_run(uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.complete_episode_run(uuid, jsonb) TO authenticated;

CREATE FUNCTION public.episode_run_extends_snapshot (
  stored_messages   jsonb,
  snapshot_messages jsonb
)
  RETURNS boolean
  LANGUAGE plpgsql
  IMMUTABLE
  PARALLEL SAFE
  SET search_path TO ''
  AS $function$
declare
  snapshot_message jsonb;
  snapshot_part jsonb;
  stored_message jsonb;
  stored_part jsonb;
begin
  if jsonb_typeof(episode_run_extends_snapshot.stored_messages)
      is distinct from 'array'
    or jsonb_typeof(episode_run_extends_snapshot.snapshot_messages)
      is distinct from 'array'
  then
    return false;
  end if;

  if jsonb_array_length(episode_run_extends_snapshot.stored_messages)
      < jsonb_array_length(episode_run_extends_snapshot.snapshot_messages)
  then
    return false;
  end if;

  if jsonb_array_length(episode_run_extends_snapshot.snapshot_messages) = 0 then
    return true;
  end if;

  for message_index in
    0..jsonb_array_length(episode_run_extends_snapshot.snapshot_messages) - 1
  loop
    stored_message :=
      episode_run_extends_snapshot.stored_messages -> message_index;
    snapshot_message :=
      episode_run_extends_snapshot.snapshot_messages -> message_index;

    if stored_message ->> 'id' is distinct from snapshot_message ->> 'id'
      or stored_message ->> 'role' is distinct from snapshot_message ->> 'role'
      or jsonb_typeof(stored_message -> 'parts') is distinct from 'array'
      or jsonb_typeof(snapshot_message -> 'parts') is distinct from 'array'
      or jsonb_array_length(stored_message -> 'parts')
        < jsonb_array_length(snapshot_message -> 'parts')
    then
      return false;
    end if;

    if jsonb_array_length(snapshot_message -> 'parts') = 0 then
      continue;
    end if;

    for part_index in
      0..jsonb_array_length(snapshot_message -> 'parts') - 1
    loop
      stored_part := stored_message -> 'parts' -> part_index;
      snapshot_part := snapshot_message -> 'parts' -> part_index;

      if stored_part ->> 'type' is distinct from snapshot_part ->> 'type' then
        return false;
      end if;

      if snapshot_part ->> 'type' = 'text' then
        if stored_part - 'state' - 'text'
            is distinct from snapshot_part - 'state' - 'text'
          or left(
            coalesce(stored_part ->> 'text', ''),
            length(coalesce(snapshot_part ->> 'text', ''))
          ) is distinct from coalesce(snapshot_part ->> 'text', '')
        then
          return false;
        end if;
      elsif stored_part - 'state' is distinct from snapshot_part - 'state' then
        return false;
      end if;
    end loop;
  end loop;

  return true;
end;
$function$;

COMMENT ON FUNCTION public.episode_run_extends_snapshot(jsonb,jsonb) IS 'Reports whether stored episode messages are the same branch at least as complete as a stopped client snapshot.';

REVOKE ALL ON FUNCTION public.episode_run_extends_snapshot(jsonb, jsonb) FROM PUBLIC;

CREATE FUNCTION public.episode_run_matches_ending (
  messages jsonb,
  kind     text,
  outcome  text
)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
  SET search_path TO ''
  AS $function$
  select count(*) = 1
    and count(*) filter (
      where part #>> '{data,kind}' = episode_run_matches_ending.kind
        and part #>> '{data,outcome}' = episode_run_matches_ending.outcome
    ) = 1
  from jsonb_array_elements(
    case
      when jsonb_typeof(episode_run_matches_ending.messages) = 'array'
        then episode_run_matches_ending.messages
      else '[]'::jsonb
    end
  ) message
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(message -> 'parts') = 'array' then message -> 'parts'
      else '[]'::jsonb
    end
  ) part
  where part ->> 'type' = 'data-ending';
$function$;

COMMENT ON FUNCTION public.episode_run_matches_ending(jsonb,text,text) IS 'Reports whether episode messages carry exactly one matching permanent ending.';

REVOKE ALL ON FUNCTION public.episode_run_matches_ending(jsonb, text, text) FROM PUBLIC;

CREATE FUNCTION public.finish_episode (
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
  target_story uuid;
  target_number smallint;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  select authored.story_id, authored.number
  into target_story, target_number
  from public.episodes authored
  where authored.id = finish_episode.episode_id;

  if target_story is null then
    raise exception 'Episode % does not exist.', finish_episode.episode_id
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.episode_endings ending
    where ending.user_id = player
      and ending.episode_id = finish_episode.episode_id
  ) and exists (
    select 1
    from public.episodes earlier
    left join public.episode_endings ending
      on ending.user_id = player
      and ending.episode_id = earlier.id
    where earlier.story_id = target_story
      and earlier.number < target_number
      and ending.episode_id is null
  ) then
    raise exception 'Episode % is not the next episode in its story.',
      finish_episode.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_endings (
    user_id,
    episode_id,
    kind,
    outcome,
    memory_choice,
    memory_relationship,
    memory_question
  )
  values (
    player,
    finish_episode.episode_id,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question
  )
  on conflict on constraint episode_endings_pkey do nothing;

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

COMMENT ON FUNCTION public.finish_episode(uuid,text,text,text,text,text,text) IS 'Records the ending and story memory of the caller''s current episode. Returns true only to the request that inserted the permanent ending.';

REVOKE ALL ON FUNCTION public.finish_episode(uuid, text, text, text, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.finish_episode(uuid, text, text, text, text, text, text) TO authenticated;

CREATE FUNCTION public.guard_username_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if old.username is not null
    and old.username_locked_until is not null
    and old.username_locked_until > now()
  then
    raise exception 'Account id is locked until %', old.username_locked_until
      using errcode = 'check_violation';
  end if;

  if new.username is not null and public.is_protected_username(new.username, new.id) then
    -- The same code the unique index raises. To the person asking, an id somebody
    -- else gave up last week and an id somebody else holds today are one answer:
    -- not yours, pick another.
    raise exception 'Account id % is still protected', new.username
      using errcode = 'unique_violation';
  end if;

  -- A first id costs nothing and retires nothing: there is no previous id to hold
  -- back, and locking here would trap someone in the value they just typed.
  if old.username is null then
    return new;
  end if;

  -- Taking back an id this account retired earlier releases it, so the row does
  -- not sit there blocking the account that now holds the id.
  delete from public.retired_usernames
  where public.retired_usernames.username = new.username
    and public.retired_usernames.retired_by = new.id;

  -- `on conflict` covers the same id being retired twice: a -> b -> a -> b leaves
  -- one row for `b`, protected from the most recent release rather than the first.
  insert into public.retired_usernames (username, retired_by, protected_until)
  values (old.username, new.id, now() + public.username_change_interval())
  on conflict (username) do update
  set retired_by = excluded.retired_by,
      retired_at = now(),
      protected_until = excluded.protected_until;

  new.username_changed_at := now();
  new.username_locked_until := now() + public.username_change_interval();

  return new;
end;
$function$;

COMMENT ON FUNCTION public.guard_username_change() IS 'Enforces the account id lock, protects the previous id, and stamps the next allowed change.';

REVOKE ALL ON FUNCTION public.guard_username_change() FROM PUBLIC;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates public.profiles row for a new auth.users row. Identity only, no provider metadata.';

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

CREATE FUNCTION public.is_protected_username (
  candidate text,
  owner     uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.retired_usernames
    where public.retired_usernames.username = candidate
      and public.retired_usernames.protected_until > now()
      and public.retired_usernames.retired_by is distinct from owner
  );
$function$;

COMMENT ON FUNCTION public.is_protected_username(text,uuid) IS 'True while another account''s previous id is still protected. Reads retired_usernames as owner.';

REVOKE ALL ON FUNCTION public.is_protected_username(text, uuid) FROM PUBLIC;

CREATE FUNCTION public.is_reserved_username (
  candidate text
)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select candidate = any (
    array['admin', 'administrator', 'support', 'official', 'system']
  );
$function$;

COMMENT ON FUNCTION public.is_reserved_username(text) IS 'True for account ids the product keeps for itself. Derived projects extend the list here.';

REVOKE ALL ON FUNCTION public.is_reserved_username(text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.is_reserved_username(text) TO authenticated;

GRANT ALL ON FUNCTION public.is_reserved_username(text) TO service_role;

CREATE FUNCTION public.save_episode_run_fallback (
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
  target_story uuid;
  target_number smallint;
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

  select authored.story_id, authored.number
  into target_story, target_number
  from public.episodes authored
  where authored.id = save_episode_run_fallback.episode_id;

  if target_story is null then
    raise exception 'Episode % does not exist.',
      save_episode_run_fallback.episode_id
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.episode_endings ending
    where ending.user_id = player
      and ending.episode_id = save_episode_run_fallback.episode_id
  ) then
    return;
  end if;

  if exists (
    select 1
    from public.episodes earlier
    left join public.episode_endings ending
      on ending.user_id = player
      and ending.episode_id = earlier.id
    where earlier.story_id = target_story
      and earlier.number < target_number
      and ending.episode_id is null
  ) then
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

COMMENT ON FUNCTION public.save_episode_run_fallback(uuid,jsonb) IS 'Saves a stopped current scene without replacing a longer snapshot of the same branch.';

REVOKE ALL ON FUNCTION public.save_episode_run_fallback(uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.save_episode_run_fallback(uuid, jsonb) TO authenticated;

CREATE FUNCTION public.save_episode_run (
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
  target_story uuid;
  target_number smallint;
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

  select authored.story_id, authored.number
  into target_story, target_number
  from public.episodes authored
  where authored.id = save_episode_run.episode_id;

  if target_story is null then
    raise exception 'Episode % does not exist.', save_episode_run.episode_id
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.episode_endings ending
    where ending.user_id = player
      and ending.episode_id = save_episode_run.episode_id
  ) then
    return;
  end if;

  if exists (
    select 1
    from public.episodes earlier
    left join public.episode_endings ending
      on ending.user_id = player
      and ending.episode_id = earlier.id
    where earlier.story_id = target_story
      and earlier.number < target_number
      and ending.episode_id is null
  ) then
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

COMMENT ON FUNCTION public.save_episode_run(uuid,jsonb) IS 'Upserts the caller''s current episode messages. Completed runs remain immutable.';

REVOKE ALL ON FUNCTION public.save_episode_run(uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.save_episode_run(uuid, jsonb) TO authenticated;

CREATE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at := now();

  return new;
end;
$function$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Sets updated_at on a row that changed. Paired with a WHEN clause that skips no-op updates.';

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;

CREATE FUNCTION public.username_change_interval()
  RETURNS interval
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  select interval '30 days';
$function$;

COMMENT ON FUNCTION public.username_change_interval() IS 'How long an account id stays locked after a change, and how long the previous id stays protected.';

REVOKE ALL ON FUNCTION public.username_change_interval() FROM PUBLIC;

CREATE FUNCTION public.username_status (
  candidate text
)
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select case
    when candidate is null or candidate !~ '^[a-z0-9_]{3,20}$' then 'invalid'
    when public.is_reserved_username(candidate) then 'reserved'
    when exists (
      select 1
      from public.profiles
      where public.profiles.username = candidate
        and public.profiles.id is distinct from (select auth.uid())
    ) then 'taken'
    when public.is_protected_username(candidate, (select auth.uid())) then 'taken'
    else 'available'
  end;
$function$;

COMMENT ON FUNCTION public.username_status(text) IS 'One of available, taken, reserved, invalid for a candidate account id. Exposes no profile rows.';

REVOKE ALL ON FUNCTION public.username_status(text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.username_status(text) TO authenticated;

CREATE TABLE public.episode_endings (
  user_id             uuid                     NOT NULL,
  episode_id          uuid                     NOT NULL,
  kind                text                     NOT NULL,
  outcome             text                     NOT NULL,
  memory_choice       text,
  memory_relationship text,
  memory_question     text,
  finished_at         timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_endings IS 'One immutable ending and story memory per account and stable episode id.';

COMMENT ON COLUMN public.episode_endings.episode_id IS 'Stable episode reference. Numbers are only ordering inside a story.';

COMMENT ON COLUMN public.episode_endings.kind IS 'How the incident ended: 성공, 타협 or 실패.';

COMMENT ON COLUMN public.episode_endings.outcome IS 'One Korean line naming what happened, written by the model that closed the scene.';

COMMENT ON COLUMN public.episode_endings.memory_choice IS 'What the person did in this incident. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_endings.memory_relationship IS 'How the relationship changed. Null when the closing scene left no memory lines.';

COMMENT ON COLUMN public.episode_endings.memory_question IS 'The question this incident opened. Null when the closing scene left no memory lines.';

ALTER TABLE public.episode_endings
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_kind_known CHECK (kind = ANY (ARRAY['성공'::text, '타협'::text, '실패'::text]));

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_choice_usable CHECK (memory_choice IS NULL OR length(btrim(memory_choice)) >= 1 AND length(btrim(memory_choice)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_question_usable CHECK (memory_question IS NULL OR length(btrim(memory_question)) >= 1 AND length(btrim(memory_question)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_memory_relationship_usable
    CHECK (memory_relationship IS NULL OR length(btrim(memory_relationship)) >= 1 AND length(btrim(memory_relationship)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_outcome_usable CHECK (length(btrim(outcome)) >= 1 AND length(btrim(outcome)) <= 300);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_pkey PRIMARY KEY (user_id, episode_id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_endings TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_endings TO authenticated;

GRANT ALL ON public.episode_endings TO service_role;

CREATE INDEX episode_endings_episode_id_idx ON public.episode_endings (episode_id);

CREATE POLICY episode_endings_select_own ON public.episode_endings
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.episode_runs (
  user_id               uuid                     NOT NULL,
  episode_id            uuid                     NOT NULL,
  messages              jsonb                    NOT NULL,
  completed_at          timestamp with time zone,
  completed_by_fallback boolean                  DEFAULT false NOT NULL,
  updated_at            timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.episode_runs IS 'One server-saved UI message list per account and episode, active or completed.';

COMMENT ON COLUMN public.episode_runs.messages IS 'AI SDK UI messages with stable message ids. Limited to one MiB per episode.';

COMMENT ON COLUMN public.episode_runs.completed_at IS 'Set after an ending exists. A fallback completion can be upgraded once by a compatible normal completion.';

COMMENT ON COLUMN public.episode_runs.completed_by_fallback IS 'True while a stopped client snapshot is the completed transcript. A compatible normal completion replaces it and clears this flag.';

ALTER TABLE public.episode_runs
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episode_runs
  ADD CONSTRAINT episode_runs_messages_array CHECK (jsonb_typeof(messages) = 'array'::text);

ALTER TABLE public.episode_runs
  ADD CONSTRAINT episode_runs_messages_size CHECK (octet_length(messages::text) <= 1048576);

ALTER TABLE public.episode_runs
  ADD CONSTRAINT episode_runs_pkey PRIMARY KEY (user_id, episode_id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episode_runs TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episode_runs TO authenticated;

GRANT ALL ON public.episode_runs TO service_role;

CREATE INDEX episode_runs_episode_id_idx ON public.episode_runs (episode_id);

CREATE POLICY episode_runs_select_own ON public.episode_runs
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.episodes (
  id                uuid     NOT NULL,
  story_id          uuid     NOT NULL,
  number            smallint NOT NULL,
  title             text     NOT NULL,
  preview           text     NOT NULL,
  situation         text     NOT NULL,
  situation_emoji   text     NOT NULL,
  opening           text     NOT NULL,
  stage             text     NOT NULL,
  cast_names        text[]   NOT NULL,
  ending_success    text     NOT NULL,
  ending_compromise text     NOT NULL,
  ending_failure    text     NOT NULL
);

ALTER TABLE public.episodes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_cast_names_usable CHECK (cardinality(cast_names) >= 1 AND cardinality(cast_names) <= 20);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_ending_compromise_usable CHECK (length(btrim(ending_compromise)) >= 1 AND length(btrim(ending_compromise)) <= 500);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_ending_failure_usable CHECK (length(btrim(ending_failure)) >= 1 AND length(btrim(ending_failure)) <= 500);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_ending_success_usable CHECK (length(btrim(ending_success)) >= 1 AND length(btrim(ending_success)) <= 500);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_number_usable CHECK (number >= 1 AND number <= 100);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_opening_usable CHECK (length(btrim(opening)) >= 1 AND length(btrim(opening)) <= 10000);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE RESTRICT;

ALTER TABLE public.episode_runs
  ADD CONSTRAINT episode_runs_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE RESTRICT;

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_preview_usable CHECK (length(btrim(preview)) >= 1 AND length(btrim(preview)) <= 500);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_situation_emoji_usable CHECK (length(btrim(situation_emoji)) >= 1 AND length(btrim(situation_emoji)) <= 20);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_situation_usable CHECK (length(btrim(situation)) >= 1 AND length(btrim(situation)) <= 300);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_stage_usable CHECK (length(btrim(stage)) >= 1 AND length(btrim(stage)) <= 20000);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_story_id_number_key UNIQUE (story_id, number);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_title_usable CHECK (length(btrim(title)) >= 1 AND length(btrim(title)) <= 120);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.episodes TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.episodes TO authenticated;

GRANT ALL ON public.episodes TO service_role;

CREATE POLICY episodes_select_authenticated ON public.episodes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.language_levels (
  user_id     uuid                     NOT NULL,
  level       text                     NOT NULL,
  observed_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.language_levels IS 'The latest reading of how this person writes English. One row per account, overwritten as episodes end.';

COMMENT ON COLUMN public.language_levels.level IS 'One Korean line describing the level, written by the model that closed the scene.';

ALTER TABLE public.language_levels
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_level_usable CHECK (length(btrim(level)) >= 1 AND length(btrim(level)) <= 300);

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_pkey PRIMARY KEY (user_id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.language_levels TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.language_levels TO authenticated;

GRANT ALL ON public.language_levels TO service_role;

CREATE POLICY language_levels_select_own ON public.language_levels
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.profiles (
  id                          uuid                     NOT NULL,
  display_name                text,
  username                    text,
  avatar_url                  text,
  avatar_path                 text,
  avatar_chosen_by_user       boolean                  DEFAULT false NOT NULL,
  account_deletion_started_at timestamp with time zone,
  username_changed_at         timestamp with time zone,
  username_locked_until       timestamp with time zone,
  created_at                  timestamp with time zone DEFAULT now() NOT NULL,
  updated_at                  timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User-editable profile, one row per auth.users row. Created by trigger, never by clients.';

COMMENT ON COLUMN public.profiles.display_name IS 'Name shown in the app. Providers only fill this while it is null.';

COMMENT ON COLUMN public.profiles.username IS 'Public account id, lowercase only. Null until the person finishes onboarding.';

COMMENT ON COLUMN public.profiles.avatar_url IS 'Provider-supplied image. Providers only fill this while it is null and the person has not chosen their own.';

COMMENT ON COLUMN public.profiles.avatar_path IS 'Object path in the avatars bucket for a picture this person uploaded. Beats avatar_url when set.';

COMMENT ON COLUMN public.profiles.avatar_chosen_by_user IS 'True once the person picked or deleted a picture. Blocks providers from filling avatar_url again.';

COMMENT ON COLUMN public.profiles.account_deletion_started_at IS 'Write fence set before account deletion removes avatar objects. Clients cannot change it.';

COMMENT ON COLUMN public.profiles.username_changed_at IS 'When the account id last changed. Null while the person still holds the id they chose at onboarding.';

COMMENT ON COLUMN public.profiles.username_locked_until IS 'When the account id may change again. Written by the trigger, so the server owns the instant.';

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_path_owned CHECK (avatar_path IS NULL OR length(avatar_path) <= 512 AND avatar_path ~~ (id::text || '/%'::text));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_url_usable CHECK (avatar_url IS NULL OR length(avatar_url) <= 2048 AND avatar_url ~~ 'https://%'::text);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_usable CHECK (display_name IS NULL OR length(btrim(display_name)) >= 1 AND length(btrim(display_name)) <= 30);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.episode_endings
  ADD CONSTRAINT episode_endings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.episode_runs
  ADD CONSTRAINT episode_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.language_levels
  ADD CONSTRAINT language_levels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_not_reserved CHECK (username IS NULL OR NOT public.is_reserved_username(username));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_usable CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$'::text);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.profiles TO authenticated;

GRANT UPDATE (avatar_chosen_by_user, avatar_path, avatar_url, display_name, username) ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE TRIGGER profiles_guard_username_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (new.username IS DISTINCT FROM old.username)
  EXECUTE FUNCTION public.guard_username_change();

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (old.* IS DISTINCT FROM new.*)
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE TABLE public.retired_usernames (
  username        text                     NOT NULL,
  retired_by      uuid                     NOT NULL,
  retired_at      timestamp with time zone DEFAULT now() NOT NULL,
  protected_until timestamp with time zone NOT NULL
);

COMMENT ON TABLE public.retired_usernames IS 'Account ids released by a rename, held back from other accounts until protected_until.';

ALTER TABLE public.retired_usernames
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.retired_usernames
  ADD CONSTRAINT retired_usernames_pkey PRIMARY KEY (username);

ALTER TABLE public.retired_usernames
  ADD CONSTRAINT retired_usernames_retired_by_fkey FOREIGN KEY (retired_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.retired_usernames
  ADD CONSTRAINT retired_usernames_username_usable CHECK (username ~ '^[a-z0-9_]{3,20}$'::text);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.retired_usernames TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.retired_usernames TO authenticated;

GRANT ALL ON public.retired_usernames TO service_role;

CREATE INDEX retired_usernames_protected_until_idx ON public.retired_usernames (protected_until);

CREATE TABLE public.stories (
  id               uuid     NOT NULL,
  "position"       smallint NOT NULL,
  slug             text     NOT NULL,
  title            text     NOT NULL,
  target_language  text     NOT NULL,
  completion_title text     NOT NULL,
  completion_copy  text     NOT NULL
);

ALTER TABLE public.stories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_completion_copy_usable CHECK (length(btrim(completion_copy)) >= 1 AND length(btrim(completion_copy)) <= 500);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_completion_title_usable CHECK (length(btrim(completion_title)) >= 1 AND length(btrim(completion_title)) <= 120);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_pkey PRIMARY KEY (id);

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE RESTRICT;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_position_key UNIQUE ("position");

ALTER TABLE public.stories
  ADD CONSTRAINT stories_position_usable CHECK ("position" >= 1 AND "position" <= 10000);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_slug_key UNIQUE (slug);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_slug_usable CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_target_language_usable CHECK (target_language ~ '^[a-z]{2}(?:-[A-Z]{2})?$'::text);

ALTER TABLE public.stories
  ADD CONSTRAINT stories_title_usable CHECK (length(btrim(title)) >= 1 AND length(btrim(title)) <= 120);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.stories TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.stories TO authenticated;

GRANT ALL ON public.stories TO service_role;

CREATE POLICY stories_select_authenticated ON public.stories
  FOR SELECT
  TO authenticated
  USING (true);