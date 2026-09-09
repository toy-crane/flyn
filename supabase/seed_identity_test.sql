BEGIN;
SELECT plan(8);

CREATE TEMP TABLE seeded_story_ids AS SELECT slug, id FROM public.stories;
CREATE TEMP TABLE seeded_episode_ids AS SELECT story_id, number, id FROM public.episodes;
CREATE TEMP TABLE seeded_titles AS
SELECT 'story' AS kind, id, title FROM public.stories
UNION ALL SELECT 'episode', id, title FROM public.episodes;
UPDATE public.stories SET title = 'temporary title';
UPDATE public.episodes SET title = 'temporary title';

-- Re-run the actual seed, not a copy of its upsert logic.
\ir seed.sql
\ir seed.sql

SELECT is((SELECT count(*) FROM public.stories), 5::bigint, 'repeated seed keeps five stories');
SELECT is((SELECT count(*) FROM public.episodes), 25::bigint, 'repeated seed keeps twenty-five episodes');
SELECT results_eq(
  'select slug, id from public.stories order by slug',
  'select slug, id from seeded_story_ids order by slug',
  'repeated seed preserves story IDs'
);
SELECT results_eq(
  'select story_id, number, id from public.episodes order by story_id, number',
  'select story_id, number, id from seeded_episode_ids order by story_id, number',
  'repeated seed preserves episode IDs and their story links'
);
SELECT col_has_default('public', 'stories', 'id', 'new stories get an ID automatically');
SELECT col_has_default('public', 'episodes', 'id', 'new episodes get an ID automatically');
SELECT results_eq(
  'select id, title from public.stories order by id',
  $$select id, title from seeded_titles where kind = 'story' order by id$$,
  'repeated seed updates existing story content'
);
SELECT results_eq(
  'select id, title from public.episodes order by id',
  $$select id, title from seeded_titles where kind = 'episode' order by id$$,
  'repeated seed updates existing episode content'
);

SELECT * FROM finish();
ROLLBACK;
