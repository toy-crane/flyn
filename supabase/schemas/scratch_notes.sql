-- 스택 관통용 throwaway. 도메인 확정 시 scratch_ 접두어로 일괄 제거한다.
-- 이 파일을 고친 뒤 supabase db diff -f <name>로 마이그레이션을 생성한다.

create table public.scratch_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.scratch_notes enable row level security;

create policy "own rows readable" on public.scratch_notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own rows insertable" on public.scratch_notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own rows updatable" on public.scratch_notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own rows deletable" on public.scratch_notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create index scratch_notes_user_id_idx on public.scratch_notes (user_id);

-- auto_expose_new_tables가 unset(신규 기본값)이면 RLS만으로는 접근 불가 — Data API 롤에
-- 명시 GRANT가 있어야 정책이 적용된다.
grant select, insert, update, delete on table public.scratch_notes to authenticated;
grant select, insert, update, delete on table public.scratch_notes to service_role;
