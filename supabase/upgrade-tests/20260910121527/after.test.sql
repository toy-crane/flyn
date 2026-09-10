BEGIN;
SELECT plan(12);

-- 담아 둔 항목은 하나도 밀려나지 않는다.
SELECT is(
  (SELECT count(*) FROM public.saved_expressions), 5::bigint,
  '두 계정이 담아 둔 다섯 항목이 그대로 남는다'
);

-- 뜻 말고는 아무것도 바뀌지 않는다. ID, 주인, 화와 메시지 관계, 영어 문장,
-- 원문과 고친 자리, 담은 시각이 모두 그대로다.
SELECT results_eq(
  $$SELECT to_jsonb(s) - 'meaning' FROM public.saved_expressions s ORDER BY id$$,
  $$SELECT to_jsonb(s) - 'meaning' FROM ci_preservation.saved_expressions s ORDER BY id$$,
  '뜻을 뺀 나머지 값은 모두 그대로다'
);

-- 옮겨 올 뜻이 있는 교정은 채워진다.
SELECT is(
  (
    SELECT meaning FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000001'
  ),
  '저는 뜨거운 아메리카노를 시켰어요.',
  '메시지가 남은 교정은 표현 돌아보기의 뜻을 받는다'
);

-- 곁에 있던 메시지를 잃은 항목은 옮겨 올 곳이 없다.
SELECT is(
  (
    SELECT meaning FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000002'
  ),
  NULL,
  '메시지를 잃은 교정은 뜻이 빈 채로 남는다'
);

SELECT is(
  (
    SELECT message_id FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000002'
  ),
  NULL,
  '그 항목의 메시지 참조는 끊긴 채 항목만 남아 있다'
);

-- 인물 대사의 뜻은 담을 때 만든 값 그대로다.
SELECT is(
  (
    SELECT meaning FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000003'
  ),
  '다음 분이요!',
  '인물 대사의 뜻은 원래 값을 지킨다'
);

-- 안내도 교정과 같은 길로 채워진다.
SELECT is(
  (
    SELECT meaning FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000004'
  ),
  '이 자리 비었나요?',
  '옛 안내 항목도 표현 돌아보기의 뜻을 받는다'
);

-- 계정 경계. 둘째 계정의 항목은 자기 판정의 뜻만 받는다.
SELECT is(
  (
    SELECT meaning FROM public.saved_expressions
    WHERE id = 'ee900000-0000-4000-8000-000000000005'
  ),
  '둘째 계정의 뜻이다.',
  '둘째 계정의 교정은 자기 판정의 뜻을 받는다'
);

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE user_id = '88888888-8888-4888-8888-888888888888'
      AND meaning IN (
        '저는 뜨거운 아메리카노를 시켰어요.',
        '이 자리 비었나요?',
        '다음 분이요!'
      )
  ),
  0::bigint,
  '첫 계정의 뜻은 둘째 계정으로 새지 않는다'
);

-- 보존만 확인하면 규칙을 풀지 않은 마이그레이션도 통과한다. 이 변경이 실제로
-- 푼 것까지 함께 묻는다.
SELECT lives_ok(
  $$insert into public.saved_expressions
      (user_id, kind, episode_id, message_id, english, original, entries, meaning)
    select
      '99999999-9999-4999-8999-999999999999', 'guidance', episodes.id,
      'cc900000-0000-4000-8000-000000000004',
      'Could I get a receipt?', '영수증 주세요.',
      '[{"original":"영수증 주세요.","fixed":"Could I get a receipt?","why":"영어로 물어봐요."}]'::jsonb,
      '영수증을 받을 수 있을까요?'
    from public.episodes
    join public.stories on stories.id = episodes.story_id
    where stories.slug = 'upgrade-meaning'$$,
  '안내도 뜻을 함께 담을 수 있다'
);

SELECT throws_ok(
  $$insert into public.saved_expressions
      (user_id, kind, episode_id, message_id, utterance_at, english, speaker)
    select
      '99999999-9999-4999-8999-999999999999', 'utterance', episodes.id,
      'cc900000-0000-4000-8000-000000000001', 1, 'Anything else?', 'Mia'
    from public.episodes
    join public.stories on stories.id = episodes.story_id
    where stories.slug = 'upgrade-meaning'$$,
  '23514',
  NULL,
  '인물 대사는 여전히 뜻 없이 담기지 않는다'
);

SELECT is(
  (
    SELECT count(*) FROM public.saved_expressions
    WHERE kind <> 'utterance' AND meaning IS NOT NULL
  ),
  4::bigint,
  '뜻을 가진 배울 표현은 채워진 옛 항목 셋과 새로 담은 항목 하나다'
);

SELECT * FROM finish();
ROLLBACK;
