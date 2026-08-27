-- Functions and the triggers that call them.
--
-- Both functions run with an empty `search_path` and name every object in full.
-- A `security definer` function that resolves names through a caller-controlled
-- search_path can be pointed at an attacker's table, so the empty path is what
-- makes the fully qualified names load-bearing rather than a style choice.

-- Creates the profile row for a new Supabase user.
--
-- This runs inside the signup transaction: if it raises, the whole signup fails.
-- So it does one insert and nothing else. It does not read provider metadata,
-- call other services, or branch on the sign-in method. `on conflict do nothing`
-- keeps a re-run or a backfilled row from turning into a signup error.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates public.profiles row for a new auth.users row. Identity only, no provider metadata.';

-- Only the trigger calls this. The Data API roles must not reach it, and
-- `create function` grants EXECUTE to PUBLIC by default, so revoke it.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Stamps `updated_at` when a profile actually changes.
--
-- `security invoker` is the right level here: this only rewrites a column of the
-- row the caller is already updating, so it needs no privileges of its own.
create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();

  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Sets updated_at on a row that changed. Paired with a WHEN clause that skips no-op updates.';

revoke all on function public.set_updated_at() from public, anon, authenticated;

-- The `when` clause is what keeps `updated_at` honest: an update that writes the
-- same values never fires, so the column records real changes rather than write
-- attempts.
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  when (old.* is distinct from new.*)
  execute function public.set_updated_at();

-- How long a changed account id is locked, and how long the old one is held back.
--
-- One function rather than the literal repeated across the trigger and both
-- availability functions: the two periods are the same period in the decision, and
-- a change that moved one of them would otherwise leave an id that is free to take
-- but locked to give up, or the reverse.
--
-- IMMUTABLE so it costs nothing where it is called per row.
create function public.username_change_interval()
returns interval
language sql
immutable
set search_path = ''
as $$
  select interval '30 days';
$$;

comment on function public.username_change_interval() is
  'How long an account id stays locked after a change, and how long the previous id stays protected.';

-- True while an account id belongs to somebody else's rename and is still held back.
--
-- `owner` is the account asking. Its own retired ids do not block it: someone who
-- renamed away and wants their previous id back is the one person no one can
-- confuse it with.
create function public.is_protected_username(candidate text, owner uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.retired_usernames
    where public.retired_usernames.username = candidate
      and public.retired_usernames.protected_until > now()
      and public.retired_usernames.retired_by is distinct from owner
  );
$$;

comment on function public.is_protected_username(text, uuid) is
  'True while another account''s previous id is still protected. Reads retired_usernames as owner.';

revoke all on function public.is_protected_username(text, uuid) from public, anon, authenticated;

-- Answers "can I have this account id?" without widening who may read profiles.
--
-- `security definer` is the whole point: `profiles_select_own` limits a signed-in
-- user to their own row, so a client cannot discover on its own whether an id is
-- free. This runs as the owner to look, and returns one word about the id the
-- caller already typed. No row, no column, and no other person's values leave
-- the function.
--
-- Reserved is decided before taken so a name the product keeps for itself reads
-- as unavailable rather than as somebody else's.
--
-- "Taken" skips the caller's own row. The edit screen asks about the id the person
-- already holds every time they open it, and counting their own row would answer
-- that their own id is somebody else's. Onboarding is unaffected: a caller with no
-- id yet has no row to skip.
--
-- An id another account gave up reads as taken rather than as its own state. The
-- person asking cannot have it and cannot wait usefully for it either, and naming
-- the protection would say that a specific stranger used to hold it.
create function public.username_status(candidate text)
returns text
language sql
security definer
stable
set search_path = ''
as $$
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
$$;

comment on function public.username_status(text) is
  'One of available, taken, reserved, invalid for a candidate account id. Exposes no profile rows.';

revoke all on function public.username_status(text) from public, anon;
grant execute on function public.username_status(text) to authenticated;

-- Keeps only the ids from `candidates` that a person could actually take.
--
-- The app builds the alternatives it wants to offer and this says which of them
-- are free, so the screen never shows a suggestion that fails the moment it is
-- pressed. Order is preserved: the caller's preference decides what appears
-- first.
--
-- The ten is a limit on how much guessing one call can do. Availability checks
-- are inherently a way to probe which ids exist, and a caller that could pass a
-- thousand candidates at once would turn one request into a thousand answers.
--
-- It is taken after unnest rather than by slicing the argument. `text[]` does
-- not fix the number of dimensions, and `candidates[1:10]` cuts only the first
-- one — a 2 by 11 array would walk straight past the limit while looking like
-- it obeyed. unnest flattens whatever shape arrived, so counting there counts
-- what the function actually answers for.
create function public.available_usernames(candidates text[])
returns text[]
language sql
security definer
stable
set search_path = ''
as $$
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
$$;

comment on function public.available_usernames(text[]) is
  'Filters a caller''s candidate account ids down to the free ones, in the order given. At most 10 per call.';

revoke all on function public.available_usernames(text[]) from public, anon;
grant execute on function public.available_usernames(text[]) to authenticated;

-- Decides every rename: whether it may happen, and what it costs.
--
-- This is the only place the two periods are enforced, and it has to be here
-- rather than in the client or in a check constraint. `username_status` answers
-- about the moment it was asked, and the id can be renamed into or protected
-- between that answer and this write. A check constraint cannot see another table
-- or the row's previous value, so neither the lock nor the protection can be
-- expressed as one.
--
-- `security definer` for `retired_usernames` alone: `authenticated` holds nothing
-- on that table, so the rename writes it through this function or not at all.
--
-- Two rules, and they cover different writes. A protected id may not be taken by
-- anyone, including an account choosing its first id at onboarding — otherwise the
-- shortest way to somebody's released id is to sign up rather than to rename. The
-- lock and the retirement only apply to a real change, so someone who has just
-- picked their first id can still fix it.
create function public.guard_username_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

