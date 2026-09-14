BEGIN;
SELECT no_plan();
SELECT has_table('public', 'expressions', '번역과 노트가 표현 하나를 읽는다');

INSERT INTO auth.users(id, email)
VALUES ('33333333-3333-4333-8333-333333333333', 'expressions@example.test');
INSERT INTO public.story_plays(id, user_id, story_id)
SELECT 'a3000000-0000-4000-8000-000000000001',
 '33333333-3333-4333-8333-333333333333', id FROM public.stories WHERE slug = 'mia-cafe';
INSERT INTO public.episode_plays(id, user_id, story_play_id, episode_id)
SELECT 'aa300000-0000-4000-8000-000000000001',
 '33333333-3333-4333-8333-333333333333', 'a3000000-0000-4000-8000-000000000001', e.id
FROM public.episodes e JOIN public.stories s ON s.id = e.story_id
WHERE s.slug = 'mia-cafe' AND e.number = 1;
INSERT INTO public.episode_messages(id, episode_play_id, user_id, role, parts)
VALUES ('cc300000-0000-4000-8000-000000000001',
 'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
 'assistant', '[{"type":"data-speaker","data":{"name":"Mia"}},{"type":"text","text":"Hello!"}]');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
CREATE TEMP TABLE claimed AS
SELECT * FROM public.claim_dialogue_expression(
 'cc300000-0000-4000-8000-000000000001', 0, 'Mia', 'Hello!',
 'dd300000-0000-4000-8000-000000000001');
SELECT is((SELECT meaning FROM claimed), NULL::text, '생성 중에는 뜻을 완성한 것으로 표시하지 않는다');
SELECT lives_ok($$SELECT public.complete_dialogue_expression(
 'cc300000-0000-4000-8000-000000000001', 0,
 'dd300000-0000-4000-8000-000000000001', '안녕하세요!')$$,
 '선점한 요청이 번역을 한 번 남긴다');
UPDATE public.expressions SET saved_at = clock_timestamp();
CREATE TEMP TABLE saved AS SELECT id, meaning, saved_at FROM public.expressions;
UPDATE public.expressions SET saved_at = clock_timestamp();
SELECT results_eq('SELECT id, meaning, saved_at FROM public.expressions',
 'SELECT id, meaning, saved_at FROM saved', '중복 담기는 같은 표현과 저장 시각을 유지한다');
UPDATE public.expressions SET saved_at = NULL;
SELECT is((SELECT meaning FROM public.expressions), '안녕하세요!', '취소해도 대화의 번역은 남는다');
SELECT is((SELECT saved_at FROM public.expressions), NULL::timestamptz, '취소한 표현은 노트에서 빠진다');
UPDATE public.expressions SET saved_at = clock_timestamp();
SELECT ok((SELECT e.saved_at > s.saved_at FROM public.expressions e JOIN saved s USING(id)),
 '취소 후 다시 담으면 새 저장 시각을 사용한다');

RESET ROLE;
INSERT INTO public.episode_messages(id, episode_play_id, user_id, role, parts)
VALUES ('cc300000-0000-4000-8000-000000000002',
 'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
 'user', '[{"type":"text","text":"I order tea yesterday."}]'),
 ('cc300000-0000-4000-8000-000000000003',
 'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
 'user', '[{"type":"text","text":"Hello!"}]');
SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.save_expression_result(
 'cc300000-0000-4000-8000-000000000002', 'provided', '{"text":"I ordered tea yesterday."}')$$,
 '23514', NULL, '내용이 없는 교정은 완료로 확정하지 않는다');
SELECT is((SELECT expression_status FROM public.episode_messages WHERE id = 'cc300000-0000-4000-8000-000000000002'),
 NULL::text, '실패한 교정은 미완료로 남는다');
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000002', 'provided',
 '{"text":"I ordered tea yesterday.","meaning":"어제 차를 주문했어요.","entries":[{"original":"order","fixed":"ordered","why":"지난 일이에요.","pattern":"past-tense"}],"situation":"지난 주문을 말할 때","example":"I ordered coffee.","exampleMeaning":"커피를 주문했어요."}'),
 'provided', '표현과 완료 판정을 함께 저장한다');
