BEGIN;
SELECT no_plan();

SELECT col_not_null('public', name, column_name,
  name || '.' || column_name || ' is required')
FROM unnest(ARRAY['profiles', 'retired_usernames', 'stories', 'characters',
  'episodes', 'episode_characters', 'story_plays', 'episode_plays',
  'episode_messages', 'language_levels', 'app_version_policies']) AS tables(name)
CROSS JOIN unnest(ARRAY['created_at', 'updated_at']) AS columns(column_name);

CREATE TEMP TABLE timestamps_before AS
  SELECT id, created_at, updated_at FROM public.stories;
UPDATE public.stories SET title = title;
SELECT results_eq(
  'SELECT id, created_at, updated_at FROM public.stories ORDER BY id',
  'SELECT id, created_at, updated_at FROM timestamps_before ORDER BY id',
  'writing the same content keeps both timestamps');

UPDATE public.stories SET created_at = created_at - interval '1 day',
  updated_at = updated_at + interval '1 day';
SELECT results_eq(
  'SELECT id, created_at, updated_at FROM public.stories ORDER BY id',
  'SELECT id, created_at, updated_at FROM timestamps_before ORDER BY id',
  'callers cannot rewrite creation or modification times');

UPDATE public.stories SET title = title || ' test';
SELECT ok(bool_and(s.created_at = b.created_at AND s.updated_at > b.updated_at),
  'actual content changes advance only modification time')
FROM public.stories s JOIN timestamps_before b USING (id);

SELECT * FROM finish();
ROLLBACK;
