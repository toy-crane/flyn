-- Hosted defaults may include table-wide INSERT, which overrides column grants.
-- Local defaults already restrict it, so this forward DCL mirrors 60-policies.sql
-- even when a local schema diff has no change. Rows and RLS remain unchanged.

revoke insert on table public.episode_expression_results from authenticated;
grant insert (message_id, status, fixed, entries, situation, meaning, example, example_meaning)
  on table public.episode_expression_results to authenticated;
