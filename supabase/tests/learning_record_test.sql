-- 연속 기록과 영어로 말한 횟수를 기기의 하루로 묶어 읽는 두 함수를 확인한다.
--
-- 하루의 경계는 기기의 현지 자정이라 앱이 시간대 이름과 오늘 날짜를 보낸다.
-- 두 함수는 학습 사실만 읽으므로 회차를 지워도 같은 값을 돌려준다. 무엇을
-- 학습 사실로 남기는지는 story_plays_test가 확인한다.
BEGIN;
SELECT plan(24);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'streak-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'streak-b@example.test'),
  ('33333333-3333-4333-8333-333333333333', 'streak-new@example.test');

-- A는 9월 2일부터 13일까지 서울 시각 밤 9시에 매일 한 화를 끝냈다. 9월 5일에는
-- 두 화를 끝냈다. 9월 1일에는 영어로 말하기만 하고 화를 끝내지 않았다.
INSERT INTO public.learning_events (kind, source_id, user_id, occurred_at)
SELECT
  'episode_completed',
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  (day::date + time '21:00') AT TIME ZONE 'Asia/Seoul'
FROM generate_series(date '2026-09-02', date '2026-09-13', interval '1 day') AS day;

INSERT INTO public.learning_events (kind, source_id, user_id, occurred_at)
VALUES
  ('episode_completed', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-09-05 22:30:00+09');

-- 9월 12일의 영어 메시지 6개. 그중 하나는 서울 시각 0시 10분이라 UTC로는
-- 전날이다. 기기의 하루로 묶으면 12일에 들어간다.
INSERT INTO public.learning_events (kind, source_id, user_id, occurred_at)
SELECT
  'english_message',
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  timestamptz '2026-09-12 20:00:00+09' + (n * interval '1 minute')
FROM generate_series(1, 5) AS n;

INSERT INTO public.learning_events (kind, source_id, user_id, occurred_at)
VALUES
  ('english_message', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-09-12 00:10:00+09'),
  ('english_message', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-09-01 19:00:00+09'),
  ('english_message', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-09-01 19:05:00+09'),
  ('english_message', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-09-03 19:05:00+09'),
  -- 기록이 가장 먼저 시작된 날. 3월의 영어 메시지다.
  ('english_message', gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   timestamptz '2026-03-04 19:00:00+09');

-- B는 다른 사람이다. A가 읽는 값에 섞이지 않는다.
INSERT INTO public.learning_events (kind, source_id, user_id, occurred_at)
VALUES
  ('episode_completed', gen_random_uuid(), '22222222-2222-4222-8222-222222222222',
   timestamptz '2026-09-13 10:00:00+09'),
  ('english_message', gen_random_uuid(), '22222222-2222-4222-8222-222222222222',
   timestamptz '2026-09-12 10:00:00+09'),
  ('english_message', gen_random_uuid(), '22222222-2222-4222-8222-222222222222',
   timestamptz '2026-01-20 10:00:00+09');

SELECT ok(
  NOT has_function_privilege('anon', 'public.learning_streak(text,date)', 'EXECUTE')
  AND NOT has_function_privilege('anon', 'public.learning_days(text,date,date)', 'EXECUTE'),
  'a signed-out caller cannot read any study record'
);

SELECT ok(
  has_function_privilege('authenticated', 'public.learning_streak(text,date)', 'EXECUTE')
  AND has_function_privilege('authenticated', 'public.learning_days(text,date,date)', 'EXECUTE'),
  'a signed-in person can read their own study record'
);

SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.learning_streak(text,date)'::regprocedure)
  OR (SELECT prosecdef FROM pg_proc WHERE oid = 'public.learning_days(text,date,date)'::regprocedure),
  false,
  'both reads run as the caller so row level security decides whose facts they see'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-13')),
  12,
  'finishing an episode every day from the 2nd to the 13th is 12 days on the 13th'
);

SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-14')),
  12,
  'the 14th has not finished an episode yet and still shows the run through yesterday'
);

SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-15')),
  0,
  'a whole day without finishing an episode ends the run'
);

SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-10')),
  9,
  'the run is counted up to the day the device calls today'
);

SELECT is(
  (SELECT first_day FROM public.learning_streak('Asia/Seoul', date '2026-09-13')),
  date '2026-03-04',
  'the earliest day with any study fact is the first month the calendar can show'
);

SELECT is(
  (SELECT day FROM public.learning_days('Asia/Seoul', date '2026-09-12', date '2026-09-12')),
  date '2026-09-12',
  'a day is returned under the device date'
);

SELECT is(
  (SELECT english_messages FROM public.learning_days('Asia/Seoul', date '2026-09-12', date '2026-09-12')),
  6,
  'six English messages on the 12th read as six'
);

SELECT is(
  (SELECT english_messages FROM public.learning_days('UTC', date '2026-09-11', date '2026-09-11')),
  1,
  'the same message falls on the day before under a zone where it is still yesterday'
);

SELECT results_eq(
  $$SELECT day, english_messages
    FROM public.learning_days('Asia/Seoul', date '2026-09-07', date '2026-09-13')$$,
  $$VALUES (date '2026-09-12', 6)$$,
  'a week returns only the days on which English was spoken, in order'
);

SELECT results_eq(
  $$SELECT day, english_messages
    FROM public.learning_days('Asia/Seoul', date '2026-09-01', date '2026-09-30')$$,
  $$VALUES (date '2026-09-01', 2), (date '2026-09-03', 1), (date '2026-09-12', 6)$$,
  'a month returns each spoken day of that month'
);

SELECT is(
  (SELECT sum(english_messages)::integer
   FROM public.learning_days('Asia/Seoul', date '2026-09-01', date '2026-09-30')),
  9,
  'the month total is the sum of its days'
);

SELECT is(
  (SELECT count(*)::integer
   FROM public.learning_days('Asia/Seoul', date '2026-08-01', date '2026-08-31')),
  0,
  'a month without English has no days'
);

-- 영어로 말하기만 한 9월 1일은 칸에 색이 있어도 연속 기록에 들어가지 않는다.
SELECT ok(
  (SELECT english_messages FROM public.learning_days('Asia/Seoul', date '2026-09-01', date '2026-09-01')) = 2
  AND (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-13')) = 12,
  'a day with English but no finished episode colours its cell and stays out of the run'
);

-- 두 화를 끝낸 9월 5일도 하루다.
SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-05')),
  4,
  'two episodes finished on one day count as one day'
);

-- 기기의 시간대가 달라지면 같은 순간이 다른 날로 묶인다. 밤 9시의 서울은
-- 로스앤젤레스의 같은 날 새벽이라 날짜는 그대로이고 날수도 같다.
SELECT is(
  (SELECT streak FROM public.learning_streak('America/Los_Angeles', date '2026-09-13')),
  12,
  'the run is counted in the zone the device sends'
);

SELECT throws_ok(
  $$SELECT * FROM public.learning_streak('Not/AZone', date '2026-09-13')$$,
  '22023',
  NULL,
  'an unknown zone name is refused rather than silently read as UTC'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT streak FROM public.learning_streak('Asia/Seoul', date '2026-09-13')),
  1,
  'another person reads only their own run'
);

