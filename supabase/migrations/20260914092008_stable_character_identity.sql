-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.characters
  DROP CONSTRAINT characters_story_id_name_key;

ALTER TABLE public.characters
  ADD CONSTRAINT characters_story_id_name_key UNIQUE (story_id, name) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.characters
  ADD COLUMN content_key text;

ALTER TABLE public.characters
  ADD CONSTRAINT characters_content_key_usable CHECK (content_key IS NULL OR content_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text);

ALTER TABLE public.characters
  ADD CONSTRAINT characters_story_id_content_key_key UNIQUE (story_id, content_key);

-- 처음 한 번 기존 인물에 고정 키를 연결한다. 이후 이름과 순서는 식별에 쓰지 않는다.
WITH known(slug, original_name, content_key) AS (VALUES
  ('mia-cafe', 'Mia', 'mia'), ('mia-cafe', 'Owen', 'owen'),
  ('business-trip', 'Anna', 'anna'), ('business-trip', 'Daniel', 'daniel'),
  ('roommate-month', 'Jamie', 'jamie'), ('roommate-month', 'Noah', 'noah'),
  ('first-week-office', 'Dan', 'dan'), ('first-week-office', 'Grace', 'grace'),
  ('upstairs-neighbor', 'Nora', 'nora'), ('upstairs-neighbor', 'Frank', 'frank')
)
UPDATE public.characters c SET content_key = k.content_key
FROM public.stories s, known k
WHERE c.story_id = s.id AND s.slug = k.slug AND c.name = k.original_name;
