begin;
select plan(1);
select has_table('public', 'utterance_meanings', '대사 뜻을 메시지와 함께 남긴다');
select * from finish();
rollback;
