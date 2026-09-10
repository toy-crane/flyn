-- 이전 스키마 전용 합성 데이터. 현재 seed나 실제 사용자 기록을 사용하지 않는다.
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'expression-upgrade@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy, hook, intro, cover_emoji)
VALUES (gen_random_uuid(), 1, 'expression-upgrade', 'Test', 'en', 'Done', 'Done', 'Hook', 'Intro', '📚');

INSERT INTO public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   cast_names, ending_success, ending_compromise, ending_failure)
SELECT gen_random_uuid(), id, 1, 'Test', 'Preview', 'Situation', '📚',
       'Opening', 'Stage', ARRAY['Mia'], 'Success', 'Compromise', 'Failure'
FROM public.stories;

INSERT INTO public.story_plays (user_id, story_id, started_at)
SELECT users.id, stories.id, '2026-01-01 00:00:00+00'
FROM auth.users CROSS JOIN public.stories;

INSERT INTO public.episode_plays (user_id, story_play_id, episode_id, started_at)
SELECT played.user_id, played.id, episodes.id, '2026-01-01 00:00:00+00'
FROM public.story_plays played JOIN public.episodes ON episodes.story_id = played.story_id;

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
SELECT gen_random_uuid(), id, user_id, 'user',
       '[{"type":"text","text":"I order a latte."}]'::jsonb, '2026-01-01 00:01:00+00'
FROM public.episode_plays;

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
SELECT gen_random_uuid(), id, user_id, 'assistant',
       '[{"type":"text","text":"Here is your latte."}]'::jsonb, '2026-01-01 00:02:00+00'
FROM public.episode_plays;

INSERT INTO public.episode_corrections (message_id, user_id, original, corrected, reason, fixed, pattern)
SELECT id, user_id, 'order', 'I ordered a latte.', '지난 주문은 과거형으로 말해요.', 'ordered', 'past-order'
FROM public.episode_messages WHERE role = 'user';

UPDATE public.episode_plays SET ending_kind = '성공', ending_outcome = '커피를 받았어요.',
  memory_choice = '주문을 설명했어요.', memory_relationship = '직원이 도와줬어요.',
  memory_question = '다음에 다시 올까요?', finished_at = '2026-01-01 00:03:00+00';

CREATE SCHEMA ci_expression_preservation;
CREATE TABLE ci_expression_preservation.story_plays AS SELECT * FROM public.story_plays;
CREATE TABLE ci_expression_preservation.plays AS SELECT * FROM public.episode_plays;
CREATE TABLE ci_expression_preservation.messages AS SELECT * FROM public.episode_messages;
