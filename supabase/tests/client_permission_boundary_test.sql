BEGIN;
SELECT plan(42);

-- Effective privileges include table-wide and direct role grants, not only
-- the explicit column grants written in the schema.
SELECT ok(NOT has_column_privilege('authenticated', table_name, column_name, privilege),
  format('client cannot write protected %s.%s', table_name, column_name))
FROM (VALUES
  ('public.profiles', 'account_deletion_started_at', 'UPDATE'),
  ('public.profiles', 'username_locked_until', 'UPDATE'),
  ('public.profiles', 'created_at', 'UPDATE'),
  ('public.story_plays', 'last_user_message_at', 'INSERT'),
  ('public.episode_plays', 'ending_kind', 'INSERT'),
  ('public.episode_messages', 'created_at', 'INSERT'),
  ('public.episode_expression_results', 'user_id', 'INSERT'),
  ('public.saved_expressions', 'user_id', 'INSERT'),
  ('public.saved_expressions', 'created_at', 'INSERT')
) AS protected(table_name, column_name, privilege);

-- The allowlist is the contract, independent of the cloud's default ACL.
SELECT is(
  has_function_privilege(role_name, signature, 'EXECUTE'),
  CASE role_name
    WHEN 'anon' THEN false
    WHEN 'authenticated' THEN client_callable
    WHEN 'service_role' THEN service_callable
  END,
  format('%s execute %s follows the allowlist', role_name, signature)
)
FROM (VALUES
  ('public.is_reserved_username(text)', true, true),
  ('public.handle_new_user()', false, false),
  ('public.set_updated_at()', false, false),
  ('public.username_change_interval()', false, false),
  ('public.is_protected_username(text,uuid)', false, false),
  ('public.username_status(text)', true, false),
  ('public.available_usernames(text[])', true, false),
  ('public.guard_username_change()', false, false),
  ('public.episode_is_current(uuid,uuid)', true, false),
  ('public.touch_story_play()', false, false),
  ('public.finish_episode(uuid,uuid,text,text,text,text,text,text)', true, false)
) AS functions(signature, client_callable, service_callable)
CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role')) AS roles(role_name);

SELECT * FROM finish();
ROLLBACK;
