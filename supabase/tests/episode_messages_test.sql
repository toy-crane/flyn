-- 대화 메시지와 교정의 접근 규칙을 확인한다. 자기 행에만 쓰고, 결말이 난
-- 플레이는 더 이상 바뀌지 않으며, 교정은 자기가 쓴 메시지에만 붙는다.
BEGIN;
SELECT plan(43);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'messages-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'messages-b@example.test');

-- 준비는 소유자 권한으로 한다. 플레이를 여는 규칙은 episode_plays_test.sql이
-- 확인하므로, 여기서는 그 아래 매달리는 행만 본다. id를 직접 적어 두면 뒤의
-- 문장이 어느 플레이를 가리키는지 읽힌다.
INSERT INTO public.episode_plays (
  id, user_id, episode_id, ending_kind, ending_outcome, finished_at
)
VALUES (
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  '11000000-0000-4000-8000-000000000001',
  '성공', '새 아이스 아메리카노를 받아냈다.', now()
);

INSERT INTO public.episode_plays (id, user_id, episode_id)
VALUES
  (
    'aa000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '11000000-0000-4000-8000-000000000002'
  ),
  (
    'bb000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    '11000000-0000-4000-8000-000000000001'
  );

-- 끝난 플레이가 남긴 메시지 한 건. 읽기 전용 대화 기록의 자리다.
INSERT INTO public.episode_messages (id, play_id, user_id, position, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000009',
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  0, 'user', '[{"type":"text","text":"Can I get another one?"}]'::jsonb
);

SELECT has_table('public', 'episode_messages', 'public.episode_messages exists');

SELECT has_table(
  'public', 'episode_corrections', 'public.episode_corrections exists'
);

SELECT col_is_pk(
  'public', 'episode_messages', ARRAY['id'],
  'a message keeps the id the AI SDK gave it'
);

SELECT col_is_unique(
  'public', 'episode_messages', ARRAY['play_id', 'position'],
  'two messages cannot claim the same place in one conversation'
);

-- 자식이 나르는 user_id가 부모의 주인과 어긋날 수 없게 만드는 두 쌍. 그래서
-- 정책이 조인 없이 자기 열만 보고 답한다.
SELECT fk_ok(
  'public', 'episode_messages', ARRAY['play_id', 'user_id'],
  'public', 'episode_plays', ARRAY['id', 'user_id'],
  'a message belongs to a play and to that play''s owner'
);

SELECT fk_ok(
  'public', 'episode_corrections', ARRAY['message_id', 'user_id'],
  'public', 'episode_messages', ARRAY['id', 'user_id'],
  'a correction belongs to a message and to that message''s owner'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.episode_messages'::regclass),
  'row level security is enabled on episode_messages'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.episode_corrections'::regclass),
  'row level security is enabled on episode_corrections'
);

SELECT policies_are(
  'public', 'episode_messages',
  ARRAY[
    'episode_messages_select_own',
    'episode_messages_write_open_play',
    'episode_messages_erase_open_play'
  ],
  'a person may read, add and remove their own messages, and never rewrite one'
);

SELECT policies_are(
  'public', 'episode_corrections',
  ARRAY[
    'episode_corrections_select_own',
    'episode_corrections_write_own_message'
  ],
  'a correction is added and read, never rewritten or removed on its own'
);

-- Only the privileges PostgREST can act on are pinned. The REFERENCES, TRIGGER,
-- TRUNCATE and MAINTAIN a new table arrives with have no Data API route, and are
-- accepted. See docs/decisions/supabase-schema-workflow.md.
SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('anon', 'public.episode_messages', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'anon cannot reach episode_messages through the Data API'
);

SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('anon', 'public.episode_corrections', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'anon cannot reach episode_corrections through the Data API'
);

SELECT ok(
  (
    SELECT bool_and(has_table_privilege('authenticated', 'public.episode_messages', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'DELETE']) AS p
  )
  AND NOT (
    SELECT has_table_privilege('authenticated', 'public.episode_messages', 'UPDATE')
  ),
  'a message is added or removed whole, never edited in place'
);

SELECT ok(
  (
    SELECT bool_and(has_table_privilege('authenticated', 'public.episode_corrections', p))
    FROM unnest(ARRAY['SELECT', 'INSERT']) AS p
  )
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.episode_corrections', p))
    FROM unnest(ARRAY['UPDATE', 'DELETE']) AS p
  ),
  'a correction follows the message it hangs from'
);

SET LOCAL ROLE anon;

SELECT throws_ok(
  $$select * from public.episode_messages$$,
  '42501', NULL, 'anon cannot read anyone''s conversation'
);

SELECT throws_ok(
  $$select * from public.episode_corrections$$,
  '42501', NULL, 'anon cannot read anyone''s corrections'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT lives_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000001',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      0, 'user', '[{"type":"text","text":"I want to change my order."}]'
    )$$,
  'a person adds a message to a play that is still open'
);

SELECT lives_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000002',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      1, 'assistant', '[{"type":"text","text":"Mia looks up."}]'
    )$$,
  'and the scene that answers it'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      1, 'assistant', '[{"type":"text","text":"두 번째 1번 자리."}]'
    )$$,
  '23505', NULL, 'two messages cannot take the same place'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      -1, 'user', '[{"type":"text","text":"음수 자리."}]'
    )$$,
  '23514', NULL, 'a message cannot sit before the start of the conversation'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      2, 'system', '[{"type":"text","text":"세 번째 역할."}]'
    )$$,
  '23514', NULL, 'only the two roles a conversation has are accepted'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      2, 'user', '{"type":"text","text":"배열이 아닌 parts."}'
    )$$,
  '23514', NULL, 'parts is a list of parts, not a single one'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      1, 'user', '[{"type":"text","text":"끝난 화에 덧붙이기."}]'
    )$$,
  '42501', NULL, 'a finished play accepts no further message'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'bb000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      0, 'user', '[{"type":"text","text":"남의 플레이에 쓰기."}]'
    )$$,
  '42501', NULL, 'a person cannot write into somebody else''s play'
);