comment on function public.guard_username_change() is
  'Enforces the account id lock, protects the previous id, and stamps the next allowed change.';

revoke all on function public.guard_username_change() from public, anon, authenticated;

-- The `when` clause covers every write that moves the id, including the null ->
-- value one at onboarding, because the protection has to hold for a new account
-- too. A profile that saves a new picture and the same id does not fire this at
-- all, which is what lets someone edit the rest of their profile while the id is
-- locked.
create trigger profiles_guard_username_change
  before update on public.profiles
  for each row
  when (new.username is distinct from old.username)
  execute function public.guard_username_change();

-- 끝난 에피소드를 기록하는 유일한 길.
--
-- `authenticated`는 `episode_endings`에 직접 쓰지 못한다. 직접 쓸 수 있으면
-- 앱이 아무 화나 끝난 것으로 만들어 앞의 화를 건너뛸 수 있다. 이 함수는
-- 지금 끝낼 수 있는 화가 하나뿐이라는 규칙을 지키고, 그래서 `security definer`다.
--
-- 같은 화의 결말이 다시 도착하면 false를 돌려준다. 한 번 난 결말은 그 스토리의
-- 사실로 남으므로 나중에 온 판정이 앞의 사실을 바꾸거나 화면을 닫지 않는다.
create function public.finish_episode(
  episode_id uuid,
  kind text,
  outcome text,
  memory_choice text default null,
  memory_relationship text default null,
  memory_question text default null,
  language_level text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

comment on function public.finish_episode(uuid, text, text, text, text, text, text) is
  'Records the ending and story memory of the caller''s current episode. Returns true only to the request that inserted the permanent ending.';

revoke all on function public.finish_episode(uuid, text, text, text, text, text, text) from public, anon;
grant execute on function public.finish_episode(uuid, text, text, text, text, text, text) to authenticated;

-- 진행 중인 장면을 계정에 남긴다. 앱은 매 요청에 대화 전체를 보내고 서버는
-- 받은 목록을 통째로 바꿔 쓴다. 같은 에피소드를 두 기기에서 진행하면 마지막
-- 저장이 남는다.
create function public.save_episode_run(episode_id uuid, messages jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

comment on function public.save_episode_run(uuid, jsonb) is
  'Upserts the caller''s current episode messages. Completed runs remain immutable.';

revoke all on function public.save_episode_run(uuid, jsonb) from public, anon;
grant execute on function public.save_episode_run(uuid, jsonb) to authenticated;


-- A stopped app can only send the latest scene React has rendered. The server's
-- request may already have saved a longer form of that same scene, so the
-- fallback must recognize a prefix without treating a different branch as one.
create function public.episode_run_extends_snapshot(
  stored_messages jsonb,
  snapshot_messages jsonb
)
returns boolean
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
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
$$;

comment on function public.episode_run_extends_snapshot(jsonb, jsonb) is
  'Reports whether stored episode messages are the same branch at least as complete as a stopped client snapshot.';

revoke all on function public.episode_run_extends_snapshot(jsonb, jsonb)
  from public, anon, authenticated;

-- Saves the scene visible when an app stops a request. Unlike ordinary
-- last-write-wins saves, a delayed shorter snapshot cannot roll back the
-- server's longer version of the same messages.
create function public.save_episode_run_fallback(episode_id uuid, messages jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

comment on function public.save_episode_run_fallback(uuid, jsonb) is
  'Saves a stopped current scene without replacing a longer snapshot of the same branch.';

revoke all on function public.save_episode_run_fallback(uuid, jsonb)
  from public, anon;
grant execute on function public.save_episode_run_fallback(uuid, jsonb)
  to authenticated;

-- 결말이 먼저 남은 에피소드의 같은 장면을 읽기 전용 대화 기록으로 확정한다.
-- 이 함수가 실패해도 결말은 이미 별도 호출로 남아 있어 화가 다시 열리지 않는다.
create function public.complete_episode_run(episode_id uuid, messages jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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
    completed_at
  )
  values (
    player,
    complete_episode_run.episode_id,
    complete_episode_run.messages,
    now()
  )
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      completed_at = excluded.completed_at,
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$$;

comment on function public.complete_episode_run(uuid, jsonb) is
  'Marks the caller''s matching ended episode messages complete. A completed transcript is immutable.';

revoke all on function public.complete_episode_run(uuid, jsonb) from public, anon;
grant execute on function public.complete_episode_run(uuid, jsonb) to authenticated;

create function public.episode_run_matches_ending(
  messages jsonb,
  kind text,
  outcome text
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
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
$$;

comment on function public.episode_run_matches_ending(jsonb, text, text) is
  'Reports whether episode messages carry exactly one matching permanent ending.';

revoke all on function public.episode_run_matches_ending(jsonb, text, text)
  from public, anon, authenticated;

-- A Stop can arrive after the permanent ending but before the server's longer
-- transcript finishes saving. Complete once, choosing the longer compatible
-- scene instead of freezing the throttled client snapshot.
create function public.complete_episode_run_fallback(
  episode_id uuid,
  messages jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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
    completed_at
  )
  values (
    player,
    complete_episode_run_fallback.episode_id,
    complete_episode_run_fallback.messages,
    now()
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
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$$;

comment on function public.complete_episode_run_fallback(uuid, jsonb) is
  'Completes a stopped ending with the longer compatible active transcript.';

revoke all on function public.complete_episode_run_fallback(uuid, jsonb)
  from public, anon;
grant execute on function public.complete_episode_run_fallback(uuid, jsonb)
  to authenticated;
