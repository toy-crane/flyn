BEGIN;
SELECT no_plan();

INSERT INTO auth.users (id, email)
VALUES ('33333333-3333-4333-8333-333333333333', 'expression-result@example.test');
INSERT INTO public.story_plays (id, user_id, story_id)
VALUES ('a3000000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333', (SELECT id FROM public.stories WHERE slug = 'mia-cafe'));
INSERT INTO public.episode_plays (id, user_id, story_play_id, episode_id)
VALUES ('aa300000-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333', 'a3000000-0000-4000-8000-000000000001',
  (SELECT e.id FROM public.episodes e JOIN public.stories s ON s.id = e.story_id
   WHERE s.slug = 'mia-cafe' AND e.number = 1));
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES ('cc300000-0000-4000-8000-000000000001',
  'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
  'user', '[{"type":"text","text":"Thank you."}]');
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES ('cc300000-0000-4000-8000-000000000002',
  'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
  'user', '[{"type":"text","text":"I ordered latte."}]');
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES ('cc300000-0000-4000-8000-000000000003',
  'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
  'assistant', '[{"type":"text","text":"Here you are."}]'),
  ('cc300000-0000-4000-8000-000000000004',
  'aa300000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333',
  'user', '[{"type":"text","text":"asdjkl"}]');
UPDATE public.episode_plays SET ending_kind = '성공', ending_outcome = '커피를 받았어요.', finished_at = now()
WHERE id = 'aa300000-0000-4000-8000-000000000001';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000001','natural'),
 'natural','교정할 내용이 없어도 사용자 메시지의 확인 결과를 남긴다');
SELECT is((SELECT expression_status FROM public.episode_messages WHERE id='cc300000-0000-4000-8000-000000000001'),
 'natural','다시 읽으면 완료된 자연스러움 판정을 받는다');
SELECT lives_ok($$SELECT public.save_expression_result('cc300000-0000-4000-8000-000000000002','provided',
 '{"text":"I ordered a latte.","entries":[{"original":"latte","fixed":"a latte","pattern":"article","why":"한 잔은 a latte라고 해요."}],"situation":"주문한 것을 말할 때","meaning":"라테를 주문했어요.","example":"I ordered a tea.","exampleMeaning":"차를 주문했어요."}')$$,
 '교정 판정과 돌아보기 카드 내용을 함께 저장한다');
SELECT results_eq(
 $$SELECT m.expression_status || '|' || e.text || '|' || e.situation || '|' || e.meaning || '|' || e.example || '|' || e.example_meaning
 FROM public.episode_messages m JOIN public.expressions e ON e.message_id=m.id WHERE m.id='cc300000-0000-4000-8000-000000000002'$$,
 ARRAY['provided|I ordered a latte.|주문한 것을 말할 때|라테를 주문했어요.|I ordered a tea.|차를 주문했어요.'::text],
 '저장된 카드의 상황과 뜻, 예문을 그대로 다시 읽는다');
SELECT throws_ok($$SELECT public.save_expression_result('cc300000-0000-4000-8000-000000000004','provided')$$,
 '23502',NULL,'카드 내용 없이 교정 완료 판정을 남길 수 없다');
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000004','unclear'),
 'unclear','뜻을 파악하기 어려운 판정도 결말 뒤에 남긴다');
SELECT is(public.save_expression_result('cc300000-0000-4000-8000-000000000001','unclear'),
 'natural','겹친 요청은 먼저 남긴 판정을 반환한다');
SELECT throws_ok($$UPDATE public.episode_messages SET expression_status='unclear'$$,
 '42501',NULL,'완료 판정을 직접 덮어쓸 수 없다');
SELECT lives_ok($$DELETE FROM public.expressions$$,'완성된 표현에는 삭제 정책이 적용되지 않는다');
SELECT is((SELECT count(*) FROM public.expressions),1::bigint,'완성된 표현은 직접 삭제되지 않는다');
SELECT throws_ok($$SELECT public.save_expression_result('cc300000-0000-4000-8000-000000000003','natural')$$,
 '42501',NULL,'AI 메시지에는 표현 확인 결과를 만들지 않는다');
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
SELECT is((SELECT count(*) FROM public.expressions),0::bigint,'다른 계정은 표현을 읽을 수 없다');
SELECT is((SELECT count(*) FROM public.episode_messages WHERE expression_status IS NOT NULL),0::bigint,'다른 계정은 판정을 읽을 수 없다');
SELECT throws_ok($$SELECT public.save_expression_result('cc300000-0000-4000-8000-000000000004','natural')$$,
 '42501',NULL,'다른 계정의 메시지에는 결과를 쓸 수 없다');
SET LOCAL ROLE anon;
SELECT throws_ok($$SELECT public.save_expression_result('cc300000-0000-4000-8000-000000000001','natural')$$,
 '42501',NULL,'로그인하지 않은 요청은 표현 결과를 만들 수 없다');
RESET ROLE;
DELETE FROM public.episode_messages WHERE id='cc300000-0000-4000-8000-000000000001';
SELECT is((SELECT count(*) FROM public.episode_messages WHERE id='cc300000-0000-4000-8000-000000000001'),0::bigint,
 '메시지와 판정은 함께 삭제된다');
SET CONSTRAINTS ALL IMMEDIATE;
SELECT * FROM finish();
ROLLBACK;
