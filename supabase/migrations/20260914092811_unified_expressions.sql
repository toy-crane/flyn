-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

ALTER TABLE public.episode_characters
  DROP CONSTRAINT episode_characters_at_usable;

ALTER TABLE public.episode_characters
  DROP CONSTRAINT episode_characters_episode_id_at_key;

ALTER TABLE public.episode_messages
  DROP CONSTRAINT episode_messages_play_id_user_id_fkey;

ALTER TABLE public.episodes
  DROP CONSTRAINT episodes_cast_names_usable;

-- 삭제 이유: 2026-09-14 사용자가 중복 화자 목록 제거를 승인했다. episode_characters의 인물 연결을 유지한다.
ALTER TABLE public.episodes DROP COLUMN cast_names;

ALTER TABLE public.stories
  DROP CONSTRAINT stories_cover_emoji_usable;

-- 삭제 이유: 2026-09-14 사용자가 화면에서 쓰지 않는 표지 이모지 제거를 승인했다. 표지 이미지와 빈 표지 동작은 유지한다.
ALTER TABLE public.stories DROP COLUMN cover_emoji;

DROP INDEX public.episode_characters_story_idx;

ALTER TABLE public.episode_characters RENAME COLUMN at TO position;

DROP INDEX public.episode_messages_play_id_created_at_idx;

DROP POLICY episode_expression_results_select_own ON public.episode_expression_results;

DROP POLICY episode_expression_results_write_own_message ON public.episode_expression_results;

DROP POLICY saved_expressions_erase_own ON public.saved_expressions;

DROP POLICY saved_expressions_save_own ON public.saved_expressions;

ALTER TABLE public.episode_messages RENAME COLUMN play_id TO episode_play_id;



DROP POLICY saved_expressions_select_own ON public.saved_expressions;



DROP POLICY utterance_meanings_delete_pending ON public.utterance_meanings;

DROP POLICY utterance_meanings_insert_own ON public.utterance_meanings;

DROP POLICY utterance_meanings_read_own ON public.utterance_meanings;

DROP POLICY utterance_meanings_update_pending ON public.utterance_meanings;



CREATE FUNCTION public.check_expression_source()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if new.message_id is not null and not exists (
    select 1 from public.episode_messages m
    join public.episode_plays p on p.id = m.episode_play_id
    where m.id = new.message_id and m.user_id = new.user_id and p.episode_id = new.episode_id
      and m.role = case when new.kind = 'dialogue' then 'assistant' else 'user' end
  ) then
    raise exception 'Expression source does not match its owner, episode or kind.' using errcode = '23514';
  end if;
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.check_expression_source() FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.check_message_expression_result()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  target_id uuid;
  status text;
  total integer;
begin
  if tg_table_name = 'episode_messages' then
    target_id := new.id;
  elsif tg_op = 'DELETE' then
    target_id := old.message_id;
  else
    target_id := new.message_id;
  end if;
  select expression_status into status from public.episode_messages where id = target_id;
  if not found then return null; end if;
  select count(*) into total from public.expressions where message_id = target_id and kind <> 'dialogue';
  if (status = 'provided') is distinct from (total = 1) and not (status is null and total = 0) then
    raise exception 'Expression status and content must be committed together.' using errcode = '23514';
  end if;
  return null;
end;
$function$;

