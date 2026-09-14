INSERT INTO auth.users (id, email)
VALUES ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'upgrade-owner@example.test');

INSERT INTO public.stories
  (id, position, slug, title, target_language, completion_title, completion_copy,
   hook, intro, cover_emoji, cover_image_path, cover_blurhash)
VALUES
  (
    'e1111111-1111-4111-8111-111111111111', 1, 'mia-cafe', 'Story one',
    'en', 'Done one', 'Done copy one', 'Hook one', 'Intro one', '📚',
    'mia-cafe.png', 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
  ),
  (
    'e2222222-2222-4222-8222-222222222222', 2, 'business-trip', 'Story two',
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


INSERT INTO public.episode_messages(id, play_id, user_id, role, parts)
SELECT ('d1000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
 'f1111111-1111-4111-8111-111111111111', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 CASE WHEN n=1 THEN 'assistant' ELSE 'user' END,
 CASE WHEN n=1 THEN '[{"type":"data-speaker","data":{"name":"Mia"}},{"type":"text","text":"Hello!"},{"type":"data-speaker","data":{"name":"Owen"}},{"type":"text","text":"Welcome!"},{"type":"data-speaker","data":{"name":"Mia"}},{"type":"text","text":"Tea?"}]'::jsonb
 ELSE '[{"type":"text","text":"I order tea yesterday."}]'::jsonb END
FROM generate_series(1,4) n;
INSERT INTO public.utterance_meanings(message_id, utterance_at, user_id, meaning)
VALUES ('d1000000-0000-4000-8000-000000000001',0,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','안녕하세요!'),
 ('d1000000-0000-4000-8000-000000000001',1,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','환영해요!'),
 ('d1000000-0000-4000-8000-000000000001',2,'dddddddd-dddd-4ddd-8ddd-dddddddddddd',NULL);
INSERT INTO public.saved_expressions(id,user_id,episode_id,message_id,kind,english,speaker,meaning,utterance_at,created_at)
VALUES ('92222222-2222-4222-8222-222222222222','dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 'a1111111-1111-4111-8111-111111111111','d1000000-0000-4000-8000-000000000001',
 'utterance','Hello!','Mia','안녕하세요!',0,'2026-01-02 01:02:03+00');
INSERT INTO public.episode_expression_results(message_id,user_id,status,fixed,entries,situation,meaning,example,example_meaning)
VALUES ('d1000000-0000-4000-8000-000000000002','dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 'corrected','I ordered tea yesterday.',
 '[{"original":"order","fixed":"ordered","why":"지난 일이에요.","pattern":"past-tense"}]',
 '지난 주문을 말할 때','어제 차를 주문했어요.','I ordered coffee.','커피를 주문했어요.');
INSERT INTO public.episode_expression_results(message_id,user_id,status)
VALUES ('d1000000-0000-4000-8000-000000000003','dddddddd-dddd-4ddd-8ddd-dddddddddddd','natural'),
 ('d1000000-0000-4000-8000-000000000004','dddddddd-dddd-4ddd-8ddd-dddddddddddd','unclear');
INSERT INTO public.saved_expressions(id,user_id,episode_id,message_id,kind,english,original,entries,meaning,created_at)
VALUES ('93333333-3333-4333-8333-333333333333','dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 'a1111111-1111-4111-8111-111111111111','d1000000-0000-4000-8000-000000000002',
 'correction','I ordered tea yesterday.','I order tea yesterday.',
 '[{"original":"order","fixed":"ordered","why":"지난 일이에요."}]','어제 차를 주문했어요.','2026-01-03 01:02:03+00');
INSERT INTO public.saved_expressions(id,user_id,episode_id,kind,english,original,entries,meaning,created_at)
VALUES ('94444444-4444-4444-8444-444444444444','dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 'a1111111-1111-4111-8111-111111111111','guidance','Tea, please.','차 주세요.',
 '[{"original":"차","fixed":"Tea","why":"차를 주문해요."}]',NULL,'2026-01-04 01:02:03+00');
CREATE SCHEMA ci_expression_transfer;
CREATE TABLE ci_expression_transfer.notes AS SELECT * FROM public.saved_expressions;
CREATE TABLE ci_expression_transfer.meanings AS SELECT * FROM public.utterance_meanings;
CREATE TABLE ci_expression_transfer.results AS SELECT * FROM public.episode_expression_results;
CREATE TABLE ci_expression_transfer.messages AS SELECT * FROM public.episode_messages;
CREATE TABLE ci_expression_transfer.characters AS SELECT * FROM public.episode_characters;
