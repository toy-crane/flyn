-- 선언적 스키마(source of truth): scratch_notes throwaway 예시 테이블.
--
-- 제품 도메인이 아니라 스택 관통용 예시다 — 도메인이 확정되면 `scratch_` 접두어를
-- 기준으로 이 파일·마이그레이션·화면을 일괄 제거한다. 이 파일을 고친 뒤
-- `supabase db diff -f <name>`로 마이그레이션을 생성한다(손으로 안 씀). RLS는 보안
-- 경계이므로 테이블과 같은 파일에 정책을 함께 선언한다.

create table public.scratch_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.scratch_notes enable row level security;

-- 소유자(auth.uid())만 자기 행에 접근. (select auth.uid())는 Supabase RLS 성능 관용구.
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