SELECT results_eq(
  $$SELECT day, english_messages
    FROM public.learning_days('Asia/Seoul', date '2026-09-07', date '2026-09-13')$$,
  $$VALUES (date '2026-09-12', 1)$$,
  'another person reads only their own spoken days'
);

SET LOCAL request.jwt.claims TO '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

SELECT results_eq(
  $$SELECT streak, first_day FROM public.learning_streak('Asia/Seoul', date '2026-09-13')$$,
  $$VALUES (0, NULL::date)$$,
  'a new account has no run and no first month'
);

SELECT is(
  (SELECT count(*)::integer
   FROM public.learning_days('Asia/Seoul', date '2026-09-01', date '2026-09-30')),
  0,
  'a new account has no spoken days'
);

RESET ROLE;

-- 회차를 지운 뒤에도 학습 사실만 읽으므로 같은 값이 나온다. 삭제 트리거가
-- 사실을 남기는지는 story_plays_test가 확인하므로, 여기서는 원본 대화가 전혀
-- 없는 사실만으로 읽기가 끝난다는 것을 본다.
SELECT is(
  (SELECT count(*)::integer FROM public.episode_messages
   WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'the reads above used study facts alone, with no conversation rows behind them'
);

SELECT * FROM finish();
ROLLBACK;
