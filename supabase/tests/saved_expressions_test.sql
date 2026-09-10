-- 손으로 담아 둔 표현의 접근 규칙을 확인한다. 자기 것만 읽고 지우며, 종류마다
-- 담을 수 있는 메시지의 역할이 다르고, 원본이 사라져도 항목은 남는다.
BEGIN;
SELECT plan(39);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'saved-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'saved-b@example.test');

-- 준비는 소유자 권한으로 한다. 회차와 플레이와 메시지를 만드는 규칙은 각자의
-- 테스트가 확인하므로, 여기서는 그 위에 담기는 행만 본다. seed의 스토리와 화는
-- DB가 만든 ID를 가지므로 slug와 화 번호로 찾는다.
INSERT INTO public.story_plays (id, user_id, story_id)
VALUES
  (
    'a0000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    (select id from public.stories where slug = 'mia-cafe')
  ),
  (
    'b0000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    (select id from public.stories where slug = 'mia-cafe')
  );

-- 1화는 결말이 났고 2화는 열려 있다. 끝난 화에서도 담을 수 있어야 하므로 둘 다
-- 필요하다.
INSERT INTO public.episode_plays (
  id, user_id, story_play_id, episode_id, ending_kind, ending_outcome, finished_at
)
VALUES (
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'a0000000-0000-4000-8000-000000000001',
  (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
  '성공', '새 아이스 아메리카노를 받아냈다.', now()
);

INSERT INTO public.episode_plays (id, user_id, story_play_id, episode_id)
VALUES
  (
    'aa000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'a0000000-0000-4000-8000-000000000001',
    (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 2)
  ),
  (
    'bb000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'b0000000-0000-4000-8000-000000000001',
    (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1)
  );

-- 끝난 1화의 장면 하나와 사용자 메시지 하나.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts)
VALUES
  (
    'cc000000-0000-4000-8000-000000000001',
    'aa000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'assistant',
    '[{"type":"data-speaker","data":{"name":"미아"}},{"type":"text","text":"Next in line, please!"}]'::jsonb
  ),
  (
    'cc000000-0000-4000-8000-000000000002',
    'aa000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'user',
    '[{"type":"text","text":"I order hot americano but this is ice latte."}]'::jsonb
  );

-- 열려 있는 2화의 장면 하나. 화가 어긋난 저장을 막는지 보는 데 쓴다.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000003',
  'aa000000-0000-4000-8000-000000000002',
  '11111111-1111-4111-8111-111111111111',
  'assistant',
  '[{"type":"data-speaker","data":{"name":"미아"}},{"type":"text","text":"Here you go."}]'::jsonb
);

-- 판정을 받지 않은 사용자 메시지 하나. 배울 표현이 없는 자리를 보는 데 쓴다.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000004',
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'user',
  '[{"type":"text","text":"Thank you."}]'::jsonb
);

-- 문제없다고 판정받은 사용자 메시지 하나. 판정은 받았지만 고친 문장이 없으므로
-- 담을 배울 표현이 없는 자리를 보는 데 쓴다.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000005',
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'user',
  '[{"type":"text","text":"Thank you very much."}]'::jsonb
);

-- 위 사용자 메시지들이 실제로 받은 판정. 배울 표현은 고친 문장이 있는 행에서만
-- 나온다.
INSERT INTO public.episode_expression_results (
  message_id, user_id, status, fixed, entries, situation, meaning, example,
  example_meaning
)
VALUES
  (
    'cc000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'corrected',
    'I ordered a hot americano, but this is an iced latte.',
    '[{"original":"order","fixed":"ordered","pattern":"past-tense","why":"지난 일은 ordered로 써요."}]'::jsonb,
    '받은 음료가 주문과 다를 때',
    '저는 뜨거운 아메리카노를 시켰는데 이건 아이스 라테예요.',
    'I ordered a tea, but this is a coffee.',
    '저는 차를 시켰는데 이건 커피예요.'
  ),
  (
    'cc000000-0000-4000-8000-000000000005',
    '11111111-1111-4111-8111-111111111111',
    'natural', NULL, NULL, NULL, NULL, NULL, NULL
  );

-- 다른 계정의 장면 하나.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts)
VALUES (
  'dd000000-0000-4000-8000-000000000001',
  'bb000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  'assistant',
  '[{"type":"data-speaker","data":{"name":"미아"}},{"type":"text","text":"Welcome."}]'::jsonb
);

SELECT has_table(
  'public', 'saved_expressions', 'public.saved_expressions exists'
);

SELECT ok(
  (
    SELECT relrowsecurity
    FROM pg_class
    WHERE oid = 'public.saved_expressions'::regclass
  ),
  'row level security is on'
);

-- 참조는 각본을 가리킨다. 회차를 지워도 카드의 출처 표시가 남는 이유다.
SELECT col_is_fk(
  'public', 'saved_expressions', ARRAY['episode_id'],
  'a saved expression points at the script it came from'
);

