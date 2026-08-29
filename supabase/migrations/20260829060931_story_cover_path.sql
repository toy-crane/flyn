-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.stories
  DROP CONSTRAINT stories_cover_image_url_usable;

ALTER TABLE public.stories
  DROP COLUMN cover_image_url;

ALTER TABLE public.stories
  ADD COLUMN cover_image_path text;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_cover_image_path_usable CHECK (cover_image_path IS NULL OR length(btrim(cover_image_path)) >= 1 AND length(btrim(cover_image_path)) <= 512);