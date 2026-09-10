-- 이전 스키마 전용 합성 데이터. 현재 seed에 의존하지 않는다.
--
-- 이 마이그레이션이 기존 행에 하는 일은 하나다. 뜻이 비어 있던 교정과 안내에
-- 표현 돌아보기가 이미 만들어 둔 뜻을 옮겨 담는다. 그래서 세 갈래를 만든다.
-- 판정과 메시지가 남아 있어 채워질 항목, 메시지를 잃어 빈 채로 남을 항목,
-- 원래 뜻을 갖고 있어 건드리면 안 되는 인물 대사다.
-- 두 계정을 만든다. 둘째 계정은 첫 계정의 뜻이 자기 항목으로 새지 않는지를
-- 보는 데 쓴다.
INSERT INTO auth.users (id, email)
VALUES
  ('99999999-9999-4999-8999-999999999999', 'meaning-a@example.test'),
  ('88888888-8888-4888-8888-888888888888', 'meaning-b@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy, hook, intro, cover_emoji)
VALUES (gen_random_uuid(), 1, 'upgrade-meaning', 'Meaning', 'en', 'Done', 'Done', 'Hook', 'Intro', '📚');

INSERT INTO public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   cast_names, ending_success, ending_compromise, ending_failure)
SELECT gen_random_uuid(), stories.id, 1, 'Test', 'Preview', 'Situation', '📚',
       'Opening', 'Stage', ARRAY['Mia'], 'Success', 'Compromise', 'Failure'
FROM public.stories WHERE slug = 'upgrade-meaning';

INSERT INTO public.story_plays (id, user_id, story_id, started_at)
SELECT 'a9000000-0000-4000-8000-000000000001',
       '99999999-9999-4999-8999-999999999999', stories.id, '2026-01-01 00:00:00+00'
FROM public.stories WHERE slug = 'upgrade-meaning';

INSERT INTO public.episode_plays (id, user_id, story_play_id, episode_id, started_at)
SELECT 'aa900000-0000-4000-8000-000000000001',
       '99999999-9999-4999-8999-999999999999',
       'a9000000-0000-4000-8000-000000000001', episodes.id, '2026-01-01 00:00:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

-- 인물 대사 하나와 사용자 메시지 둘. 사용자 메시지 하나는 뒤에서 지워 메시지를
-- 잃은 항목을 만든다.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
VALUES
  (
    'cc900000-0000-4000-8000-000000000001',
    'aa900000-0000-4000-8000-000000000001',
    '99999999-9999-4999-8999-999999999999',
    'assistant',
    '[{"type":"data-speaker","data":{"name":"Mia"}},{"type":"text","text":"Next in line, please!"}]'::jsonb,
    '2026-01-01 00:01:00+00'
  ),
  (
    'cc900000-0000-4000-8000-000000000002',
    'aa900000-0000-4000-8000-000000000001',
    '99999999-9999-4999-8999-999999999999',
    'user',
    '[{"type":"text","text":"I order hot americano."}]'::jsonb,
    '2026-01-01 00:02:00+00'
  ),
  (
    'cc900000-0000-4000-8000-000000000003',
    'aa900000-0000-4000-8000-000000000001',
    '99999999-9999-4999-8999-999999999999',
    'user',
    '[{"type":"text","text":"I want ice latte."}]'::jsonb,
    '2026-01-01 00:03:00+00'
  ),
  -- 판정은 받았지만 아직 담지 않은 자리. 규칙이 실제로 풀렸는지 새로 담아 보는
  -- 데 쓴다.
  (
    'cc900000-0000-4000-8000-000000000004',
    'aa900000-0000-4000-8000-000000000001',
    '99999999-9999-4999-8999-999999999999',
    'user',
    '[{"type":"text","text":"영수증 주세요."}]'::jsonb,
    '2026-01-01 00:04:00+00'
  );

