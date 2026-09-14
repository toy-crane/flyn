BEGIN;
SELECT plan(3);
SELECT results_eq(
  'SELECT id, story_id, name, position, persona FROM public.characters ORDER BY id',
  'SELECT id, story_id, name, position, persona FROM ci_preservation.characters ORDER BY id',
  'adding content keys preserves existing identities and character content');
SELECT results_eq(
  'SELECT episode_id, character_id, story_id FROM public.episode_characters ORDER BY episode_id, character_id',
  'SELECT episode_id, character_id, story_id FROM ci_preservation.episode_characters ORDER BY episode_id, character_id',
  'adding content keys preserves every episode link');
SELECT results_eq(
  'SELECT name, content_key FROM public.characters ORDER BY name',
  $$VALUES ('Anna'::text, 'anna'::text), ('Mia', 'mia'), ('Owen', 'owen')$$,
  'existing official characters receive their fixed keys');
SELECT * FROM finish();
ROLLBACK;
