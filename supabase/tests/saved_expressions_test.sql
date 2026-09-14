-- 손으로 담아 둔 표현의 접근 규칙을 확인한다. 자기 것만 읽고 지우며, 종류마다
-- 담을 수 있는 메시지의 역할이 다르고, 원본이 사라져도 항목은 남는다.
BEGIN;
SELECT no_plan();

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'saved-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'saved-b@example.test');

-- 준비는 소유자 권한으로 한다. 회차와 플레이와 메시지를 만드는 규칙은 각자의
-- 테스트가 확인하므로, 여기서는 그 위에 담기는 행만 본다. seed의 스토리와 화는
-- DB가 만든 ID를 가지므로 slug와 화 번호로 찾는다.
INSERT INTO public.story_plays (id, user_id, story_id)
VALUES
  (
    'a0000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    (select id from public.stories where slug = 'mia-cafe')
  ),
  (
    'b0000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    (select id from public.stories where slug = 'mia-cafe')
  );

-- 1화는 결말이 났고 2화는 열려 있다. 끝난 화에서도 담을 수 있어야 하므로 둘 다
-- 필요하다.
INSERT INTO public.episode_plays (
  id, user_id, story_play_id, episode_id, ending_kind, ending_outcome, finished_at
)
VALUES (
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'a0000000-0000-4000-8000-000000000001',
  (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1),
  '성공', '새 아이스 아메리카노를 받아냈다.', now()
);

INSERT INTO public.episode_plays (id, user_id, story_play_id, episode_id)
VALUES
  (
    'aa000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'a0000000-0000-4000-8000-000000000001',
    (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 2)
  ),
  (
    'bb000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'b0000000-0000-4000-8000-000000000001',
    (select e.id from public.episodes e join public.stories s on s.id = e.story_id where s.slug = 'mia-cafe' and e.number = 1)
  );

-- 끝난 1화의 장면 하나와 사용자 메시지 하나.
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES
  (
    'cc000000-0000-4000-8000-000000000001',
    'aa000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'assistant',
    '[{"type":"data-speaker","data":{"name":"미아"}},{"type":"text","text":"Next in line, please!"}]'::jsonb
  ),
  (
    'cc000000-0000-4000-8000-000000000002',
    'aa000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'user',
    '[{"type":"text","text":"I order hot americano but this is ice latte."}]'::jsonb
  );

-- 열려 있는 2화의 장면 하나. 화가 어긋난 저장을 막는지 보는 데 쓴다.
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000003',
  'aa000000-0000-4000-8000-000000000002',
  '11111111-1111-4111-8111-111111111111',
  'assistant',
  '[{"type":"data-speaker","data":{"name":"미아"}},{"type":"text","text":"Here you go."}]'::jsonb
);

-- 판정을 받지 않은 사용자 메시지 하나. 배울 표현이 없는 자리를 보는 데 쓴다.
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000004',
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'user',
  '[{"type":"text","text":"Thank you."}]'::jsonb
);

-- 문제없다고 판정받은 사용자 메시지 하나. 판정은 받았지만 고친 문장이 없으므로
-- 담을 배울 표현이 없는 자리를 보는 데 쓴다.
INSERT INTO public.episode_messages (id, episode_play_id, user_id, role, parts)
VALUES (
  'cc000000-0000-4000-8000-000000000005',
  'aa000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  'user',
  '[{"type":"text","text":"Thank you very much."}]'::jsonb
);

SELECT has_table('public','expressions','표현은 하나의 테이블에 있다');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid='public.expressions'::regclass),'표현에 RLS가 켜져 있다');
SELECT col_is_fk('public','expressions',ARRAY['episode_id'],'표현은 원래 에피소드를 가리킨다');
SELECT is((SELECT confdeltype FROM pg_constraint WHERE conrelid='public.expressions'::regclass AND confrelid='public.episode_messages'::regclass),
 'n'::"char",'원본 삭제는 메시지 연결을 끊는다');
SELECT ok(NOT has_table_privilege('authenticated','public.expressions','INSERT'),'앱은 표현을 직접 추가하지 않는다');
SELECT ok(has_column_privilege('authenticated','public.expressions','saved_at','UPDATE'),'앱은 담은 표시를 바꾼다');
SELECT ok(NOT has_column_privilege('authenticated','public.expressions','text','UPDATE'),'앱은 표현 내용을 바꾸지 않는다');
SELECT ok(NOT has_table_privilege('anon','public.expressions','SELECT'),'로그인 없이 표현을 읽지 못한다');
SELECT throws_ok($$INSERT INTO public.expressions(user_id,episode_id,kind,text,speaker,dialogue_index)
 SELECT '11111111-1111-4111-8111-111111111111',id,'dialogue','Hello!','Mia',0 FROM public.episodes LIMIT 1$$,
 '23514',NULL,'뜻도 선점도 없는 표현은 만들지 않는다');
