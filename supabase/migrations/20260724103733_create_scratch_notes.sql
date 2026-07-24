-- scratch_notes throwaway 테이블 + RLS 정책 + 인덱스.
--
-- 이 마이그레이션은 `supabase/schemas/scratch_notes.sql`(선언적 원본)과 동일한 상태를
-- 담는다. Docker 로컬 스택이 없는 환경에서 작성됐으므로, 스택이 있는 곳에서
-- `supabase db diff` 를 돌리면 변경 없음(empty)이 나오는 것이 정상이다 — diff 결과와
-- 등가가 되도록 손으로 맞춰 두었다. 스키마를 바꿀 땐 반드시 스키마 파일을 먼저 고치고
-- diff로 새 마이그레이션을 생성한다.

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

-- Data API 롤에 테이블 권한 부여. auto_expose_new_tables가 unset(신규 클라우드 기본값)이면
-- RLS만으로는 접근 불가 — 명시 GRANT가 있어야 정책이 적용된다(RLS는 권한 통과 후 행을
-- 거른다). admin(secret) 클라이언트는 service_role로 접근하므로 함께 부여한다.
grant select, insert, update, delete on table public.scratch_notes to authenticated;
grant select, insert, update, delete on table public.scratch_notes to service_role;
