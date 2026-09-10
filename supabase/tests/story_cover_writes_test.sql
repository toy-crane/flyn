-- 표지 버킷에 누가 무엇을 넣을 수 있는지. 만든 스토리의 표지만, 자기 폴더에만.
BEGIN;
SELECT plan(8);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'cover-writer@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'cover-outsider@example.test');

SELECT policies_are(
  'storage', 'objects',
  ARRAY[
    'avatars_delete_own',
    'avatars_insert_own',
    'avatars_select_own',
    'avatars_update_own',
    'story_covers_insert_own_made'
  ],
  'storage.objects는 아바타의 네 정책과 만든 표지의 쓰기 정책 하나를 갖는다'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'story-covers',
      'made/11111111-1111-4111-8111-111111111111/cover.png',
      '11111111-1111-4111-8111-111111111111'
    )$$,
  '자기 폴더 안에 표지 한 장을 넣을 수 있다'
);

SELECT throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'story-covers',
      'made/22222222-2222-4222-8222-222222222222/cover.png',
      '11111111-1111-4111-8111-111111111111'
    )$$,
  '42501',
  NULL,
  '남의 폴더에는 넣을 수 없다'
);

-- 공식 표지는 콘텐츠를 싣는 쪽만 넣는다. 로그인한 클라이언트가 공식 표지
-- 이름으로 파일을 올려 스토리 표지를 바꿔치기하는 길을 열지 않는다.
SELECT throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'story-covers',
      'mia-cafe-deadbeef.png',
      '11111111-1111-4111-8111-111111111111'
    )$$,
  '42501',
  NULL,
  '버킷 뿌리에는 넣을 수 없다'
);

-- 계정을 지울 때 한 폴더만 훑으면 되도록 깊이를 묶어 둔다.
SELECT throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'story-covers',
      'made/11111111-1111-4111-8111-111111111111/nested/cover.png',
      '11111111-1111-4111-8111-111111111111'
    )$$,
  '42501',
  NULL,
  '자기 폴더 아래에 더 깊은 길은 만들 수 없다'
);

-- 정책이 없는 쓰기는 오류가 아니라 아무 줄도 만나지 못하는 것으로 끝난다.
-- 그래서 오류 대신 남은 줄을 본다.
UPDATE storage.objects
SET name = 'made/11111111-1111-4111-8111-111111111111/other.png'
WHERE bucket_id = 'story-covers' AND name LIKE 'made/%';

RESET ROLE;

SELECT is(
  (SELECT name FROM storage.objects WHERE bucket_id = 'story-covers' AND name LIKE 'made/%'),
  'made/11111111-1111-4111-8111-111111111111/cover.png',
  '이미 올린 표지의 이름은 클라이언트가 바꾸지 못한다'
);

-- 계정 삭제는 파일을 지우기 전에 울타리를 올린다. 그 뒤에 도착한 쓰기는
-- 아직 살아 있는 토큰이 보냈더라도 거절해야 한다. 그러지 않으면 삭제가 지나간
-- 자리에 주인 없는 표지가 남는다.
RESET ROLE;

UPDATE public.profiles
SET account_deletion_started_at = now()
WHERE id = '11111111-1111-4111-8111-111111111111';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'story-covers',
      'made/11111111-1111-4111-8111-111111111111/late.png',
      '11111111-1111-4111-8111-111111111111'
    )$$,
  '42501',
  NULL,
  '계정 삭제가 시작된 뒤에는 표지를 넣지 못한다'
);

-- 지우기 정책이 없다는 것은 위의 `policies_are`가 못 박는다. 이 단언이 보는
-- 것은 그것과 별개로 Storage가 이 테이블의 직접 삭제를 문장 단위 트리거로
-- 먼저 막는다는 사실이다. 표지 파일은 그 두 겹 뒤에 있다.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT throws_ok(
  $$delete from storage.objects
    where bucket_id = 'story-covers' and name like 'made/%'$$,
  '42501',
  NULL,
  'Storage가 이 테이블의 직접 삭제를 정책보다 먼저 막는다'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
