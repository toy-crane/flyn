-- 이전 스키마 전용 합성 데이터. 현재 seed에 의존하지 않는다.
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'upgrade-a@example.test'),
       (gen_random_uuid(), 'upgrade-b@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy, hook, intro, cover_emoji)
VALUES (gen_random_uuid(), 1, 'upgrade-story', 'Test', 'en', 'Done', 'Done', 'Hook', 'Intro', '📚');

INSERT INTO public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   cast_names, ending_success, ending_compromise, ending_failure)
SELECT gen_random_uuid(), stories.id, number, 'Test', 'Preview', 'Situation', '📚',
       'Opening', 'Stage', ARRAY['Mia'], 'Success', 'Compromise', 'Failure'
FROM public.stories CROSS JOIN generate_series(1, 2) AS number;

INSERT INTO public.episode_plays (user_id, episode_id, started_at)
SELECT users.id, episodes.id, '2026-01-01 00:00:00+00'
FROM auth.users CROSS JOIN public.episodes
WHERE users.email = 'upgrade-a@example.test' OR episodes.number = 1;

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
SELECT gen_random_uuid(), played.id, played.user_id, 'assistant',
       '[{"type":"text","text":"Opening preserved"}]'::jsonb, '2026-01-01 00:01:00+00'
FROM public.episode_plays played;

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
SELECT gen_random_uuid(), played.id, played.user_id, 'user',
       '[{"type":"text","text":"My choice preserved"}]'::jsonb, '2026-01-01 00:02:00+00'
FROM public.episode_plays played JOIN auth.users ON users.id = played.user_id
WHERE users.email = 'upgrade-a@example.test';

INSERT INTO public.episode_corrections (message_id, user_id, original, corrected, reason, fixed, pattern)
SELECT id, user_id, 'choice', 'My choice preserved', '테스트 교정', 'choice', 'test-choice'
FROM public.episode_messages WHERE role = 'user';

UPDATE public.episode_plays SET ending_kind = '성공', ending_outcome = 'Kept outcome',
  memory_choice = 'Kept choice', memory_relationship = 'Kept relationship',
  memory_question = 'Kept question', finished_at = '2026-01-01 00:03:00+00'
WHERE episode_id IN (SELECT id FROM public.episodes WHERE number = 1);

-- 새 구조에서 생기는 열을 제외한 모든 기존 값을 비교한다.
CREATE SCHEMA ci_preservation;
CREATE TABLE ci_preservation.plays AS SELECT * FROM public.episode_plays;
CREATE TABLE ci_preservation.messages AS SELECT * FROM public.episode_messages;
CREATE TABLE ci_preservation.corrections AS SELECT * FROM public.episode_corrections;
