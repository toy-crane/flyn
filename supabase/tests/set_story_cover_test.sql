-- 만든 스토리에 표지를 다는 길. 자기 스토리에 한 번만, 자기 폴더의 파일로만.
BEGIN;
SELECT plan(15);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'cover-owner@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'cover-stranger@example.test');

SELECT has_function(
  'public', 'set_story_cover', ARRAY['uuid', 'text', 'text'],
  'set_story_cover는 스토리와 경로와 해시를 받는다'
);

SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.set_story_cover(uuid,text,text)'::regprocedure),
  true,
  'set_story_cover는 security definer다'
);

SELECT function_privs_are(
  'public', 'set_story_cover', ARRAY['uuid', 'text', 'text'],
  'authenticated', ARRAY['EXECUTE'],
  'authenticated만 표지를 달 수 있다'
);

SELECT function_privs_are(
  'public', 'set_story_cover', ARRAY['uuid', 'text', 'text'],
  'anon', ARRAY[]::text[],
  'anon은 표지를 달 수 없다'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT set_story_cover(
  (
    SELECT story_id
    FROM create_story(
      jsonb_build_object(
        'title', '표지를 달 스토리',
        'hook', '표지가 붙는지 본다',
        'intro', '표지가 붙는지 본다',
        'coverEmoji', '📘',
        'completionTitle', '끝',
        'completionCopy', '끝냈어요',
        'characters', jsonb_build_array(
          jsonb_build_object('name', 'Lena', 'position', 1, 'persona', '호텔 프런트 직원.')
        ),
        'episodes', jsonb_build_array(
          jsonb_build_object(
            'number', 1,
            'title', '예약이 없다',
            'preview', '예약이 없대요',
            'situation', '프런트에서 예약을 찾지 못한다',
            'situationEmoji', '🏨',
            'opening', '밤늦은 프런트다.',
            'stage', 'Lena: Your booking is not here.',
            'castNames', jsonb_build_array('Lena'),
            'endingSuccess', '방을 받는다',
            'endingCompromise', '다른 방을 받는다',
            'endingFailure', '방을 받지 못한다'
          )
        )
      )
    )
  ),
  'made/11111111-1111-4111-8111-111111111111/' || repeat('a', 64) || '.png',
  'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
);

CREATE TEMPORARY TABLE made AS
SELECT id FROM public.stories WHERE owner_id = '11111111-1111-4111-8111-111111111111';

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE id = (SELECT id FROM made)),
  'made/11111111-1111-4111-8111-111111111111/' || repeat('a', 64) || '.png',
  '자기 스토리에 표지 경로가 붙는다'
);

SELECT is(
  (SELECT cover_blurhash FROM public.stories WHERE id = (SELECT id FROM made)),
  'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  '표지 해시도 함께 붙는다'
);

-- 스토리당 한 장이다. 카드를 고쳐도, 다시 플레이해도 새 표지가 덮지 않는다.
SELECT lives_ok(
  $$select set_story_cover(
      (select id from made),
      'made/11111111-1111-4111-8111-111111111111/' || repeat('b', 64) || '.png',
      'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
    )$$,
  '이미 표지가 있는 스토리에 다시 달아도 실패하지 않는다'
);

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE id = (SELECT id FROM made)),
  'made/11111111-1111-4111-8111-111111111111/' || repeat('a', 64) || '.png',
  '두 번째 표지는 첫 표지를 덮지 않는다'
);

RESET ROLE;

UPDATE public.stories
SET cover_image_path = NULL, cover_blurhash = NULL
WHERE id = (SELECT id FROM made);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

-- 자기 폴더 밖의 파일을 가리키면 달리지 않는다. 남이 올린 파일을 자기 표지로
-- 삼는 길을 열지 않는다.
SELECT lives_ok(
  $$select set_story_cover(
      (select id from made),
      'made/22222222-2222-4222-8222-222222222222/' || repeat('c', 64) || '.png',
      'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
    )$$,
  '남의 폴더를 가리켜도 실패하지 않는다'
);

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE id = (SELECT id FROM made)),
  NULL,
  '남의 폴더를 가리킨 표지는 달리지 않는다'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT lives_ok(
  $$select set_story_cover(
      (select id from made),
      'made/22222222-2222-4222-8222-222222222222/' || repeat('d', 64) || '.png',
      'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
    )$$,
  '남의 스토리에 표지를 달아도 실패하지 않는다'
);

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE id = (SELECT id FROM made)),
  NULL,
  '남의 스토리에는 표지가 달리지 않는다'
);

-- 정책이 만들 수 없는 모양의 경로는 함수도 받지 않는다. 두 버킷이 모두
-- 공개라 이런 경로는 실제로 열리는 주소가 된다.
SELECT lives_ok(
  $$select set_story_cover(
      (select id from made),
      'made/11111111-1111-4111-8111-111111111111/../../avatars/22222222-2222-4222-8222-222222222222/profile.jpg',
      'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
    )$$,
  '폴더를 거슬러 올라가는 경로를 넘겨도 실패하지 않는다'
);

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE id = (SELECT id FROM made)),
  NULL,
  '폴더를 거슬러 올라가는 경로는 표지가 되지 않는다'
);

RESET ROLE;

-- 공식 스토리는 표지가 비어 있어도 이 길로 붙지 않는다. 비워 두지 않으면
-- 표지가 이미 있다는 것만으로 막혀 소유 검사를 확인하지 못한다.
UPDATE public.stories SET cover_image_path = NULL WHERE slug = 'mia-cafe';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT set_story_cover(
  (SELECT id FROM public.stories WHERE slug = 'mia-cafe'),
  'made/22222222-2222-4222-8222-222222222222/' || repeat('e', 64) || '.png',
  'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
);

RESET ROLE;

SELECT is(
  (SELECT cover_image_path FROM public.stories WHERE slug = 'mia-cafe'),
  NULL,
  '주인이 없는 공식 스토리에는 표지가 붙지 않는다'
);

SELECT * FROM finish();
ROLLBACK;
