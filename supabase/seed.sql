-- 데모 유저 2명 + 메모 몇 줄. 시드는 superuser라 RLS를 우회하고, 인증 컨텍스트가 없어
-- user_id를 명시한다. stats 엔드포인트가 "여러 소유자"를 보여줄 재료다.

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
