-- 로컬 시드: 데모 유저 2명 + 각자 scratch_notes 몇 줄.
--
-- 시드는 superuser로 실행되어 RLS를 우회한다. scratch_notes.user_id에는 auth.uid()
-- 기본값이 있지만 시드에는 인증 컨텍스트가 없으므로 user_id를 명시한다. 이 행들은 앱의
-- 익명 세션과 별개의 다른 소유자라, Hono stats 엔드포인트(admin 집계)가 "여러 사용자"를
-- 실제로 보여줄 재료가 된다. auth.users 컬럼은 CLI 버전에 민감하니 최소 컬럼만 채운다.

insert into auth.users (
  instance_id, id, aud, role, email,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'seed-alice@example.test',
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'seed-bob@example.test',
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  )
on conflict (id) do nothing;

insert into public.scratch_notes (user_id, body)
values
  ('11111111-1111-1111-1111-111111111111', 'alice의 첫 메모'),
  ('11111111-1111-1111-1111-111111111111', 'alice의 둘째 메모'),
  ('22222222-2222-2222-2222-222222222222', 'bob의 메모');
