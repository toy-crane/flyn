begin;
select plan(7);

select results_eq(
  $$select kind, source_id, user_id, occurred_at from public.learning_events order by kind, source_id$$,
  $$select 'english_message'::text, id, user_id, created_at
    from ci_learning_upgrade.messages where role = 'user' and id = 'd2222222-2222-4222-8222-222222222222'
    union all
    select 'episode_completed'::text, id, user_id, finished_at from ci_learning_upgrade.completed
    order by 1, 2$$,
  'backfill keeps the exact source, owner, and time for English speech and completion'
);
select is((select count(*) from public.learning_events), 2::bigint,
  'assistant and Korean messages do not become English study facts');
select results_eq(
  'select id, user_id, role, parts, created_at from public.episode_messages order by id',
  'select id, user_id, role, parts, created_at from ci_learning_upgrade.messages order by id',
  'backfill does not alter original messages'
);
select results_eq(
  'select id, user_id, finished_at from public.episode_plays where finished_at is not null order by id',
  'select id, user_id, finished_at from ci_learning_upgrade.completed order by id',
  'backfill does not alter completed episodes'
);

delete from public.story_plays where id = 'b1111111-1111-4111-8111-111111111111';
select is((select count(*) from public.learning_events), 2::bigint,
  'deleting a run preserves both study facts');
select is((select count(*) from public.episode_messages), 0::bigint,
  'deleting a run removes its conversation');
select results_eq(
  $$select text, meaning, message_id is null, saved_at is not null
    from public.expressions where id = '91111111-1111-4111-8111-111111111111'$$,
  $$values ('Here is your coffee.'::text, '여기 커피 나왔어요.'::text, true, true)$$,
  'saved expression survives without a conversation source'
);

select * from finish();
rollback;
