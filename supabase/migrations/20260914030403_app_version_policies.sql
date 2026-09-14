-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.app_version_policies (
  platform        text NOT NULL,
  distribution    text NOT NULL,
  minimum_version text,
  install_url     text
);

COMMENT ON TABLE public.app_version_policies IS 'Minimum installed app version and installation URL for each platform and distribution. Edit in Dashboard after verifying the destination.';

COMMENT ON COLUMN public.app_version_policies.minimum_version IS 'Set x.y.z to block older installed apps; set NULL to disable the block.';

COMMENT ON COLUMN public.app_version_policies.install_url IS 'Verified TestFlight or public store HTTPS URL. Required before enabling minimum_version.';

ALTER TABLE public.app_version_policies
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_distribution_check CHECK (distribution = ANY (ARRAY['internal'::text, 'public'::text]));

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_install_url_check CHECK (install_url IS NULL OR length(install_url) <= 2048 AND install_url ~ '^https://[^[:space:]/]+/[^[:space:]]+$'::text);

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_install_url_required CHECK (minimum_version IS NULL OR install_url IS NOT NULL);

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_minimum_version_check CHECK (minimum_version IS NULL OR minimum_version ~ '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'::text);

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_pkey PRIMARY KEY (platform, distribution);

ALTER TABLE public.app_version_policies
  ADD CONSTRAINT app_version_policies_platform_check CHECK (platform = ANY (ARRAY['ios'::text, 'android'::text]));

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.app_version_policies TO anon;

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.app_version_policies TO authenticated;

GRANT ALL ON public.app_version_policies TO service_role;

CREATE POLICY app_version_policies_read ON public.app_version_policies
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Rows are operational settings, not sample content. Leave every block off
-- until the operator has verified the actual installation destination.
INSERT INTO public.app_version_policies (platform, distribution)
VALUES ('ios', 'internal'), ('ios', 'public'),
  ('android', 'internal'), ('android', 'public');
