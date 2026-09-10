-- 사용자가 만든 스토리가 만든 사람에게만 보이는지 확인한다.
--
-- 탐색은 로그인한 모든 사람에게 공식 스토리를 보여 준다. 거기에 사용자가 만든
-- 스토리가 들어오면서, 같은 테이블이 "누구에게나 보이는 행"과 "한 사람에게만
-- 보이는 행"을 함께 담게 됐다. 그 둘을 가르는 것이 `owner_id` 하나이고,
-- 가르는 자리는 API가 아니라 정책이다. API는 사용자 자신의 클라이언트로
-- 데이터베이스를 부르므로, 여기서 새면 어디서도 막지 못한다.
--
-- 공식 스토리는 `slug`와 `position`으로 seed가 다시 찾아 덮어쓰고, 사용자가
-- 만든 스토리는 그 둘을 갖지 않는다. seed를 다시 실행해도 사용자의 스토리가
-- 걸리지 않는 이유가 이 구분이다.
BEGIN;
SELECT plan(17);

INSERT INTO auth.users (id, email)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'maker@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'other@example.test');

SELECT has_column(
  'public', 'stories', 'owner_id',
  'a story records who made it'
);

SELECT has_column(
  'public', 'stories', 'created_at',
  'a story records when it was made, so a list can put the newest first'
);

SELECT col_is_null(
  'public', 'stories', 'slug',
  'a made story carries no slug, so official seed cannot match it'
);

SELECT col_is_null(
  'public', 'stories', 'position',
  'a made story carries no place among official content'
);

SELECT ok(
  (SELECT bool_and(owner_id IS NULL) FROM public.stories),
  'every official story belongs to no one'
);

-- 공식 스토리는 자리와 slug를 함께 갖고, 만든 스토리는 둘 다 갖지 않는다.
-- 한쪽만 가진 행은 seed가 절반만 찾아내는 행이라 만들지 못하게 막는다.
SELECT throws_ok(
  $$insert into public.stories (
      owner_id, slug, title, hook, intro, cover_emoji,
      target_language, completion_title, completion_copy
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'made-up', '만든 스토리',
      '훅', '소개', '🧳', 'en', '끝', '완주'
    )$$,
  '23514', NULL,
  'a made story cannot take a slug'
);

SELECT throws_ok(
  $$insert into public.stories (
      title, hook, intro, cover_emoji,
      target_language, completion_title, completion_copy
    )
    values ('주인 없는 스토리', '훅', '소개', '📘', 'en', '끝', '완주')$$,
  '23514', NULL,
  'an official story cannot go without a slug and a place'
);

-- 사용자가 만든 스토리 하나. 인물 둘과 화 하나가 달려 있다.
INSERT INTO public.stories (
  id, owner_id, title, hook, intro, cover_emoji,
  target_language, completion_title, completion_copy
)
VALUES (
  '55555555-5555-4555-8555-555555555555',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '베를린 출장 일주일',
  '다음 달 베를린 출장인데, 호텔부터 거래처 미팅까지 혼자 해내야 해요',
  '첫 해외 출장으로 떠난 베를린에서 보내는 일주일.',
  '🧳',
  'en',
  '출장을 마쳤어요',
  '호텔부터 미팅까지 영어로 지나왔어요.'
);

INSERT INTO public.characters (id, story_id, name, position, persona)
VALUES
  (
    '66666666-6666-4666-8666-666666666666',
    '55555555-5555-4555-8555-555555555555',
    'Lena', 1,
    '30대 호텔 프런트 직원이다. 규정을 정확히 지키고 근거가 보이면 방법을 찾아 준다.'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    '55555555-5555-4555-8555-555555555555',
    'Markus', 2,
    '40대 거래처 담당자다. 숫자 근거를 집요하게 묻는다.'
  );

INSERT INTO public.episodes (
  id, story_id, number, title, preview, situation, situation_emoji,
  opening, stage, cast_names,
  ending_success, ending_compromise, ending_failure
)
VALUES (
  '88888888-8888-4888-8888-888888888888',
  '55555555-5555-4555-8555-555555555555',
  1, '예약이 없는 호텔',
  '밤 열한 시에 도착했는데 프런트에 제 예약이 없대요.',
  '예약을 찾아 오늘 밤 묵을 방을 받아 보세요', '🏨',
  E'밤 열한 시, 베를린 호텔 프런트 앞에 도착했다.\nLena: I can''t find a reservation under your name.',
  E'상황:\n- 사용자는 예약 확인 이메일을 가지고 있다.\n- 사용자가 말을 해야 이 일이 풀린다.',
  ARRAY['Lena'],
  '방을 배정받았을 때', '임시 해결 방법을 받았을 때', '방을 받지 못했을 때'
);

INSERT INTO public.episode_characters (episode_id, character_id, story_id, at)
VALUES (
  '88888888-8888-4888-8888-888888888888',
  '66666666-6666-4666-8666-666666666666',
  '55555555-5555-4555-8555-555555555555',
  1
);

-- 만든 사람이 본다.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.stories), 6::bigint,
  'the maker sees the five official stories and the one they made'
);

SELECT is(
  (SELECT count(*) FROM public.characters WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  2::bigint,
  'the maker sees the people in their own story'
);

SELECT is(
  (SELECT count(*) FROM public.episodes WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  1::bigint,
  'the maker sees the episodes of their own story'
);

SELECT is(
  (SELECT count(*) FROM public.episode_characters WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  1::bigint,
  'the maker sees who stands in their own episode'
);

RESET ROLE;

-- 다른 사람은 그 스토리가 있다는 것조차 알지 못한다.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.stories), 5::bigint,
  'another person sees only the official stories'
);

SELECT is(
  (SELECT count(*) FROM public.characters WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  0::bigint,
  'another person cannot reach the people in a story they did not make'
);

SELECT is(
  (SELECT count(*) FROM public.episodes WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  0::bigint,
  'another person cannot reach the episodes of a story they did not make'
);

SELECT is(
  (SELECT count(*) FROM public.episode_characters WHERE story_id = '55555555-5555-4555-8555-555555555555'),
  0::bigint,
  'another person cannot reach the cast of an episode they cannot see'
);

RESET ROLE;

-- 사용자가 만든 스토리는 seed의 열쇠를 갖지 않으므로, 공식 콘텐츠를 다시
-- 올리는 문장이 그 행을 찾아내지 못한다.
SELECT is(
  (SELECT count(*) FROM public.stories WHERE slug IS NOT NULL), 5::bigint,
  'only official stories answer to a slug, so re-running the seed leaves made stories alone'
);

SELECT ok(
  (SELECT created_at IS NOT NULL FROM public.stories
    WHERE id = '55555555-5555-4555-8555-555555555555'),
  'a made story records when it was made without the caller saying so'
);

SELECT * FROM finish();
ROLLBACK;
