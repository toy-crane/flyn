-- 이전 스키마 전용 합성 데이터. 현재 seed에 의존하지 않는다.
--
-- 이 마이그레이션이 기존 행에 거는 것은 둘이다. `stories`에 붙는
-- `stories_authorship_usable` 검사와, 여섯 개의 외래키를 다시 만들며 도는
-- 재검증이다. 기존 스토리는 주인이 없고 slug와 자리를 함께 가지므로 검사를
-- 지나야 하고, 그 위에 쌓인 인물, 각본, 회차, 플레이, 저장한 표현의 연결도
-- 그대로여야 한다.
INSERT INTO auth.users (id, email)
VALUES ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'upgrade-owner@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy,
   hook, intro, cover_emoji, cover_image_path, cover_blurhash)
VALUES
  (
    'e1111111-1111-4111-8111-111111111111', 1, 'upgrade-story-one', 'Story one',
    'en', 'Done one', 'Done copy one', 'Hook one', 'Intro one', '📚',
    'upgrade-story-one.png', 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
  ),
  (
    'e2222222-2222-4222-8222-222222222222', 2, 'upgrade-story-two', 'Story two',
    'en', 'Done two', 'Done copy two', 'Hook two', 'Intro two', '📗',
    NULL, NULL
  );

INSERT INTO public.characters (id, story_id, name, position, persona)
VALUES
  (
    'c1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111', 'Mia', 1, 'Persona Mia'
  ),
  (
    'c2222222-2222-4222-8222-222222222222',
    'e1111111-1111-4111-8111-111111111111', 'Owen', 2, 'Persona Owen'
  ),
  (
    'c3333333-3333-4333-8333-333333333333',
    'e2222222-2222-4222-8222-222222222222', 'Anna', 1, 'Persona Anna'
  );

INSERT INTO public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   cast_names, ending_success, ending_compromise, ending_failure)
VALUES
  (
    'a1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111', 1, 'One-1', 'Preview', 'Situation', '📚',
    'Opening', 'Stage', ARRAY['Mia', 'Owen'], 'Success', 'Compromise', 'Failure'
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    'e1111111-1111-4111-8111-111111111111', 2, 'One-2', 'Preview', 'Situation', '📚',
    'Opening', 'Stage', ARRAY['Mia'], 'Success', 'Compromise', 'Failure'
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    'e2222222-2222-4222-8222-222222222222', 1, 'Two-1', 'Preview', 'Situation', '📗',
    'Opening', 'Stage', ARRAY['Anna'], 'Success', 'Compromise', 'Failure'
  );

INSERT INTO public.episode_characters (episode_id, character_id, story_id, at)
VALUES
  (
    'a1111111-1111-4111-8111-111111111111',
    'c1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111', 1
  ),
  (
    'a1111111-1111-4111-8111-111111111111',
    'c2222222-2222-4222-8222-222222222222',
    'e1111111-1111-4111-8111-111111111111', 2
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    'c1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111', 1
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'e2222222-2222-4222-8222-222222222222', 1
  );

INSERT INTO public.story_plays (id, user_id, story_id, started_at, last_user_message_at)
VALUES (
  'b1111111-1111-4111-8111-111111111111',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'e1111111-1111-4111-8111-111111111111',
  '2026-01-01 00:00:00+00',
  '2026-01-02 03:04:05+00'
);

INSERT INTO public.episode_plays
  (id, user_id, story_play_id, episode_id, started_at,
   finished_at, ending_kind, ending_outcome)
VALUES (
  'f1111111-1111-4111-8111-111111111111',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'b1111111-1111-4111-8111-111111111111',
  'a1111111-1111-4111-8111-111111111111',
  '2026-01-01 00:00:00+00',
  '2026-01-01 00:12:00+00',
  '성공',
  '주문한 커피를 다시 받아냈다'
);

INSERT INTO public.saved_expressions
  (id, user_id, episode_id, kind, english, speaker, meaning, utterance_at)
VALUES (
  '91111111-1111-4111-8111-111111111111',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'a1111111-1111-4111-8111-111111111111',
  'utterance',
  'Next in line, please!',
  'Mia',
  '다음 손님을 부르는 말이다.',
  1
);

-- 마이그레이션 뒤에 비교할 사본. 새 열이 붙기 전의 모습을 그대로 든다.
CREATE SCHEMA ci_preservation;
CREATE TABLE ci_preservation.stories AS SELECT * FROM public.stories;
CREATE TABLE ci_preservation.characters AS SELECT * FROM public.characters;
CREATE TABLE ci_preservation.episodes AS SELECT * FROM public.episodes;
CREATE TABLE ci_preservation.episode_characters AS SELECT * FROM public.episode_characters;
CREATE TABLE ci_preservation.story_plays AS SELECT * FROM public.story_plays;
CREATE TABLE ci_preservation.episode_plays AS SELECT * FROM public.episode_plays;
CREATE TABLE ci_preservation.saved_expressions AS SELECT * FROM public.saved_expressions;
