-- 이전 스키마 전용 합성 데이터. 현재 seed에 의존하지 않는다.
--
-- 이 마이그레이션이 기존 행에 거는 것은 `episodes`의 (id, story_id) 고유 제약
-- 하나다. 그 제약이 어떤 콘텐츠 행도 밀어내지 않고, 그 위에 쌓인 회차와 플레이
-- 기록의 연결도 그대로인지 확인한다.
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'characters-a@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy, hook, intro, cover_emoji)
VALUES (gen_random_uuid(), 1, 'upgrade-cast-one', 'Cast one', 'en', 'Done', 'Done', 'Hook', 'Intro', '📚'),
       (gen_random_uuid(), 2, 'upgrade-cast-two', 'Cast two', 'en', 'Done', 'Done', 'Hook', 'Intro', '📗');

INSERT INTO public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   cast_names, ending_success, ending_compromise, ending_failure)
SELECT gen_random_uuid(), stories.id, number, 'Test', 'Preview', 'Situation', '📚',
       'Opening', 'Stage', ARRAY['Mia', 'Owen'], 'Success', 'Compromise', 'Failure'
FROM public.stories CROSS JOIN generate_series(1, 3) AS number;

INSERT INTO public.story_plays (id, user_id, story_id, started_at)
SELECT gen_random_uuid(), users.id, stories.id, '2026-01-01 00:00:00+00'
FROM auth.users CROSS JOIN public.stories
WHERE users.email = 'characters-a@example.test';

INSERT INTO public.episode_plays (user_id, episode_id, story_play_id, started_at)
SELECT run.user_id, episodes.id, run.id, '2026-01-01 00:00:00+00'
FROM public.story_plays run
JOIN public.episodes ON episodes.story_id = run.story_id
WHERE episodes.number <= 2;

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
SELECT gen_random_uuid(), played.id, played.user_id, 'assistant',
       '[{"type":"text","text":"Opening preserved"}]'::jsonb, '2026-01-01 00:01:00+00'
FROM public.episode_plays played;

-- 마이그레이션 전의 콘텐츠와 그 위의 기록을 그대로 담아 둔다.
CREATE SCHEMA ci_preservation;
CREATE TABLE ci_preservation.stories AS SELECT * FROM public.stories;
CREATE TABLE ci_preservation.episodes AS SELECT * FROM public.episodes;
CREATE TABLE ci_preservation.story_plays AS SELECT * FROM public.story_plays;
CREATE TABLE ci_preservation.episode_plays AS SELECT * FROM public.episode_plays;
CREATE TABLE ci_preservation.episode_messages AS SELECT * FROM public.episode_messages;
