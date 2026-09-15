BEGIN;
SELECT plan(11);

-- 콘텐츠 행이 하나도 밀려나지 않는다.
SELECT is((SELECT count(*) FROM public.stories), 2::bigint, '두 스토리가 그대로 남는다');
SELECT is((SELECT count(*) FROM public.episodes), 6::bigint, '여섯 화가 그대로 남는다');

-- ID와 값과 서로의 관계가 바뀌지 않는다.
SELECT results_eq(
  $$SELECT to_jsonb(s) FROM public.stories s ORDER BY id$$,
  $$SELECT to_jsonb(s) FROM ci_preservation.stories s ORDER BY id$$,
  '스토리의 ID와 값이 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(e) FROM public.episodes e ORDER BY id$$,
  $$SELECT to_jsonb(e) FROM ci_preservation.episodes e ORDER BY id$$,
  '화의 ID와 스토리 관계와 값이 그대로다'
);

-- 그 위에 쌓인 플레이 기록의 연결도 그대로다.
SELECT results_eq(
  $$SELECT to_jsonb(r) FROM public.story_plays r ORDER BY id$$,
  $$SELECT to_jsonb(r) FROM ci_preservation.story_plays r ORDER BY id$$,
  '회차의 ID와 주인과 스토리 관계가 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(p) FROM public.episode_plays p ORDER BY id$$,
  $$SELECT to_jsonb(p) FROM ci_preservation.episode_plays p ORDER BY id$$,
  '플레이의 ID와 화·회차 관계가 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(m) FROM public.episode_messages m ORDER BY id$$,
  $$SELECT to_jsonb(m) FROM ci_preservation.episode_messages m ORDER BY id$$,
  '메시지의 ID와 플레이 관계와 내용이 그대로다'
);

-- 보존만 확인하면 제약을 만들지 않은 마이그레이션도 통과한다. 이 변경이 실제로
-- 세운 것까지 함께 묻는다.
SELECT col_is_unique(
  'public', 'episodes', ARRAY['id', 'story_id'],
  '화가 인물 연결의 부모로 설 수 있다'
);
SELECT has_table('public', 'characters', '인물 테이블이 생겼다');
SELECT has_table('public', 'episode_characters', '화와 인물의 연결 테이블이 생겼다');

-- 새 구조는 비어 있고, 기존 화는 아직 아무 인물도 가리키지 않는다.
SELECT is(
  (SELECT count(*) FROM public.characters) + (SELECT count(*) FROM public.episode_characters),
  0::bigint,
  '새 인물 구조는 빈 채로 들어온다'
);

SELECT * FROM finish();
ROLLBACK;