INSERT INTO public.episode_expression_results (
  message_id, user_id, status, fixed, entries, situation, meaning, example, example_meaning
)
VALUES
  (
    'cc900000-0000-4000-8000-000000000002',
    '99999999-9999-4999-8999-999999999999',
    'corrected',
    'I ordered a hot americano.',
    '[{"original":"order","fixed":"ordered","pattern":"past-tense","why":"지난 일은 ordered로 써요."}]'::jsonb,
    '음료를 주문할 때',
    '저는 뜨거운 아메리카노를 시켰어요.',
    'I ordered a tea.',
    '저는 차를 시켰어요.'
  ),
  (
    'cc900000-0000-4000-8000-000000000003',
    '99999999-9999-4999-8999-999999999999',
    'corrected',
    'I want an iced latte.',
    '[{"original":"ice","fixed":"iced","pattern":"adjective","why":"얼음 넣은 음료는 iced예요."}]'::jsonb,
    '음료를 고를 때',
    '저는 아이스 라테를 원해요.',
    'I want an iced tea.',
    '저는 아이스 티를 원해요.'
  ),
  (
    'cc900000-0000-4000-8000-000000000004',
    '99999999-9999-4999-8999-999999999999',
    'corrected',
    'Could I get a receipt?',
    '[{"original":"영수증 주세요.","fixed":"Could I get a receipt?","pattern":"request","why":"영어로 물어봐요."}]'::jsonb,
    '영수증을 받을 때',
    '영수증을 받을 수 있을까요?',
    'Could I get a bag?',
    '봉투를 받을 수 있을까요?'
  );

-- 옛 규칙으로 담긴 항목들. 교정 둘은 뜻이 비어 있고, 인물 대사는 뜻을 갖는다.
INSERT INTO public.saved_expressions
  (id, user_id, kind, episode_id, message_id, english, original, entries, created_at)
SELECT
  'ee900000-0000-4000-8000-000000000001',
  '99999999-9999-4999-8999-999999999999', 'correction', episodes.id,
  'cc900000-0000-4000-8000-000000000002',
  'I ordered a hot americano.', 'I order hot americano.',
  '[{"original":"order","fixed":"ordered","why":"지난 일은 ordered로 써요."}]'::jsonb,
  '2026-01-01 00:04:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

INSERT INTO public.saved_expressions
  (id, user_id, kind, episode_id, message_id, english, original, entries, created_at)
SELECT
  'ee900000-0000-4000-8000-000000000002',
  '99999999-9999-4999-8999-999999999999', 'correction', episodes.id,
  'cc900000-0000-4000-8000-000000000003',
  'I want an iced latte.', 'I want ice latte.',
  '[{"original":"ice","fixed":"iced","why":"얼음 넣은 음료는 iced예요."}]'::jsonb,
  '2026-01-01 00:05:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

INSERT INTO public.saved_expressions
  (id, user_id, kind, episode_id, message_id, utterance_at, english, meaning, speaker, created_at)
SELECT
  'ee900000-0000-4000-8000-000000000003',
  '99999999-9999-4999-8999-999999999999', 'utterance', episodes.id,
  'cc900000-0000-4000-8000-000000000001', 0,
  'Next in line, please!', '다음 분이요!', 'Mia',
  '2026-01-01 00:06:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

-- 옛 안내 항목 하나. 교정과 같은 길로 채워지는지 함께 본다. 한국어로 쓴 말에
-- 붙는 판정이라 `original`이 한국어다.
INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
VALUES (
  'cc900000-0000-4000-8000-000000000005',
  'aa900000-0000-4000-8000-000000000001',
  '99999999-9999-4999-8999-999999999999',
  'user',
  '[{"type":"text","text":"자리 있나요?"}]'::jsonb,
  '2026-01-01 00:05:00+00'
);

