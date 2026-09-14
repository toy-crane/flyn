BEGIN;
SELECT plan(1);
SELECT hasnt_table('public', 'utterance_meanings', '대사 뜻을 별도 테이블에 중복 저장하지 않는다');
SELECT * FROM finish();
ROLLBACK;
