-- 플레이 기록은 스토리·화 번호가 아니라 안정된 에피소드 id를 참조한다. 접근
-- 규칙과 결말 동작은 episode_plays_test.sql이 소유한다.
BEGIN;
SELECT plan(11);

INSERT INTO auth.users (id, email)
VALUES
  ('33333333-3333-4333-8333-333333333333', 'story-progress@example.test'),
  ('55555555-5555-4555-8555-555555555555', 'other-progress@example.test');

SELECT has_column(
  'public',
  'episode_plays',
  'episode_id',
  'a play references an episode id'
);

SELECT col_is_unique(
  'public',
  'episode_plays',
  array['user_id', 'episode_id'],
  'an account holds at most one play per episode'
);

SELECT hasnt_column(
  'public',
  'episode_plays',
  'season',
  'season numbers are not progress keys'
);

SELECT hasnt_column(
  'public',
  'episode_plays',
  'episode',
  'episode numbers are not progress keys'
);

SELECT function_privs_are(
  'public',
  'finish_episode',
  array['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can finish an episode by id'
);

SELECT function_returns(
  'public',
  'finish_episode',
  array['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'boolean',
  'finishing reports whether this request recorded the permanent ending'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

SELECT is(
  (
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공',
      '새 아이스 아메리카노를 받아냈다.'
    )
  ),
  true,
  'the first episode in a story can finish'
);

SELECT is(
  (
    select ending_kind
    from public.episode_plays
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  '성공',
  'the ending is stored against the episode id'
);

SELECT throws_ok(
  $$
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000003'::uuid,
      '성공',
      '앞 화를 건너뛰었다.'
    )
  $$,
  '22023',
  null,
  'an episode cannot finish before every earlier episode in its story'
);

SELECT is(
  (
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패',
      '나중에 도착한 다른 결말.'
    )
  ),
  false,
  'a later ending learns that another request already closed the episode'
);

SELECT is(
  (
    select ending_kind
    from public.episode_plays
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  '성공',
  'a repeated ending never overwrites the first one'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
