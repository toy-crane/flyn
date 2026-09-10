BEGIN;
SELECT plan(14);

-- 아무 행도 밀려나지 않는다.
SELECT is((SELECT count(*) FROM public.stories), 2::bigint, '두 스토리가 그대로 남는다');
SELECT is((SELECT count(*) FROM public.characters), 3::bigint, '세 인물이 그대로 남는다');
SELECT is((SELECT count(*) FROM public.episodes), 3::bigint, '세 화가 그대로 남는다');
SELECT is(
  (SELECT count(*) FROM public.episode_characters), 4::bigint,
  '화와 인물의 연결 넷이 그대로 남는다'
);

-- `stories`에는 열이 둘 늘었다. 늘어난 열을 빼고 견주면 나머지 값과 ID가
-- 그대로인지 이 한 문장이 답한다.
SELECT results_eq(
  $$SELECT to_jsonb(s) - 'owner_id' - 'created_at' FROM public.stories s ORDER BY id$$,
  $$SELECT to_jsonb(s) FROM ci_preservation.stories s ORDER BY id$$,
  '스토리의 ID와 기존 값이 그대로다'
);

-- 기존 스토리는 주인이 없어 공식 콘텐츠로 남고, 만든 시각만 새로 붙는다.
SELECT ok(
  (SELECT bool_and(owner_id IS NULL AND created_at IS NOT NULL) FROM public.stories),
  '기존 스토리는 주인 없는 공식 콘텐츠로 남는다'
);

-- 나머지 테이블은 열이 늘지 않아 통째로 견준다.
SELECT results_eq(
  $$SELECT to_jsonb(c) FROM public.characters c ORDER BY id$$,
  $$SELECT to_jsonb(c) FROM ci_preservation.characters c ORDER BY id$$,
  '인물의 ID와 스토리 관계와 값이 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(e) FROM public.episodes e ORDER BY id$$,
  $$SELECT to_jsonb(e) FROM ci_preservation.episodes e ORDER BY id$$,
  '화의 ID와 스토리 관계와 값이 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(ec) FROM public.episode_characters ec ORDER BY episode_id, character_id$$,
  $$SELECT to_jsonb(ec) FROM ci_preservation.episode_characters ec ORDER BY episode_id, character_id$$,
  '누가 어느 화에 서는지가 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(r) FROM public.story_plays r ORDER BY id$$,
  $$SELECT to_jsonb(r) FROM ci_preservation.story_plays r ORDER BY id$$,
  '회차의 ID와 주인과 스토리 관계와 최근 시각이 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(p) FROM public.episode_plays p ORDER BY id$$,
  $$SELECT to_jsonb(p) FROM ci_preservation.episode_plays p ORDER BY id$$,
  '플레이의 ID와 결말이 그대로다'
);
SELECT results_eq(
  $$SELECT to_jsonb(x) FROM public.saved_expressions x ORDER BY id$$,
  $$SELECT to_jsonb(x) FROM ci_preservation.saved_expressions x ORDER BY id$$,
  '저장한 표현의 ID와 출처 화 관계가 그대로다'
);

-- 보존만 확인하면 아무것도 세우지 않은 마이그레이션도 통과한다. 이 변경이
-- 실제로 세운 것까지 함께 묻는다.
SELECT has_function(
  'public', 'create_story', ARRAY['jsonb'],
  '만든 스토리를 저장하는 함수가 생겼다'
);

-- 기존 스토리는 slug와 자리를 함께 들고 있어야 새 검사를 지난다. 한쪽만 든
-- 행은 이제 들어오지 못한다.
SELECT throws_ok(
  $$update public.stories set slug = null where id = 'e1111111-1111-4111-8111-111111111111'$$,
  '23514', NULL,
  '공식 스토리에서 열쇠만 떼어 내는 문장은 막힌다'
);

SELECT * FROM finish();
ROLLBACK;
