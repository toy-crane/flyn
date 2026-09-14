BEGIN;
SELECT plan(9);
SELECT results_eq(
 'SELECT id,user_id,episode_id,message_id,text,meaning,original,speaker,dialogue_index,saved_at FROM public.expressions WHERE saved_at IS NOT NULL ORDER BY id',
 'SELECT id,user_id,episode_id,message_id,english,meaning,original,speaker,utterance_at,created_at FROM ci_expression_transfer.notes ORDER BY id',
 '노트의 ID와 내용, 출처, 담은 시각을 모두 보존한다');
SELECT results_eq(
 $$SELECT m.id,m.episode_play_id,m.role,m.parts,m.created_at FROM public.episode_messages m ORDER BY m.id$$,
 $$SELECT m.id,m.play_id,m.role,m.parts,m.created_at FROM ci_expression_transfer.messages m ORDER BY m.id$$,
 '대화 묶음과 순서와 시각을 보존한다');
SELECT results_eq(
 'SELECT episode_id,character_id,story_id,position FROM public.episode_characters ORDER BY episode_id,position',
 'SELECT episode_id,character_id,story_id,at FROM ci_expression_transfer.characters ORDER BY episode_id,at',
 '인물 연결과 1부터 세는 순서를 보존한다');
SELECT results_eq(
 $$SELECT e.message_id,e.text,e.entries,e.situation,e.meaning,e.example,e.example_meaning FROM public.expressions e WHERE kind='correction' ORDER BY message_id$$,
 $$SELECT message_id,fixed,entries,situation,meaning,example,example_meaning FROM ci_expression_transfer.results WHERE status='corrected' ORDER BY message_id$$,
 '교정의 모든 필드와 pattern을 보존한다');
SELECT results_eq(
 $$SELECT id,expression_status FROM public.episode_messages WHERE role='user' ORDER BY id$$,
 $$SELECT message_id,CASE WHEN status='corrected' THEN 'provided' ELSE status END FROM ci_expression_transfer.results ORDER BY message_id$$,
 '카드 없는 완료 판정도 보존한다');
SELECT results_eq(
 $$SELECT e.message_id,e.dialogue_index,e.meaning FROM public.expressions e WHERE message_id='d1000000-0000-4000-8000-000000000001' ORDER BY dialogue_index$$,
 $$SELECT message_id,utterance_at,meaning FROM ci_expression_transfer.meanings ORDER BY utterance_at$$,
 '저장 여부와 관계없이 번역과 대사 위치를 보존한다');
SELECT results_eq(
 $$SELECT e.claim_token,e.expires_at FROM public.expressions e WHERE e.meaning IS NULL AND e.kind='dialogue'$$,
 $$SELECT claim_token,expires_at FROM ci_expression_transfer.meanings WHERE meaning IS NULL$$,
 '진행 중인 선점의 소유자와 만료 시각을 보존한다');
SELECT is((SELECT kind FROM public.expressions WHERE id='94444444-4444-4444-8444-444444444444'),
 'translation', '원본을 잃은 한국어 안내도 보존한다');
SELECT is((SELECT count(*) FROM information_schema.tables WHERE table_schema='public'
 AND table_name IN ('saved_expressions','utterance_meanings','episode_expression_results')),
 0::bigint, '통합 후 옛 테이블은 남지 않는다');
SELECT * FROM finish();
ROLLBACK;