SELECT throws_ok($$INSERT INTO public.expressions(user_id,episode_id,message_id,kind,text,speaker,dialogue_index,meaning)
 SELECT '11111111-1111-4111-8111-111111111111',e.id,'cc000000-0000-4000-8000-000000000003','dialogue','Here you go.','미아',0,'여기 있어요.'
 FROM public.episodes e JOIN public.stories s ON s.id=e.story_id WHERE s.slug='mia-cafe' AND e.number=1$$,
 '23514',NULL,'원본과 다른 에피소드를 연결하지 못한다');
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
SELECT lives_ok($$SELECT public.claim_dialogue_expression('cc000000-0000-4000-8000-000000000001',0,'미아','Next in line, please!','ee000000-0000-4000-8000-000000000001')$$,
 '끝난 화에서도 번역을 만든다');
SELECT throws_ok($$UPDATE public.expressions SET saved_at=clock_timestamp()$$,'23514',NULL,'생성 중인 표현은 담지 못한다');
SELECT public.complete_dialogue_expression('cc000000-0000-4000-8000-000000000001',0,'ee000000-0000-4000-8000-000000000001','다음 분이요!');
SELECT public.claim_dialogue_expression('cc000000-0000-4000-8000-000000000003',0,'미아','Here you go.','ee000000-0000-4000-8000-000000000002');
SELECT public.complete_dialogue_expression('cc000000-0000-4000-8000-000000000003',0,'ee000000-0000-4000-8000-000000000002','여기 있어요.');
SELECT lives_ok($$UPDATE public.expressions SET saved_at=clock_timestamp()$$,'끝난 화와 진행 중인 화의 표현을 담는다');
SELECT is((SELECT count(*) FROM public.expressions WHERE saved_at IS NOT NULL),2::bigint,'다른 메시지의 같은 대사 위치는 각각 담긴다');
SELECT is((SELECT count(*) FROM public.expressions WHERE user_id='11111111-1111-4111-8111-111111111111'),2::bigint,'DB가 표현의 주인을 정한다');
SELECT throws_ok($$SELECT public.claim_dialogue_expression('cc000000-0000-4000-8000-000000000002',0,'미아','Made up','ee000000-0000-4000-8000-000000000003')$$,
 '42501',NULL,'사용자 메시지는 인물 대사가 될 수 없다');
SELECT public.save_expression_result('cc000000-0000-4000-8000-000000000005','natural');
SELECT is((SELECT count(*) FROM public.expressions WHERE message_id IN ('cc000000-0000-4000-8000-000000000004','cc000000-0000-4000-8000-000000000005')),
 0::bigint,'미확인 메시지와 자연스러운 메시지에는 담을 표현이 없다');
SELECT throws_ok($$INSERT INTO public.expressions(kind,text,meaning) VALUES ('correction','Made up','지어낸 표현')$$,
 '42501',NULL,'판정 없이 표현을 직접 만들어 담지 못한다');
SELECT throws_ok($$UPDATE public.expressions SET text='rewritten'$$,'42501',NULL,'담은 표현의 내용은 고치지 못한다');
SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.expressions),0::bigint,'다른 계정은 표현을 읽지 못한다');
SELECT lives_ok($$UPDATE public.expressions SET saved_at=NULL$$,'다른 계정의 담기를 취소하는 요청은 행을 찾지 못한다');
SELECT throws_ok($$SELECT public.claim_dialogue_expression('cc000000-0000-4000-8000-000000000001',0,'미아','Next in line, please!','ee000000-0000-4000-8000-000000000004')$$,
 '42501',NULL,'다른 계정의 메시지를 출처로 삼지 못한다');
RESET ROLE;
SELECT is((SELECT count(*) FROM public.expressions WHERE saved_at IS NOT NULL),2::bigint,'다른 계정의 취소는 담은 표현을 바꾸지 않는다');
DELETE FROM public.episode_messages WHERE id IN ('cc000000-0000-4000-8000-000000000001','cc000000-0000-4000-8000-000000000003');
SELECT is((SELECT count(*) FROM public.expressions WHERE message_id IS NULL AND dialogue_index=0),2::bigint,'같은 위치의 두 고아 표현은 충돌하지 않는다');
SELECT is((SELECT count(DISTINCT episode_id) FROM public.expressions),2::bigint,'원본을 잃어도 에피소드 출처는 유지한다');
SELECT is((SELECT text FROM public.expressions WHERE meaning='다음 분이요!'),'Next in line, please!','원본 삭제 뒤에도 영어와 뜻이 남는다');
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
SELECT lives_ok($$UPDATE public.expressions SET saved_at=NULL WHERE meaning='다음 분이요!'$$,'주인은 원본 없는 표현을 취소할 수 있다');
SELECT is((SELECT count(*) FROM public.expressions),1::bigint,'원본 없는 표현은 취소와 함께 삭제된다');
RESET ROLE;
DELETE FROM auth.users WHERE id='11111111-1111-4111-8111-111111111111';
SELECT is((SELECT count(*) FROM public.expressions),0::bigint,'계정 삭제는 저장한 표현도 함께 지운다');
SET CONSTRAINTS ALL IMMEDIATE;
SELECT * FROM finish();
ROLLBACK;