SELECT throws_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000003',
      'aa000000-0000-4000-8000-000000000002',
      '22222222-2222-4222-8222-222222222222',
      2, 'user', '[{"type":"text","text":"남의 이름으로 쓰기."}]'
    )$$,
  '42501', NULL, 'a person cannot sign a message with another account'
);

-- 끝난 플레이는 지우는 것도 막힌다. 정책은 대상 행을 걸러내므로 오류가 아니라
-- 아무 일도 일어나지 않는 것으로 나타난다.
SELECT lives_ok(
  $$delete from public.episode_messages
    where play_id = 'aa000000-0000-4000-8000-000000000001'$$,
  'removing from a finished play raises nothing'
);

SELECT is(
  (SELECT count(*) FROM public.episode_messages
   WHERE play_id = 'aa000000-0000-4000-8000-000000000001'),
  1::bigint,
  'and leaves the finished transcript exactly as it was'
);

SELECT lives_ok(
  $$insert into public.episode_corrections (message_id, user_id, original, corrected, reason)
    values (
      'cc000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      'I want to change my order.',
      'Could I change my order?',
      '부탁할 때는 Could I가 자연스럽습니다.'
    )$$,
  'a correction hangs from the sentence the person wrote'
);

SELECT lives_ok(
  $$insert into public.episode_corrections (message_id, user_id, original, corrected, reason)
    values (
      'cc000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      'change',
      'Could I change my order?',
      '같은 문장에 배울 표현이 둘 붙을 수 있습니다.'
    )$$,
  'and one message can carry more than one'
);

SELECT throws_ok(
  $$insert into public.episode_corrections (message_id, user_id, original, corrected, reason)
    values (
      'cc000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      'Mia looks up.',
      'Mia looked up.',
      '상대의 대사를 고치려는 시도.'
    )$$,
  '42501', NULL, 'a correction never hangs from the other side''s line'
);

SELECT throws_ok(
  $$insert into public.episode_corrections (message_id, user_id, original, corrected, reason)
    values (
      'cc000000-0000-4000-8000-000000000009',
      '11111111-1111-4111-8111-111111111111',
      'Can I get another one?',
      'Could I get another one?',
      '끝난 화에 뒤늦게 붙이려는 시도.'
    )$$,
  '42501', NULL, 'a finished play accepts no further correction'
);

SELECT throws_ok(
  $$insert into public.episode_corrections (message_id, user_id, original, corrected, reason)
    values (
      'cc000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      'change',
      'Could I change my order?',
      '   '
    )$$,
  '23514', NULL, 'a correction without a reason line is refused'
);

-- 계정에 쌓인 배울 표현을 한 번에 꺼내는 조회. 화를 가로질러 세지만 조인이
-- 필요 없다.
SELECT is(
  (SELECT count(*) FROM public.episode_corrections),
  2::bigint,
  'every 배울 표현 this account has received comes back in one read'
);

-- 특정 화에서 쓴 문장 전체도 한 번의 조회로 나온다.
SELECT is(
  (SELECT count(*) FROM public.episode_messages
   WHERE play_id = 'aa000000-0000-4000-8000-000000000002'
     AND role = 'user'),
  1::bigint,
  'and so does everything this account wrote in one episode'
);

-- 다시 받기와 수정은 기준 메시지와 그 뒤를 지운다.
SELECT lives_ok(
  $$delete from public.episode_messages
    where play_id = 'aa000000-0000-4000-8000-000000000002'
      and position >= 1$$,
  'a retry removes the answer it replaces'
);

SELECT is(
  (SELECT count(*) FROM public.episode_messages
   WHERE play_id = 'aa000000-0000-4000-8000-000000000002'),
  1::bigint,
  'and the conversation keeps everything before it'
);

SELECT lives_ok(
  $$insert into public.episode_messages (id, play_id, user_id, position, role, parts)
    values (
      'cc000000-0000-4000-8000-000000000004',
      'aa000000-0000-4000-8000-000000000002',
      '11111111-1111-4111-8111-111111111111',
      1, 'assistant', '[{"type":"text","text":"Mia smiles."}]'
    )$$,
  'the new answer takes the place the removed one left'
);

SELECT lives_ok(
  $$delete from public.episode_messages
    where id = 'cc000000-0000-4000-8000-000000000001'$$,
  'removing a message the person wrote raises nothing'
);

SELECT is(
  (SELECT count(*) FROM public.episode_corrections),
  0::bigint,
  'and its corrections leave with it'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.episode_messages), 0::bigint,
  'another account sees none of the first one''s conversation'
);

SELECT is(
  (SELECT count(*) FROM public.episode_corrections), 0::bigint,
  'and none of its corrections'
);

SELECT lives_ok(
  $$delete from public.episode_messages
    where play_id = 'aa000000-0000-4000-8000-000000000002'$$,
  'a delete aimed at another account''s play raises nothing'
);

RESET ROLE;

SELECT is(
  (SELECT count(*) FROM public.episode_messages
   WHERE play_id = 'aa000000-0000-4000-8000-000000000002'),
  1::bigint,
  'and removes nothing'
);

SELECT * FROM finish();
ROLLBACK;
