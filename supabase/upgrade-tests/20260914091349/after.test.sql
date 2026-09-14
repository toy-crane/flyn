BEGIN;
SELECT no_plan();
SELECT results_eq($$SELECT to_jsonb(r) FROM public.profiles r ORDER BY to_jsonb(r)$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.profiles r ORDER BY to_jsonb(r)$$,
 'profiles preserves every existing value');
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.retired_usernames r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.retired_usernames r ORDER BY to_jsonb(r)$$,
 'retired_usernames preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'retired_usernames starts with matching timestamps') FROM public.retired_usernames;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' FROM public.stories r ORDER BY to_jsonb(r) - 'updated_at'$$,
 $$SELECT to_jsonb(r) - 'cover_emoji' FROM ci_timestamps.stories r ORDER BY to_jsonb(r) - 'cover_emoji'$$,
 'stories preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'stories starts with matching timestamps') FROM public.stories;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' - 'content_key' FROM public.characters r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at' - 'content_key'$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.characters r ORDER BY to_jsonb(r)$$,
 'characters preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'characters starts with matching timestamps') FROM public.characters;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.episodes r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT to_jsonb(r) - 'cast_names' FROM ci_timestamps.episodes r ORDER BY to_jsonb(r) - 'cast_names'$$,
 'episodes preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'episodes starts with matching timestamps') FROM public.episodes;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.episode_characters r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT (to_jsonb(r) - 'at') || jsonb_build_object('position', r.at) FROM ci_timestamps.episode_characters r ORDER BY (to_jsonb(r) - 'at') || jsonb_build_object('position', r.at)$$,
 'episode_characters preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'episode_characters starts with matching timestamps') FROM public.episode_characters;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.story_plays r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.story_plays r ORDER BY to_jsonb(r)$$,
 'story_plays preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'story_plays starts with matching timestamps') FROM public.story_plays;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.episode_plays r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.episode_plays r ORDER BY to_jsonb(r)$$,
 'episode_plays preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'episode_plays starts with matching timestamps') FROM public.episode_plays;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'expression_status' FROM public.episode_messages r ORDER BY to_jsonb(r) - 'updated_at' - 'expression_status'$$,
 $$SELECT (to_jsonb(r) - 'play_id') || jsonb_build_object('episode_play_id', r.play_id) FROM ci_timestamps.episode_messages r ORDER BY (to_jsonb(r) - 'play_id') || jsonb_build_object('episode_play_id', r.play_id)$$,
 'episode_messages preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'episode_messages starts with matching timestamps') FROM public.episode_messages;
SELECT results_eq($$SELECT to_jsonb(r) - 'updated_at' - 'created_at' FROM public.language_levels r ORDER BY to_jsonb(r) - 'updated_at' - 'created_at'$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.language_levels r ORDER BY to_jsonb(r)$$,
 'language_levels preserves every existing value');
SELECT ok(bool_and(created_at = updated_at), 'language_levels starts with matching timestamps') FROM public.language_levels;
SELECT results_eq($$SELECT to_jsonb(r) FROM public.app_version_policies r ORDER BY to_jsonb(r)$$,
 $$SELECT to_jsonb(r) FROM ci_timestamps.app_version_policies r ORDER BY to_jsonb(r)$$,
 'app_version_policies preserves every existing value');
SELECT ok(bool_and(created_at = started_at), 'story_plays uses known historical time') FROM public.story_plays;
SELECT ok(bool_and(created_at = started_at), 'episode_plays uses known historical time') FROM public.episode_plays;
SELECT ok(bool_and(created_at = observed_at), 'language_levels uses known historical time') FROM public.language_levels;
SELECT ok(bool_and(created_at = retired_at), 'retired_usernames uses known historical time') FROM public.retired_usernames;
SELECT * FROM finish();
ROLLBACK;