SELECT col_is_fk(
  'public', 'saved_expressions', ARRAY['message_id'],
  'and at the message it sat next to'
);

-- 원본이 사라져도 항목은 남아야 하므로 이 참조만 끊긴다.
SELECT is(
  (
    SELECT confdeltype
    FROM pg_constraint
    WHERE conrelid = 'public.saved_expressions'::regclass
      AND confrelid = 'public.episode_messages'::regclass
  ),
  'n'::"char",
  'losing the message clears the reference instead of the row'
);

-- 종류가 채우는 열을 정한다. 반쪽 항목은 카드가 읽을 수 없다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (user_id, kind, episode_id, message_id, utterance_at, english, speaker)
    values (
      '11111111-1111-4111-8111-111111111111', 'utterance',
      (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000001', 0, 'Next in line, please!', '미아'
    )$$,
  '23514',
  NULL,
  'a character line without a Korean meaning is refused'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (user_id, kind, episode_id, message_id, english, original)
    values (
      '11111111-1111-4111-8111-111111111111', 'correction',
      (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000002',
      'I ordered a hot americano.', 'I order hot americano.'
    )$$,
  '23514',
  NULL,
  'a correction without its changed parts is refused'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (user_id, kind, episode_id, message_id, english, original, entries)
    values (
      '11111111-1111-4111-8111-111111111111', 'shopping-list',
      (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000002',
      'I ordered a hot americano.', 'I order hot americano.', '[]'::jsonb
    )$$,
  '23514',
  NULL,
  'an unknown kind is refused'
);

-- 권한. 앱은 담고, 읽고, 지운다. 고쳐 쓰지는 않는다. 담는 것은 열 단위 권한이라
-- 테이블 전체로는 잡히지 않고 아래에서 열마다 확인한다.
SELECT ok(
  (
    SELECT bool_and(
      has_table_privilege('authenticated', 'public.saved_expressions', p)
    )
    FROM unnest(ARRAY['SELECT', 'DELETE']) AS p
  ),
  'authenticated may read and erase'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.saved_expressions', 'UPDATE'),
  'and may not rewrite a saved expression'
);

SELECT ok(
  (
    SELECT bool_and(
      has_column_privilege('authenticated', 'public.saved_expressions', c, 'INSERT')
    )
    FROM unnest(ARRAY[
      'kind', 'episode_id', 'message_id', 'utterance_at', 'english', 'meaning',
      'speaker', 'original', 'entries'
    ]) AS c
  ),
  'every value the app sends is insertable'
);

SELECT ok(
  NOT has_column_privilege(
    'authenticated', 'public.saved_expressions', 'user_id', 'INSERT'
  ),
  'but the owner is not sent by the app'
);

SELECT ok(
  NOT has_column_privilege(
    'authenticated', 'public.saved_expressions', 'created_at', 'INSERT'
  ),
  'and neither is the time it was saved'
);

SELECT ok(
  NOT (
    SELECT bool_or(
      has_table_privilege('anon', 'public.saved_expressions', p)
    )
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'a signed-out caller reaches none of it'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

-- 끝난 화의 인물 대사를 담는다. 결말이 대화를 얼려도 담는 것은 막지 않는다.
SELECT lives_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000001', 0,
      'Next in line, please!', '다음 분이요!', '미아'
    )$$,
  'a character line in a finished episode can still be saved'
);

SELECT is(
  (SELECT user_id FROM public.saved_expressions),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'and the database fills in who saved it'
);

-- 한 장면에 대사가 여럿이면 각각 따로 담긴다.
SELECT lives_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000001', 1,
      'Was there something wrong?', '무슨 문제가 있었나요?', '미아'
    )$$,
  'another utterance in the same scene is saved on its own'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000001', 0,
      'Next in line, please!', '다음 분이요!', '미아'
    )$$,
  '23505',
  NULL,
  'but the same utterance cannot be saved twice'
);

SELECT lives_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, english, original, entries)
    values (
      'correction', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000002',
      'I ordered a hot americano, but this is an iced latte.',
      'I order hot americano but this is ice latte.',
      '[{"original":"order","fixed":"ordered","why":"지난 일은 ordered로 써요."}]'::jsonb
    )$$,
  'a correction on my own message is saved'
);

-- 영어 교정과 한국어 안내는 같은 판정의 다른 이름이라 한 메시지에 함께 설 수
-- 없다. 자리는 종류가 아니라 메시지가 정한다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, english, original, entries)
    values (
      'guidance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000002',
      'I ordered a hot americano, but this is an iced latte.',
      'I order hot americano but this is ice latte.',
      '[{"original":"ice","fixed":"iced","why":"얼음 넣은 음료는 iced예요."}]'::jsonb
    )$$,
  '23505',
  NULL,
  'and one message gives one learning note, whichever kind it is'
);

