BEGIN;
SELECT plan(13);

-- 사용자가 만든 스토리 하나를 공식 콘텐츠 옆에 세워 둔다. 공식 seed를 다시
-- 실행하는 문장은 `slug`와 `(story_id, number)`로 대상을 좁히는데, 만든
-- 스토리에는 `slug`가 없다. 그 구분이 실제로 이 행을 비켜 가는지 확인한다.
INSERT INTO auth.users (id, email)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'seed-maker@example.test');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

CREATE TEMP TABLE made AS
SELECT * FROM public.create_story($json${
  "title": "베를린 출장 일주일",
  "hook": "다음 달 베를린 출장인데, 혼자 해내야 해요",
  "intro": "첫 해외 출장으로 떠난 베를린에서 보내는 일주일.",
  "coverEmoji": "🧳",
  "completionTitle": "출장을 마쳤어요",
  "completionCopy": "호텔부터 미팅까지 영어로 지나왔어요.",
  "characters": [
    { "name": "Lena", "position": 1, "persona": "30대 호텔 프런트 직원이다." }
  ],
  "episodes": [
    {
      "number": 1,
      "title": "예약이 없는 호텔",
      "preview": "밤 열한 시에 도착했는데 제 예약이 없대요.",
      "situation": "예약을 찾아 방을 받아 보세요",
      "situationEmoji": "🏨",
      "opening": "밤 열한 시, 호텔 프런트 앞에 도착했다.\nLena: I cannot find a reservation under your name.",
      "stage": "상황:\n- 사용자가 말을 해야 이 일이 풀린다.",
      "castNames": ["Lena"],
      "endingSuccess": "방을 배정받았을 때",
      "endingCompromise": "임시 방법을 받았을 때",
      "endingFailure": "방을 받지 못했을 때"
    }
  ]
}$json$::jsonb);

RESET ROLE;

-- 그 스토리를 실제로 플레이한 회차도 하나 둔다.
INSERT INTO public.story_plays (id, user_id, story_id, last_user_message_at)
VALUES (
  'b1111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  (SELECT story_id FROM made),
  '2026-01-02 03:04:05+00'
);

CREATE TEMP TABLE seeded_story_ids AS
SELECT slug, id FROM public.stories WHERE slug IS NOT NULL;
CREATE TEMP TABLE seeded_episode_ids AS
SELECT episodes.story_id, episodes.number, episodes.id
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug IS NOT NULL;
CREATE TEMP TABLE seeded_titles AS
SELECT 'story' AS kind, id, title FROM public.stories WHERE slug IS NOT NULL
UNION ALL
SELECT 'episode', episodes.id, episodes.title
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug IS NOT NULL;
CREATE TEMP TABLE made_before AS
SELECT to_jsonb(stories) AS story FROM public.stories
WHERE id = (SELECT story_id FROM made);
CREATE TEMP TABLE made_episodes_before AS
SELECT to_jsonb(episodes) AS episode FROM public.episodes
WHERE story_id = (SELECT story_id FROM made);
CREATE TEMP TABLE made_characters_before AS
SELECT to_jsonb(characters) AS person FROM public.characters
WHERE story_id = (SELECT story_id FROM made);

UPDATE public.stories SET title = 'temporary title' WHERE slug IS NOT NULL;
UPDATE public.episodes SET title = 'temporary title'
WHERE story_id IN (SELECT id FROM public.stories WHERE slug IS NOT NULL);

-- Re-run the actual seed, not a copy of its upsert logic.
\ir seed.sql
\ir seed.sql

SELECT is(
  (SELECT count(*) FROM public.stories WHERE slug IS NOT NULL), 5::bigint,
  'repeated seed keeps five stories'
);
SELECT is(
  (SELECT count(*) FROM public.episodes e
     JOIN public.stories s ON s.id = e.story_id WHERE s.slug IS NOT NULL),
  25::bigint,
  'repeated seed keeps twenty-five episodes'
);
SELECT results_eq(
  'select slug, id from public.stories where slug is not null order by slug',
  'select slug, id from seeded_story_ids order by slug',
  'repeated seed preserves story IDs'
);
SELECT results_eq(
  $$select e.story_id, e.number, e.id from public.episodes e
      join public.stories s on s.id = e.story_id
      where s.slug is not null order by e.story_id, e.number$$,
  'select story_id, number, id from seeded_episode_ids order by story_id, number',
  'repeated seed preserves episode IDs and their story links'
);
SELECT col_has_default('public', 'stories', 'id', 'new stories get an ID automatically');
SELECT col_has_default('public', 'episodes', 'id', 'new episodes get an ID automatically');
SELECT results_eq(
  'select id, title from public.stories where slug is not null order by id',
  $$select id, title from seeded_titles where kind = 'story' order by id$$,
  'repeated seed updates existing story content'
);
SELECT results_eq(
  $$select e.id, e.title from public.episodes e
      join public.stories s on s.id = e.story_id
      where s.slug is not null order by e.id$$,
  $$select id, title from seeded_titles where kind = 'episode' order by id$$,
  'repeated seed updates existing episode content'
);

-- 사용자가 만든 스토리는 seed가 지나가도 한 글자도 달라지지 않는다.
SELECT results_eq(
  $$select to_jsonb(stories) from public.stories
      where id = (select story_id from made)$$,
  'select story from made_before',
  'repeated seed leaves a made story exactly as it was'
);
SELECT results_eq(
  $$select to_jsonb(episodes) from public.episodes
      where story_id = (select story_id from made) order by number$$,
  'select episode from made_episodes_before',
  'repeated seed leaves the episodes of a made story alone'
);
SELECT results_eq(
  $$select to_jsonb(characters) from public.characters
      where story_id = (select story_id from made) order by position$$,
  'select person from made_characters_before',
  'repeated seed leaves the people of a made story alone'
);
SELECT is(
  (SELECT count(*) FROM public.episode_characters
     WHERE story_id = (SELECT story_id FROM made)),
  1::bigint,
  'repeated seed does not clear who stands in a made episode'
);
SELECT is(
  (SELECT last_user_message_at FROM public.story_plays
     WHERE id = 'b1111111-1111-4111-8111-111111111111'),
  '2026-01-02 03:04:05+00'::timestamptz,
  'a run through a made story keeps its place in the recent list'
);

SELECT * FROM finish();
ROLLBACK;
