BEGIN;
SELECT plan(8);
SELECT is((SELECT count(*) FROM public.story_plays), 1::bigint, 'the story run remains');
SELECT is((SELECT count(*) FROM public.episode_plays), 1::bigint, 'the finished episode remains');
SELECT is((SELECT count(*) FROM public.episode_messages), 2::bigint, 'both conversation messages remain');
SELECT results_eq(
  $$SELECT to_jsonb(r) FROM public.story_plays r ORDER BY id$$,
  $$SELECT to_jsonb(r) FROM ci_expression_preservation.story_plays r ORDER BY id$$,
  'run IDs, owners, story relationships and timestamps are unchanged'
);
SELECT results_eq(
  $$SELECT to_jsonb(p) FROM public.episode_plays p ORDER BY id$$,
  $$SELECT to_jsonb(p) FROM ci_expression_preservation.plays p ORDER BY id$$,
  'play IDs, owners, episode relationships, endings and memory are unchanged'
);
SELECT results_eq(
  $$SELECT to_jsonb(m) FROM public.episode_messages m ORDER BY id$$,
  $$SELECT to_jsonb(m) FROM ci_expression_preservation.messages m ORDER BY id$$,
  'message IDs, play relationships, content and order are unchanged'
);
SELECT hasnt_table('public', 'episode_corrections', 'the superseded correction format is removed');
SELECT is((SELECT count(*) FROM public.episode_expression_results), 0::bigint,
  'no fabricated review content or completion status is copied from the old format');
SELECT * FROM finish();
ROLLBACK;