INSERT INTO public.episode_expression_results (
  message_id, user_id, status, fixed, entries, situation, meaning, example, example_meaning
)
VALUES (
  'cc900000-0000-4000-8000-000000000005',
  '99999999-9999-4999-8999-999999999999',
  'corrected',
  'Is this seat taken?',
  '[{"original":"자리 있나요?","fixed":"Is this seat taken?","pattern":"question","why":"빈자리를 물을 때 이렇게 말해요."}]'::jsonb,
  '빈자리를 물을 때',
  '이 자리 비었나요?',
  'Is this table free?',
  '이 테이블 비었나요?'
);

INSERT INTO public.saved_expressions
  (id, user_id, kind, episode_id, message_id, english, original, entries, created_at)
SELECT
  'ee900000-0000-4000-8000-000000000004',
  '99999999-9999-4999-8999-999999999999', 'guidance', episodes.id,
  'cc900000-0000-4000-8000-000000000005',
  'Is this seat taken?', '자리 있나요?',
  '[{"original":"자리 있나요?","fixed":"Is this seat taken?","why":"빈자리를 물을 때 이렇게 말해요."}]'::jsonb,
  '2026-01-01 00:07:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

-- 둘째 계정의 자기 회차와 자기 메시지와 자기 판정, 그리고 뜻이 빈 자기 교정.
-- 첫 계정이 같은 자리에 가진 뜻과 섞이면 안 된다.
INSERT INTO public.story_plays (id, user_id, story_id, started_at)
SELECT 'b9000000-0000-4000-8000-000000000001',
       '88888888-8888-4888-8888-888888888888', stories.id, '2026-01-01 00:00:00+00'
FROM public.stories WHERE slug = 'upgrade-meaning';

INSERT INTO public.episode_plays (id, user_id, story_play_id, episode_id, started_at)
SELECT 'bb900000-0000-4000-8000-000000000001',
       '88888888-8888-4888-8888-888888888888',
       'b9000000-0000-4000-8000-000000000001', episodes.id, '2026-01-01 00:00:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

INSERT INTO public.episode_messages (id, play_id, user_id, role, parts, created_at)
VALUES (
  'dd900000-0000-4000-8000-000000000001',
  'bb900000-0000-4000-8000-000000000001',
  '88888888-8888-4888-8888-888888888888',
  'user',
  '[{"type":"text","text":"I want ice latte."}]'::jsonb,
  '2026-01-01 00:08:00+00'
);

INSERT INTO public.episode_expression_results (
  message_id, user_id, status, fixed, entries, situation, meaning, example, example_meaning
)
VALUES (
  'dd900000-0000-4000-8000-000000000001',
  '88888888-8888-4888-8888-888888888888',
  'corrected',
  'I want an iced latte.',
  '[{"original":"ice","fixed":"iced","pattern":"adjective","why":"얼음 넣은 음료는 iced예요."}]'::jsonb,
  '음료를 고를 때',
  '둘째 계정의 뜻이다.',
  'I want an iced tea.',
  '둘째 계정의 예문 뜻이다.'
);

INSERT INTO public.saved_expressions
  (id, user_id, kind, episode_id, message_id, english, original, entries, created_at)
SELECT
  'ee900000-0000-4000-8000-000000000005',
  '88888888-8888-4888-8888-888888888888', 'correction', episodes.id,
  'dd900000-0000-4000-8000-000000000001',
  'I want an iced latte.', 'I want ice latte.',
  '[{"original":"ice","fixed":"iced","why":"얼음 넣은 음료는 iced예요."}]'::jsonb,
  '2026-01-01 00:09:00+00'
FROM public.episodes
JOIN public.stories ON stories.id = episodes.story_id
WHERE stories.slug = 'upgrade-meaning';

-- 둘째 교정의 메시지를 지워 옮겨 올 곳이 없는 항목을 만든다. 참조만 끊기고
-- 항목은 남는다.
DELETE FROM public.episode_messages
WHERE id = 'cc900000-0000-4000-8000-000000000003';

-- 마이그레이션 전의 항목을 그대로 담아 둔다.
CREATE SCHEMA ci_preservation;
CREATE TABLE ci_preservation.saved_expressions AS
  SELECT * FROM public.saved_expressions;
