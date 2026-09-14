begin;
select plan(8);

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
  'assistant, Korean, and unclassified English messages do not become English study facts');
select results_eq(
  'select id, user_id, role, parts, expression_status, created_at from public.episode_messages order by id',
  'select id, user_id, role, parts, expression_status, created_at from ci_learning_upgrade.messages order by id',
  'backfill does not alter original messages'
);
select results_eq(
  'select id, user_id, finished_at from public.episode_plays where finished_at is not null order by id',
  'select id, user_id, finished_at from ci_learning_upgrade.completed order by id',
  'backfill does not alter completed episodes'
);

delete from public.story_plays where id = 'b1111111-1111-4111-8111-111111111111';
select is((select count(*) from public.learning_events), 3::bigint,
  'deleting a run preserves prior facts and its pending English message');
select results_eq(
  $$select source_id, user_id, occurred_at from public.learning_events
    where kind = 'english_message'
      and source_id = 'd4444444-4444-4444-8444-444444444444'$$,
  $$select id, user_id, created_at from ci_learning_upgrade.messages
    where id = 'd4444444-4444-4444-8444-444444444444'$$,
  'the pending English message keeps its original speaker and time'
);
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