SET CONSTRAINTS ALL IMMEDIATE;
SELECT is((SELECT original FROM public.expressions WHERE message_id = 'cc300000-0000-4000-8000-000000000002'),
 'I order tea yesterday.', '원문은 저장된 메시지에서 가져온다');
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000002', 'natural'),
 'provided', '먼저 확정한 결과를 겹친 요청이 바꾸지 않는다');
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000003', 'natural'),
 'natural', '자연스러운 표현도 완료 판정을 남긴다');
SELECT is((SELECT count(*) FROM public.expressions WHERE message_id = 'cc300000-0000-4000-8000-000000000003'),
 0::bigint, '자연스러운 표현에는 카드를 만들지 않는다');
DELETE FROM public.episode_messages WHERE id = 'cc300000-0000-4000-8000-000000000001';
SELECT is((SELECT meaning FROM public.expressions WHERE id = (SELECT id FROM saved)),
 '안녕하세요!', '원본을 지워도 담은 뜻은 남는다');
SELECT is((SELECT message_id FROM public.expressions WHERE id = (SELECT id FROM saved)),
 NULL::uuid, '원본을 지우면 출처 연결만 끊는다');
UPDATE public.expressions SET saved_at = NULL WHERE id = (SELECT id FROM saved);
SELECT is((SELECT count(*) FROM public.expressions WHERE id = (SELECT id FROM saved)),
 0::bigint, '원본을 잃은 표현을 취소하면 표현도 지운다');
DELETE FROM public.episode_messages WHERE id = 'cc300000-0000-4000-8000-000000000002';
SELECT is((SELECT count(*) FROM public.expressions), 0::bigint, '담지 않은 표현은 원본과 함께 지운다');

RESET ROLE;
INSERT INTO public.episode_messages(id,episode_play_id,user_id,role,parts)
VALUES ('cc300000-0000-4000-8000-000000000005','aa300000-0000-4000-8000-000000000001',
 '33333333-3333-4333-8333-333333333333','assistant','[{"type":"data-speaker","data":{"name":"Mia"}},{"type":"text","text":"Welcome!"}]');
SET LOCAL ROLE authenticated;
SELECT public.claim_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'Mia','Welcome!','dd300000-0000-4000-8000-000000000005');
SELECT is((SELECT claim_token FROM public.claim_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'Mia','Welcome!','dd300000-0000-4000-8000-000000000006')),
 'dd300000-0000-4000-8000-000000000005'::uuid,'겹친 요청은 먼저 선점한 요청을 기다린다');
SELECT throws_ok($$SELECT public.complete_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'dd300000-0000-4000-8000-000000000006','늦은 뜻')$$,
 '55000',NULL,'다른 선점 토큰은 결과를 쓰지 못한다');
RESET ROLE;
UPDATE public.expressions SET expires_at=clock_timestamp()-interval '1 second'
 WHERE message_id='cc300000-0000-4000-8000-000000000005';
SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.complete_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'dd300000-0000-4000-8000-000000000005','만료된 뜻')$$,
 '55000',NULL,'만료된 생성 결과는 확정하지 않는다');
SELECT is((SELECT claim_token FROM public.claim_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'Mia','Welcome!','dd300000-0000-4000-8000-000000000006')),
 'dd300000-0000-4000-8000-000000000006'::uuid,'만료 뒤에는 새 요청이 같은 표현을 선점한다');
SELECT throws_ok($$SELECT public.complete_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'dd300000-0000-4000-8000-000000000005','지난 요청의 뜻')$$,
 '55000',NULL,'회수된 선점의 늦은 응답은 새 선점을 덮지 못한다');
SELECT is((SELECT count(*) FROM public.expressions WHERE message_id='cc300000-0000-4000-8000-000000000005'),
 1::bigint,'재시도도 표현 행을 복제하지 않는다');
DELETE FROM public.episode_messages WHERE id='cc300000-0000-4000-8000-000000000005';
SELECT throws_ok($$SELECT public.complete_dialogue_expression('cc300000-0000-4000-8000-000000000005',0,'dd300000-0000-4000-8000-000000000006','환영해요!')$$,
 '42501',NULL,'원본 삭제 뒤 생성 완료가 표현을 되살리지 못한다');
SELECT is((SELECT count(*) FROM public.expressions),0::bigint,'삭제 뒤 진행 중인 고아 표현이 남지 않는다');

SELECT * FROM finish();
ROLLBACK;