REVOKE ALL ON FUNCTION public.check_message_expression_result() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.create_story (
  story jsonb
)
  RETURNS TABLE (
    story_id         uuid,
    first_episode_id uuid
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  maker uuid := (select auth.uid());
  made_story_id uuid;
  chapters jsonb := create_story.story -> 'episodes';
  people jsonb := create_story.story -> 'characters';
begin
  if maker is null then
    raise exception 'A signed-in user is required to make a story.'
      using errcode = '28000';
  end if;

  -- 아래 insert들은 `jsonb_array_elements`로 배열을 편다. 그 함수는 배열이
  -- 아닌 값을 받으면 오류 없이 0행을 내므로, 화가 빠진 요청이 오면 스토리 행만
  -- 만들어지고 열 수 없는 스토리가 목록에 남는다. 스펙은 실패한 시도가 아무것도
  -- 남기지 않기를 요구하므로, 아무것도 넣기 전에 여기서 센다.
  --
  -- 이 함수는 `authenticated`가 PostgREST로 직접 부를 수 있다. API가 같은 것을
  -- 먼저 세지만 그 길을 건너뛴 요청도 여기서 걸린다.
  if jsonb_typeof(people) is distinct from 'array'
    or jsonb_array_length(people) not between 1 and 4
  then
    raise exception 'A story needs 1 to 4 characters.'
      using errcode = '22023';
  end if;

  if jsonb_typeof(chapters) is distinct from 'array'
    or jsonb_array_length(chapters) not between 1 and 5
  then
    raise exception 'A story needs 1 to 5 episodes.'
      using errcode = '22023';
  end if;

  -- 인물 자리는 이름표 색의 번호다. `unique (story_id, position)`이 문장 끝에
  -- 확인하는 제약이라, 겹친 번호는 함수가 값을 돌려준 뒤 커밋에서 터진다.
  -- 여기서 먼저 보면 무엇이 잘못됐는지가 오류에 드러난다.
  if (
    select count(distinct (person -> 'position')::int)
    from jsonb_array_elements(people) as person
    where jsonb_typeof(person -> 'position') = 'number'
      and (person -> 'position')::int
        between 1 and jsonb_array_length(people)
  ) <> jsonb_array_length(people)
  then
    raise exception 'Character positions must run from 1 without repeating.'
      using errcode = '22023';
  end if;

  -- 화마다 등장인물은 1명부터 3명까지 둔다.
  if exists (
    select 1
    from jsonb_array_elements(chapters) as chapter
    where jsonb_typeof(chapter -> 'castNames') is distinct from 'array'
      or jsonb_array_length(chapter -> 'castNames') not between 1 and 3
  ) then
    raise exception 'Every episode needs 1 to 3 characters.'
      using errcode = '22023';
  end if;

  insert into public.stories (
    owner_id,
    title,
    hook,
    intro,
    -- 이 제품이 가르치는 언어. 만드는 사람이 고르는 값이 아니다.
    target_language,
    completion_title,
    completion_copy
  )
  values (
    maker,
    create_story.story ->> 'title',
    create_story.story ->> 'hook',
    create_story.story ->> 'intro',
    'en',
    create_story.story ->> 'completionTitle',
    create_story.story ->> 'completionCopy'
  )
  returning id into made_story_id;

  insert into public.characters (story_id, name, position, persona)
  select
    made_story_id,
    person ->> 'name',
    (person ->> 'position')::smallint,
    person ->> 'persona'
  from jsonb_array_elements(create_story.story -> 'characters') as person;

  insert into public.episodes (
    story_id,
    number,
    title,
    preview,
    situation,
    situation_emoji,
    opening,
    stage,
    ending_success,
    ending_compromise,
    ending_failure
  )
  select
    made_story_id,
    (chapter ->> 'number')::smallint,
    chapter ->> 'title',
    chapter ->> 'preview',
    chapter ->> 'situation',
    chapter ->> 'situationEmoji',
    chapter ->> 'opening',
    chapter ->> 'stage',
    chapter ->> 'endingSuccess',
    chapter ->> 'endingCompromise',
    chapter ->> 'endingFailure'
  from jsonb_array_elements(create_story.story -> 'episodes') as chapter;

  insert into public.episode_characters (episode_id, character_id, story_id, position)
  select
    saved.id,
    person.id,
    made_story_id,
    standing.position::smallint
  from jsonb_array_elements(create_story.story -> 'episodes') as chapter
  cross join lateral jsonb_array_elements_text(chapter -> 'castNames')
    with ordinality as standing(name, position)
  join public.episodes saved
    on saved.story_id = made_story_id
    and saved.number = (chapter ->> 'number')::smallint
  -- 카드에 없는 이름은 여기서 짝을 찾지 못하고 빈 값이 된다. 안쪽 조인으로
  -- 이으면 그 줄이 조용히 사라져 인물이 하나 모자란 화가 저장되므로, 빈 값을
  -- 그대로 내보내 `character_id`의 not null에서 막는다. 그 실패가 문장 전체를
  -- 되돌린다.
  left join public.characters person
    on person.story_id = made_story_id
    and person.name = standing.name;

  return query
  select made_story_id, saved.id
  from public.episodes saved
  where saved.story_id = made_story_id
  order by saved.number
  limit 1;
end;
$function$;

CREATE FUNCTION public.remove_unsaved_orphan_expression()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  -- 삭제 이유: 2026-09-14 사용자가 원본과 저장 표시가 모두 없는 표현의 삭제를 승인했다.
  delete from public.expressions where id = new.id and message_id is null and saved_at is null;
  return null;
end;
$function$;

REVOKE ALL ON FUNCTION public.remove_unsaved_orphan_expression() FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.save_expression_result (
  p_message_id uuid,
  p_status     text,
  p_content    jsonb DEFAULT NULL::jsonb
)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  source_message public.episode_messages;
  source_episode uuid;
  source_original text;
begin
  select * into source_message from public.episode_messages m
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'user' for update;
  if not found then
    raise exception 'The user message is unavailable.' using errcode = '42501';
  end if;
  if source_message.expression_status is not null then
    return source_message.expression_status;
  end if;
  if p_status is null or p_status not in ('provided', 'natural', 'unclear') then
    raise exception 'Unknown expression status.' using errcode = '23514';
  end if;
  if p_status = 'provided' then
    select episode_id into source_episode from public.episode_plays where id = source_message.episode_play_id;
    select btrim(string_agg(part ->> 'text', '' order by n)) into source_original
    from jsonb_array_elements(source_message.parts) with ordinality as parts(part, n)
    where part ->> 'type' = 'text';
    insert into public.expressions(user_id, episode_id, message_id, kind, text, meaning, original, entries, situation, example, example_meaning)
    values (auth.uid(), source_episode, p_message_id,
      case when source_original ~ '[가-힣ㄱ-ㅎㅏ-ㅣ]' then 'translation' else 'correction' end,
      p_content ->> 'text', p_content ->> 'meaning', source_original, p_content -> 'entries',
      p_content ->> 'situation', p_content ->> 'example', p_content ->> 'exampleMeaning');
  elsif p_content is not null then
    raise exception 'A result without an expression cannot carry content.' using errcode = '23514';
  end if;
  update public.episode_messages set expression_status = p_status where id = p_message_id;
  return p_status;
end;
$function$;

REVOKE ALL ON FUNCTION public.save_expression_result(uuid, text, jsonb) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.save_expression_result(uuid, text, jsonb) TO authenticated;

CREATE FUNCTION public.stamp_expression_saved_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if new.saved_at is not null then
    if new.kind = 'dialogue' and new.meaning is null then
      raise exception 'A pending expression cannot be saved.' using errcode = '23514';
    end if;
    if tg_op = 'UPDATE' and old.saved_at is not null then
      new.saved_at := old.saved_at;
    else
      new.saved_at := clock_timestamp();
    end if;
  end if;
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.stamp_expression_saved_at() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.touch_story_play()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if new.role <> 'user' then
    return new;
  end if;

  update public.story_plays
  set last_user_message_at = greatest(
    coalesce(public.story_plays.last_user_message_at, new.created_at),
    new.created_at
  )
  from public.episode_plays played
  where played.id = new.episode_play_id
    and public.story_plays.id = played.story_play_id;

  return new;
end;
$function$;



ALTER TABLE public.episode_characters
  ADD CONSTRAINT episode_characters_episode_id_position_key UNIQUE (episode_id, "position") DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.episode_characters
  ADD CONSTRAINT episode_characters_position_usable CHECK ("position" >= 1 AND "position" <= 3);

CREATE INDEX episode_characters_story_idx ON public.episode_characters (story_id, "position");



ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_episode_play_id_user_id_fkey FOREIGN KEY (episode_play_id, user_id) REFERENCES public.episode_plays(id, user_id) ON DELETE CASCADE;

ALTER TABLE public.episode_messages
  ADD COLUMN expression_status text;

ALTER TABLE public.episode_messages
  ADD CONSTRAINT episode_messages_expression_status_known
    CHECK (expression_status IS NULL OR role = 'user'::text AND (expression_status = ANY (ARRAY['provided'::text, 'natural'::text, 'unclear'::text])));

REVOKE INSERT (id, parts, episode_play_id, ROLE) ON public.episode_messages FROM authenticated;

GRANT INSERT (episode_play_id, id, parts, ROLE) ON public.episode_messages TO authenticated;

CREATE INDEX episode_messages_episode_play_id_created_at_idx ON public.episode_messages (episode_play_id, created_at);

CREATE CONSTRAINT TRIGGER episode_messages_check_expression_result
  AFTER INSERT OR UPDATE ON public.episode_messages DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_expression_result();

CREATE TABLE public.expressions (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id         uuid                     DEFAULT auth.uid() NOT NULL,
  episode_id      uuid                     NOT NULL,
  message_id      uuid,
  kind            text                     NOT NULL,
  dialogue_index  smallint,
  text            text                     NOT NULL,
  meaning         text,
  speaker         text,
  original        text,
  entries         jsonb,
  situation       text,
  example         text,
  example_meaning text,
  saved_at        timestamp with time zone,
  claim_token     uuid,
  expires_at      timestamp with time zone,
  created_at      timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
  updated_at      timestamp with time zone DEFAULT clock_timestamp() NOT NULL
);

CREATE FUNCTION public.claim_dialogue_expression (
  p_message_id     uuid,
  p_dialogue_index integer,
  p_speaker        text,
  p_text           text,
  p_token          uuid
)
  RETURNS SETOF public.expressions
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  source_episode uuid;
begin
  select p.episode_id into source_episode from public.episode_messages m
  join public.episode_plays p on p.id = m.episode_play_id
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'assistant'
  for update of m;
  if not found then
    raise exception 'The dialogue source is unavailable.' using errcode = '42501';
  end if;
  insert into public.expressions(user_id, episode_id, message_id, kind, dialogue_index, speaker, text, claim_token, expires_at)
  values (auth.uid(), source_episode, p_message_id, 'dialogue', p_dialogue_index, p_speaker, p_text, p_token, clock_timestamp() + interval '30 seconds')
  on conflict (message_id, coalesce(dialogue_index, -1)) where message_id is not null
  do update set claim_token = excluded.claim_token, expires_at = excluded.expires_at
  where public.expressions.meaning is null and public.expressions.expires_at <= clock_timestamp();
  return query select * from public.expressions e
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index and e.user_id = auth.uid();
end;
$function$;

REVOKE ALL ON FUNCTION public.claim_dialogue_expression(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.claim_dialogue_expression(uuid, integer, text, text, uuid) TO authenticated;

CREATE FUNCTION public.complete_dialogue_expression (
  p_message_id     uuid,
  p_dialogue_index integer,
  p_token          uuid,
  p_meaning        text
)
  RETURNS SETOF public.expressions
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  perform 1 from public.episode_messages m
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'assistant' for update;
  if not found then
    raise exception 'The dialogue source is unavailable.' using errcode = '42501';
  end if;
  update public.expressions e set meaning = btrim(p_meaning), claim_token = null, expires_at = null
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index and e.user_id = auth.uid()
    and e.claim_token = p_token and e.expires_at > clock_timestamp() and e.meaning is null;
  return query select * from public.expressions e
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index
    and e.user_id = auth.uid() and e.meaning is not null;
  if not found then
    raise exception 'The expression claim expired or was replaced.' using errcode = '55000';
  end if;
end;
$function$;

REVOKE ALL ON FUNCTION public.complete_dialogue_expression(uuid, integer, uuid, text) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.complete_dialogue_expression(uuid, integer, uuid, text) TO authenticated;

ALTER TABLE public.expressions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_dialogue_index_check CHECK (dialogue_index >= 0 AND dialogue_index <= 100);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_entries_check CHECK (entries IS NULL OR jsonb_typeof(entries) = 'array'::text AND octet_length(entries::text) <= 65536);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_example_check CHECK (example IS NULL OR length(btrim(example)) >= 1 AND length(btrim(example)) <= 1000);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_example_meaning_check CHECK (example_meaning IS NULL OR length(btrim(example_meaning)) >= 1 AND length(btrim(example_meaning)) <= 1000);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_generation_whole CHECK (
CASE
    WHEN kind = 'dialogue'::text AND meaning IS NULL THEN claim_token IS NOT NULL AND expires_at IS NOT NULL AND saved_at IS NULL
    ELSE claim_token IS NULL AND expires_at IS NULL
END);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_kind_check CHECK (kind = ANY (ARRAY['dialogue'::text, 'correction'::text, 'translation'::text]));

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_learning_whole
    CHECK (kind = 'dialogue'::text OR jsonb_array_length(entries) > 0 AND (message_id IS NULL OR num_nonnulls(meaning, situation, example, example_meaning) = 4));

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_meaning_check CHECK (meaning IS NULL OR length(btrim(meaning)) >= 1 AND length(btrim(meaning)) <= 1000);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_message_id_user_id_fkey FOREIGN KEY (message_id, user_id) REFERENCES public.episode_messages(id, user_id) ON DELETE SET NULL (message_id);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_original_check CHECK (original IS NULL OR length(btrim(original)) >= 1 AND length(btrim(original)) <= 1000);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_pkey PRIMARY KEY (id);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_situation_check CHECK (situation IS NULL OR length(btrim(situation)) >= 1 AND length(btrim(situation)) <= 160);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_source_shape CHECK ((kind = 'dialogue'::text) = (dialogue_index IS NOT NULL) AND (kind = 'dialogue'::text) = (speaker IS
    NOT NULL) AND (kind <> 'dialogue'::text) = (original IS NOT NULL) AND (kind <> 'dialogue'::text) = (entries IS NOT NULL));

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_speaker_check CHECK (speaker IS NULL OR length(btrim(speaker)) >= 1 AND length(btrim(speaker)) <= 60);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_text_check CHECK (length(btrim(text)) >= 1 AND length(btrim(text)) <= 1000);

ALTER TABLE public.expressions
  ADD CONSTRAINT expressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.expressions TO anon;

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.expressions TO authenticated;

REVOKE INSERT, UPDATE ON public.expressions FROM authenticated;
GRANT UPDATE (saved_at) ON public.expressions TO authenticated;

GRANT ALL ON public.expressions TO service_role;

CREATE UNIQUE INDEX expressions_one_per_source_idx ON public.expressions (message_id, COALESCE(dialogue_index::integer, '-1'::integer))
  WHERE message_id IS NOT NULL;

CREATE INDEX expressions_episode_id_idx ON public.expressions (episode_id);

CREATE INDEX expressions_user_id_idx ON public.expressions (user_id);

CREATE INDEX expressions_user_id_saved_at_idx ON public.expressions (user_id, saved_at DESC)
  WHERE saved_at IS NOT NULL;

-- 같은 출처의 서로 다른 내용을 조용히 덮어쓰지 않는다. 불일치는 원본을 남기고 전환을 멈춘다.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.saved_expressions s JOIN public.utterance_meanings m
      ON m.message_id = s.message_id AND m.utterance_at = s.utterance_at
    WHERE m.meaning IS NOT NULL AND s.meaning IS DISTINCT FROM m.meaning
  ) OR EXISTS (
    SELECT 1 FROM public.saved_expressions s JOIN public.episode_expression_results r ON r.message_id = s.message_id
    WHERE s.kind <> 'utterance' AND (
      r.status <> 'corrected' OR s.english IS DISTINCT FROM r.fixed
      OR (s.meaning IS NOT NULL AND s.meaning IS DISTINCT FROM r.meaning)
      OR s.entries IS DISTINCT FROM (
        SELECT jsonb_agg(jsonb_build_object('original', e->'original', 'fixed', e->'fixed', 'why', e->'why') ORDER BY n)
        FROM jsonb_array_elements(r.entries) WITH ORDINALITY a(e,n)
      )
    )
  ) THEN
    RAISE EXCEPTION 'Expression content conflicts with a saved note; preserve the originals and resolve the merge decision.';
  END IF;
END;
$$;

-- 노트 ID와 담은 시각을 먼저 보존한다. 검사 결과에만 있던 부가 정보도 버리지 않는다.
INSERT INTO public.expressions(id, user_id, episode_id, message_id, kind, dialogue_index,
 text, meaning, speaker, original, entries, situation, example, example_meaning, saved_at, created_at, updated_at)
SELECT s.id, s.user_id, s.episode_id, s.message_id,
 CASE s.kind WHEN 'utterance' THEN 'dialogue' WHEN 'guidance' THEN 'translation' ELSE 'correction' END,
 s.utterance_at, s.english, coalesce(s.meaning, r.meaning), s.speaker, s.original,
 coalesce(r.entries, s.entries), r.situation, r.example, r.example_meaning,
 s.created_at, s.created_at, s.created_at
FROM public.saved_expressions s
LEFT JOIN public.episode_expression_results r ON r.message_id = s.message_id AND s.kind <> 'utterance';

-- 미저장 교정도 같은 표현 테이블에서 읽는다. 모델을 다시 부르지 않는다.
INSERT INTO public.expressions(user_id, episode_id, message_id, kind, text, meaning, original,
 entries, situation, example, example_meaning, created_at, updated_at)
SELECT r.user_id, p.episode_id, r.message_id,
 CASE WHEN original.text ~ '[가-힣ㄱ-ㅎㅏ-ㅣ]' THEN 'translation' ELSE 'correction' END,
 r.fixed, r.meaning, original.text, r.entries, r.situation, r.example, r.example_meaning,
 transaction_timestamp(), transaction_timestamp()
FROM public.episode_expression_results r
JOIN public.episode_messages m ON m.id = r.message_id
JOIN public.episode_plays p ON p.id = m.episode_play_id
CROSS JOIN LATERAL (
 SELECT btrim(string_agg(part->>'text', '' ORDER BY n)) AS text
 FROM jsonb_array_elements(m.parts) WITH ORDINALITY a(part,n) WHERE part->>'type' = 'text'
) original
WHERE r.status = 'corrected' AND NOT EXISTS (SELECT 1 FROM public.expressions e WHERE e.message_id = r.message_id);

-- AI 응답 한 행 안의 대사 순서를 그대로 읽는다. 이름 없는 서술은 대사로 세지 않는다.
WITH parts AS (
 SELECT m.id AS message_id, m.user_id, p.episode_id, part, n,
  count(*) FILTER (WHERE part->>'type' = 'data-speaker') OVER (PARTITION BY m.id ORDER BY n) AS segment
 FROM public.episode_messages m JOIN public.episode_plays p ON p.id = m.episode_play_id
 CROSS JOIN LATERAL jsonb_array_elements(m.parts) WITH ORDINALITY a(part,n)
 WHERE m.role = 'assistant'
), segments AS (
 SELECT message_id, user_id, episode_id, segment,
  max(part->'data'->>'name') FILTER (WHERE part->>'type' = 'data-speaker') AS speaker,
  string_agg(part->>'text', '' ORDER BY n) FILTER (WHERE part->>'type' = 'text') AS text
 FROM parts GROUP BY message_id, user_id, episode_id, segment
), dialogues AS (
 SELECT *, (row_number() OVER (PARTITION BY message_id ORDER BY segment) - 1)::smallint AS dialogue_index
 FROM segments WHERE speaker IS NOT NULL AND length(text) > 0
)
INSERT INTO public.expressions(user_id, episode_id, message_id, kind, dialogue_index, speaker, text,
 meaning, claim_token, expires_at, created_at, updated_at)
SELECT m.user_id, d.episode_id, m.message_id, 'dialogue', m.utterance_at, d.speaker, btrim(d.text), m.meaning,
 CASE WHEN m.meaning IS NULL THEN m.claim_token END, CASE WHEN m.meaning IS NULL THEN m.expires_at END,
 transaction_timestamp(), transaction_timestamp()
FROM public.utterance_meanings m JOIN dialogues d ON d.message_id = m.message_id AND d.dialogue_index = m.utterance_at
WHERE NOT EXISTS (SELECT 1 FROM public.expressions e WHERE e.message_id = m.message_id AND e.dialogue_index = m.utterance_at);

UPDATE public.episode_messages m SET expression_status = CASE r.status WHEN 'corrected' THEN 'provided' ELSE r.status END
FROM public.episode_expression_results r WHERE r.message_id = m.id;

-- 원본 데이터를 없애기 전에 ID, 내용, 뜻, 저장 시각과 완료 판정을 대조한다.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.saved_expressions s LEFT JOIN public.expressions e ON e.id = s.id
    WHERE e.id IS NULL OR e.user_id <> s.user_id OR e.episode_id <> s.episode_id
      OR e.message_id IS DISTINCT FROM s.message_id OR e.text IS DISTINCT FROM s.english
      OR e.saved_at IS DISTINCT FROM s.created_at OR e.original IS DISTINCT FROM s.original
      OR e.speaker IS DISTINCT FROM s.speaker OR e.dialogue_index IS DISTINCT FROM s.utterance_at
      OR (s.meaning IS NOT NULL AND e.meaning IS DISTINCT FROM s.meaning)
  ) OR EXISTS (
    SELECT 1 FROM public.utterance_meanings m LEFT JOIN public.expressions e
      ON e.message_id = m.message_id AND e.dialogue_index = m.utterance_at
    WHERE e.id IS NULL OR (m.meaning IS NOT NULL AND e.meaning IS DISTINCT FROM m.meaning)
  ) OR EXISTS (
    SELECT 1 FROM public.episode_expression_results r JOIN public.episode_messages m ON m.id = r.message_id
    LEFT JOIN public.expressions e ON e.message_id = r.message_id AND e.kind <> 'dialogue'
    WHERE m.expression_status IS DISTINCT FROM CASE r.status WHEN 'corrected' THEN 'provided' ELSE r.status END
      OR (r.status = 'corrected' AND (e.id IS NULL OR e.text IS DISTINCT FROM r.fixed
        OR e.entries IS DISTINCT FROM r.entries OR e.situation IS DISTINCT FROM r.situation
        OR e.meaning IS DISTINCT FROM r.meaning OR e.example IS DISTINCT FROM r.example
        OR e.example_meaning IS DISTINCT FROM r.example_meaning))
  ) OR EXISTS (
    SELECT 1 FROM public.expressions e JOIN public.episode_messages m ON m.id = e.message_id
    JOIN public.episode_plays p ON p.id = m.episode_play_id
    WHERE m.user_id <> e.user_id OR p.episode_id <> e.episode_id
      OR m.role <> CASE WHEN e.kind = 'dialogue' THEN 'assistant' ELSE 'user' END
  ) THEN
    RAISE EXCEPTION 'Expression preservation check failed; original data has not been removed.';
  END IF;
