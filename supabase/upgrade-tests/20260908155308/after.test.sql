BEGIN;
SELECT plan(9);
SELECT is((SELECT count(*) FROM public.episode_plays), 3::bigint, 'all three plays remain');
SELECT is((SELECT count(*) FROM public.episode_messages), 5::bigint, 'all five messages remain');
SELECT is((SELECT count(*) FROM public.episode_corrections), 2::bigint, 'both corrections remain');
SELECT results_eq(
  $$SELECT to_jsonb(c) FROM public.episode_corrections c ORDER BY id$$,
  $$SELECT to_jsonb(c) FROM ci_preservation.corrections c ORDER BY id$$,
  'correction IDs, message relationships and values are unchanged'
);
SELECT results_eq(
  $$SELECT to_jsonb(p) - 'story_play_id' FROM public.episode_plays p ORDER BY id$$,
  $$SELECT to_jsonb(p) FROM ci_preservation.plays p ORDER BY id$$,
  'play IDs, owners, episode relationships and values are unchanged'
);
SELECT results_eq(
  $$SELECT to_jsonb(m) FROM public.episode_messages m ORDER BY id$$,
  $$SELECT to_jsonb(m) FROM ci_preservation.messages m ORDER BY id$$,
  'message IDs, play relationships and contents are unchanged'
);
SELECT is((SELECT count(*) FROM public.story_plays), 2::bigint, 'each user gets a separate run');
SELECT is((
  SELECT count(*) FROM public.episode_plays p
  JOIN public.episodes e ON e.id = p.episode_id
  JOIN public.story_plays r ON r.id = p.story_play_id
  WHERE r.user_id = p.user_id AND r.story_id = e.story_id
), 3::bigint, 'every play belongs to the correct user and story');
SELECT results_eq(
  $$SELECT u.email::text, r.started_at, r.last_user_message_at
    FROM public.story_plays r JOIN auth.users u ON u.id = r.user_id ORDER BY u.email$$,
  $$VALUES
    ('upgrade-a@example.test'::text, '2026-01-01 00:00:00+00'::timestamptz, '2026-01-01 00:02:00+00'::timestamptz),
    ('upgrade-b@example.test'::text, '2026-01-01 00:00:00+00'::timestamptz, NULL::timestamptz)$$,
  'run timestamps preserve user messages and exclude assistant-only plays'
);
SELECT * FROM finish();
ROLLBACK;