-- 배울 표현은 실제로 판정을 받은 메시지에서만 나온다. 아무 말에나 지어낸 교정을
-- 붙이는 문장은 여기서 막힌다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, english, original, entries)
    values (
      'correction', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000004',
      'Thanks a lot.', 'Thank you.',
      '[{"original":"Thank you","fixed":"Thanks a lot","why":"지어낸 이유."}]'::jsonb
    )$$,
  '42501',
  NULL,
  'a message that was never judged has no learning note to save'
);

-- 판정은 받았어도 고친 문장이 없으면 담을 배울 표현이 없다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, english, original, entries)
    values (
      'correction', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000005',
      'Thanks a lot.', 'Thank you very much.',
      '[{"original":"Thank you very much","fixed":"Thanks a lot","why":"지어낸 이유."}]'::jsonb
    )$$,
  '42501',
  NULL,
  'a message judged fine has no learning note to save either'
);

-- 종류마다 담을 수 있는 역할이 다르다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000002', 0,
      'I order hot americano but this is ice latte.', '아메리카노를 시켰어요.', '미아'
    )$$,
  '42501',
  NULL,
  'my own words cannot be saved as a character line'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, english, original, entries)
    values (
      'guidance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000001',
      'Next in line, please!', '다음 분이요!',
      '[{"original":"","fixed":"","why":"x"}]'::jsonb
    )$$,
  '42501',
  NULL,
  'and a character line cannot be saved as guidance'
);

-- 적어 낸 화가 그 메시지가 오간 화여야 한다. 아니면 출처 표시를 앱 밖에서 고를 수
-- 있게 된다.
SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'cc000000-0000-4000-8000-000000000003', 0,
      'Here you go.', '여기 있습니다.', '미아'
    )$$,
  '42501',
  NULL,
  'a saved expression cannot claim an episode the message never reached'
);

-- 같은 자리 번호를 쓰는 두 번째 대사. 아래에서 둘 다 원본을 잃었을 때 서로
-- 부딪히지 않는지 보는 데 쓴다.
SELECT lives_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 2),
      'cc000000-0000-4000-8000-000000000003', 0,
      'Here you go.', '여기 있습니다.', '미아'
    )$$,
  'the same seat number in another scene is its own item'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (kind, episode_id, message_id, utterance_at, english, meaning, speaker)
    values (
      'utterance', (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
      'dd000000-0000-4000-8000-000000000001', 0,
      'Welcome.', '어서 오세요.', '미아'
    )$$,
  '42501',
  NULL,
  'and cannot be hung on another account''s message'
);

-- 원본이 사라져도 항목은 남는다. 담는 것은 사용자가 직접 한 행동이라, 다시 받기로
-- 함께 사라지면 잃어버린 것이 된다.
RESET ROLE;

DELETE FROM public.episode_messages
WHERE id IN (
  'cc000000-0000-4000-8000-000000000001',
  'cc000000-0000-4000-8000-000000000003'
);

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE kind = 'utterance' AND message_id IS NULL
  ),
  3::bigint,
  'saved utterances outlive the messages they came from'
);

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE english = 'Next in line, please!'
      AND user_id = '11111111-1111-4111-8111-111111111111'
  ),
  1::bigint,
  'and keep their owner while the reference goes'
);

-- 참조를 잃은 항목끼리는 같은 자리를 가리키지 않으므로 부딪히지 않는다. 두 대사가
-- 모두 자기 장면의 첫 자리였는데도 둘 다 남아 있다.
SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE message_id IS NULL AND kind = 'utterance' AND utterance_at = 0
      AND user_id = '11111111-1111-4111-8111-111111111111'
  ),
  2::bigint,
  'orphaned rows do not collide with each other'
);

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE episode_id = (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1)
      AND user_id = '11111111-1111-4111-8111-111111111111'
  ),
  3::bigint,
  'an orphaned item still names the episode it came from'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 0::bigint,
  'another account sees none of the first one''s saved expressions'
);

SELECT lives_ok(
  $$delete from public.saved_expressions$$,
  'a delete aimed at another account''s rows raises nothing'
);

RESET ROLE;

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  4::bigint,
  'and removes nothing'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 4::bigint,
  'the owner sees every expression they saved'
);

-- 책갈피를 다시 누르는 취소와 표현 노트에서 미는 삭제가 같은 문장이다.
SELECT lives_ok(
  $$delete from public.saved_expressions where kind = 'correction'$$,
  'the owner erases what they saved'
);

SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 3::bigint,
  'and it is gone'
);

SELECT throws_ok(
  $$update public.saved_expressions set english = 'rewritten'$$,
  '42501',
  NULL,
  'nobody rewrites a saved expression'
);

RESET ROLE;

-- 계정이 사라지면 담은 것도 함께 사라진다.
DELETE FROM auth.users WHERE id = '11111111-1111-4111-8111-111111111111';

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'deleting the account takes its saved expressions with it'
);

SELECT * FROM finish();
ROLLBACK;