END;
$$;

CREATE TRIGGER expressions_01_stamp_saved_at
  BEFORE INSERT OR UPDATE ON public.expressions
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_expression_saved_at();

CREATE CONSTRAINT TRIGGER expressions_check_message_result
  AFTER INSERT OR DELETE OR UPDATE ON public.expressions DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_expression_result();

CREATE TRIGGER expressions_check_source
  BEFORE INSERT OR UPDATE OF message_id, user_id, episode_id, kind ON public.expressions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_expression_source();

CREATE TRIGGER expressions_remove_unsaved_orphan
  AFTER UPDATE ON public.expressions
  FOR EACH ROW
  WHEN (new.message_id IS NULL AND new.saved_at IS NULL)
  EXECUTE FUNCTION public.remove_unsaved_orphan_expression();

CREATE TRIGGER expressions_set_timestamps
  BEFORE INSERT OR UPDATE ON public.expressions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

CREATE POLICY expressions_read_own ON public.expressions
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY expressions_release_own_claim ON public.expressions
  FOR DELETE
  TO authenticated
  USING (((( SELECT auth.uid() AS uid) = user_id) AND (kind = 'dialogue'::text) AND (meaning IS NULL)));

CREATE POLICY expressions_save_own ON public.expressions
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

ALTER POLICY episode_messages_erase_open_play ON public.episode_messages USING (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_plays played
  WHERE ((played.id = episode_messages.episode_play_id) AND (played.finished_at IS NULL))))));

ALTER POLICY episode_messages_write_open_play ON public.episode_messages WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.episode_plays played
  WHERE ((played.id = episode_messages.episode_play_id) AND (played.finished_at IS NULL))))));

-- 삭제 이유: 2026-09-14 사용자가 표현 통합을 승인했다. episode_expression_results의 보존 대상은 위 검사를 통과해 expressions와 메시지 판정에서 읽을 수 있다.
DROP TABLE public.episode_expression_results;

-- 삭제 이유: 2026-09-14 사용자가 표현 통합을 승인했다. saved_expressions의 보존 대상은 위 검사를 통과해 expressions와 메시지 판정에서 읽을 수 있다.
DROP TABLE public.saved_expressions;

-- 삭제 이유: 2026-09-14 사용자가 표현 통합을 승인했다. utterance_meanings의 보존 대상은 위 검사를 통과해 expressions와 메시지 판정에서 읽을 수 있다.
DROP TABLE public.utterance_meanings;