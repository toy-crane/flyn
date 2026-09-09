-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.episodes
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.stories
  ALTER COLUMN id SET DEFAULT gen_random_uuid();