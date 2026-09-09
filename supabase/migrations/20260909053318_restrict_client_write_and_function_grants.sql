-- Hosted Supabase may grant privileges directly to API roles.
-- Local pg-delta returned no diff because local defaults already restrict them.
-- Forward-only DCL mirrors the declarative schema; no data or RLS changes.

revoke all on function public.is_reserved_username(text) from public, anon, authenticated, service_role;
grant execute on function public.is_reserved_username(text) to authenticated, service_role;

revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
revoke all on function public.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.username_change_interval() from public, anon, authenticated, service_role;
revoke all on function public.is_protected_username(text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.username_status(text) from public, anon, authenticated, service_role;
grant execute on function public.username_status(text) to authenticated;
revoke all on function public.available_usernames(text[]) from public, anon, authenticated, service_role;
grant execute on function public.available_usernames(text[]) to authenticated;
revoke all on function public.guard_username_change() from public, anon, authenticated, service_role;
revoke all on function public.episode_is_current(uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.episode_is_current(uuid, uuid) to authenticated;
revoke all on function public.touch_story_play() from public, anon, authenticated, service_role;
revoke all on function public.finish_episode(uuid, uuid, text, text, text, text, text, text) from public, anon, authenticated, service_role;
grant execute on function public.finish_episode(uuid, uuid, text, text, text, text, text, text) to authenticated;

revoke update on table public.profiles from authenticated;
grant update (avatar_chosen_by_user, avatar_path, avatar_url, display_name, username) on table public.profiles to authenticated;

revoke insert on table public.story_plays from authenticated;
grant insert (story_id) on table public.story_plays to authenticated;

revoke insert on table public.episode_plays from authenticated;
grant insert (story_play_id, episode_id) on table public.episode_plays to authenticated;

revoke insert on table public.episode_messages from authenticated;
grant insert (id, play_id, role, parts) on table public.episode_messages to authenticated;

revoke insert on table public.episode_corrections from authenticated;
grant insert (message_id, original, fixed, corrected, pattern, reason) on table public.episode_corrections to authenticated;
