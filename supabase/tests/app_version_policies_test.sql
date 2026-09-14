BEGIN;
SELECT plan(23);

SELECT has_table('public', 'app_version_policies', 'version policies exist');
SELECT has_column('public', 'app_version_policies', 'created_at',
  'policy creation time is recorded');
SELECT has_column('public', 'app_version_policies', 'updated_at',
  'policy change time is recorded');
SELECT is((SELECT count(*) FROM public.app_version_policies), 4::bigint,
  'each platform and distribution has one editable row');
SELECT is((SELECT count(*) FROM public.app_version_policies
  WHERE created_at = updated_at), 4::bigint,
  'new policy rows start with matching timestamps');
SELECT is((SELECT count(*) FROM public.app_version_policies WHERE minimum_version IS NULL),
  4::bigint, 'the policy starts disabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.app_version_policies'::regclass),
  'RLS is enabled');
SELECT policies_are('public', 'app_version_policies',
  ARRAY['app_version_policies_read'], 'the table has only a read policy');

SELECT throws_ok($$UPDATE public.app_version_policies SET minimum_version = '1.2.0'
  WHERE platform = 'ios' AND distribution = 'internal'$$, '23514', NULL,
  'a minimum cannot be enabled without an installation URL');
SELECT throws_ok($$UPDATE public.app_version_policies
  SET minimum_version = '1.2', install_url = 'https://testflight.apple.com/join/example'
  WHERE platform = 'ios' AND distribution = 'internal'$$, '23514', NULL,
  'an invalid version cannot be stored');
SELECT throws_ok($$UPDATE public.app_version_policies
  SET minimum_version = '1.2.0', install_url = 'http://example.com/app'
  WHERE platform = 'ios' AND distribution = 'internal'$$, '23514', NULL,
  'an installation URL must use HTTPS');
SELECT lives_ok($$UPDATE public.app_version_policies
  SET minimum_version = '1.2.0', install_url = 'https://testflight.apple.com/join/example'
  WHERE platform = 'ios' AND distribution = 'internal'$$,
  'an operator can set a usable minimum');
SELECT ok((SELECT updated_at > created_at FROM public.app_version_policies
  WHERE platform = 'ios' AND distribution = 'internal'),
  'an actual policy change advances updated_at');
CREATE TEMP TABLE policy_time_before AS
  SELECT created_at, updated_at FROM public.app_version_policies
  WHERE platform = 'ios' AND distribution = 'internal';
SELECT lives_ok($$UPDATE public.app_version_policies
  SET minimum_version = '1.2.0', install_url = 'https://testflight.apple.com/join/example'
  WHERE platform = 'ios' AND distribution = 'internal'$$,
  'writing the same policy values is allowed');
SELECT is((SELECT updated_at FROM public.app_version_policies
  WHERE platform = 'ios' AND distribution = 'internal'),
  (SELECT updated_at FROM policy_time_before),
  'a no-op write keeps updated_at');
SELECT lives_ok($$UPDATE public.app_version_policies SET created_at = created_at - interval '1 day'
  WHERE platform = 'ios' AND distribution = 'internal'$$,
  'the timestamp trigger handles a creation-time edit');
SELECT is((SELECT created_at FROM public.app_version_policies
  WHERE platform = 'ios' AND distribution = 'internal'),
  (SELECT created_at FROM policy_time_before),
  'created_at cannot be changed after insertion');
SELECT lives_ok($$UPDATE public.app_version_policies SET minimum_version = NULL
  WHERE platform = 'ios' AND distribution = 'internal'$$,
  'clearing the minimum disables the block');

SELECT ok(has_table_privilege('anon', 'public.app_version_policies', 'SELECT')
  AND NOT has_table_privilege('anon', 'public.app_version_policies', 'INSERT')
  AND NOT has_table_privilege('anon', 'public.app_version_policies', 'UPDATE')
  AND NOT has_table_privilege('anon', 'public.app_version_policies', 'DELETE'),
  'signed-out clients can only read');
SELECT ok(has_table_privilege('authenticated', 'public.app_version_policies', 'SELECT')
  AND NOT has_table_privilege('authenticated', 'public.app_version_policies', 'INSERT')
  AND NOT has_table_privilege('authenticated', 'public.app_version_policies', 'UPDATE')
  AND NOT has_table_privilege('authenticated', 'public.app_version_policies', 'DELETE'),
  'signed-in clients can only read');

SET LOCAL ROLE anon;
SELECT is((SELECT count(*) FROM public.app_version_policies), 4::bigint,
  'signed-out clients see all distribution rows');
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM public.app_version_policies), 4::bigint,
  'signed-in clients see all distribution rows');
SELECT throws_ok($$UPDATE public.app_version_policies SET minimum_version = NULL$$,
  '42501', NULL, 'signed-in clients cannot change policy');

SELECT * FROM finish();
ROLLBACK;
