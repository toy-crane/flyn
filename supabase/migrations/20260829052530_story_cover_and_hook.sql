-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

ALTER TABLE public.stories
  ADD COLUMN hook text NOT NULL;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_hook_usable CHECK (length(btrim(hook)) >= 1 AND length(btrim(hook)) <= 120);

ALTER TABLE public.stories
  ADD COLUMN intro text NOT NULL;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_intro_usable CHECK (length(btrim(intro)) >= 1 AND length(btrim(intro)) <= 500);

ALTER TABLE public.stories
  ADD COLUMN cover_emoji text NOT NULL;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_cover_emoji_usable CHECK (length(btrim(cover_emoji)) >= 1 AND length(btrim(cover_emoji)) <= 20);

ALTER TABLE public.stories
  ADD COLUMN cover_image_url text;

ALTER TABLE public.stories
  ADD CONSTRAINT stories_cover_image_url_usable CHECK (cover_image_url IS NULL OR length(cover_image_url) <= 2048 AND cover_image_url ~~ 'https://%'::text);