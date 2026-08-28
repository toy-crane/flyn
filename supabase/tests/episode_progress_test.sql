-- 플레이 기록은 스토리·화 번호가 아니라 안정된 에피소드 id를 참조한다.
BEGIN;
SELECT plan(57);

INSERT INTO auth.users (id, email)
VALUES
  ('33333333-3333-4333-8333-333333333333', 'story-progress@example.test'),
  ('55555555-5555-4555-8555-555555555555', 'other-progress@example.test');

SELECT has_column(
  'public',
  'episode_endings',
  'episode_id',
  'an ending references an episode id'
);

SELECT col_is_pk(
  'public',
  'episode_endings',
  array['user_id', 'episode_id'],
  'an account holds at most one ending per episode'
);

SELECT hasnt_column(
  'public',
  'episode_endings',
  'season',
  'season numbers are not progress keys'
);

SELECT hasnt_column(
  'public',
  'episode_endings',
  'episode',
  'episode numbers are not progress keys'
);

SELECT function_privs_are(
  'public',
  'finish_episode',
  array['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can finish an episode by id'
);

SELECT function_returns(
  'public',
  'finish_episode',
  array['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'boolean',
  'finishing reports whether this request recorded the permanent ending'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

SELECT is(
  (
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공',
      '새 아이스 아메리카노를 받아냈다.'
    )
  ),
  true,
  'the first episode in a story can finish'
);

SELECT is(
  (
    select kind
    from public.episode_endings
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  '성공',
  'the ending is stored against the episode id'
);

SELECT throws_ok(
  $$
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000003'::uuid,
      '성공',
      '앞 화를 건너뛰었다.'
    )
  $$,
  '22023',
  null,
  'an episode cannot finish before every earlier episode in its story'
);

SELECT is(
  (
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패',
      '나중에 도착한 다른 결말.'
    )
  ),
  false,
  'a later ending learns that another request already closed the episode'
);

SELECT is(
  (
    select kind
    from public.episode_endings
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  '성공',
  'a repeated ending never overwrites the first one'
);

RESET ROLE;

SELECT has_table(
  'public',
  'episode_runs',
  'public.episode_runs stores active and completed conversations'
);

SELECT has_column(
  'public',
  'episode_runs',
  'completed_by_fallback',
  'a completed run remembers whether the client fallback finished first'
);

SELECT col_is_pk(
  'public',
  'episode_runs',
  array['user_id', 'episode_id'],
  'an account keeps one conversation per episode'
);

SELECT ok(
  (
    select relrowsecurity
    from pg_class
    where oid = to_regclass('public.episode_runs')
  ),
  'row level security is enabled on episode_runs'
);

SELECT policies_are(
  'public',
  'episode_runs',
  array['episode_runs_select_own'],
  'episode_runs carries only the owner read policy'
);

SELECT table_privs_are(
  'public',
  'episode_runs',
  'authenticated',
  array['SELECT'],
  'authenticated can read only their own episode runs'
);

SELECT table_privs_are(
  'public',
  'episode_runs',
  'anon',
  array[]::text[],
  'anon holds no privilege on episode runs'
);

SELECT function_privs_are(
  'public',
  'save_episode_run',
  array['uuid', 'jsonb']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can save its current scene'
);

SELECT function_privs_are(
  'public',
  'save_episode_run_fallback',
  array['uuid', 'jsonb']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can save the scene visible when stopping'
);

SELECT throws_ok(
  $$
    select public.complete_episode_run(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '[{"id":"wrong-ending","role":"assistant","parts":[{"type":"data-ending","data":{"kind":"실패","outcome":"다른 기기에서 뒤늦게 닫았다."}}]}]'::jsonb
    )
  $$,
  '22023',
  null,
  'a transcript cannot disagree with the permanent ending'
);

SELECT function_privs_are(
  'public',
  'save_episode_run',
  array['uuid', 'jsonb']::name[],
  'anon',
  array[]::text[],
  'anon cannot save an episode scene'
);

SELECT function_privs_are(
  'public',
  'save_episode_run_fallback',
  array['uuid', 'jsonb']::name[],
  'anon',
  array[]::text[],
  'anon cannot save a stopped episode scene'
);

SELECT function_privs_are(
  'public',
  'complete_episode_run',
  array['uuid', 'jsonb']::name[],
  'anon',
  array[]::text[],
  'anon cannot complete an episode scene'
);

SELECT function_privs_are(
  'public',
  'complete_episode_run_fallback',
  array['uuid', 'jsonb']::name[],
  'anon',
  array[]::text[],
  'anon cannot complete a stopped episode scene'
);

SET LOCAL ROLE anon;

SELECT throws_ok(
  $$select * from public.episode_runs$$,
  '42501',
  null,
  'anon cannot read episode runs'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

SELECT lives_ok(
  $$
    select public.save_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Mia가 카드를 다시 본다."}]}]'::jsonb
    )
  $$,
  'the current episode scene is saved'
);

SELECT is(
  (
    select messages #>> '{0,id}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'opening-2',
  'the saved scene keeps its message ids'
);

SELECT lives_ok(
  $$
    select public.save_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","state":"done","text":"Mia가 카드를 다시 본다. Please wait."}]}]'::jsonb
    )
  $$,
  'the server can finish a longer version before the stop fallback arrives'
);

SELECT lives_ok(
  $$
    select public.save_episode_run_fallback(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","state":"streaming","text":"Mia가 카드를 다시 본다."}]}]'::jsonb
    )
  $$,
  'a throttled stop snapshot can arrive after the longer server save'
);

SELECT is(
  (
    select messages #>> '{0,parts,0,text}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'Mia가 카드를 다시 본다. Please wait.',
  'the shorter snapshot never rolls the same message back'
);

SELECT lives_ok(
  $$
    select public.save_episode_run_fallback(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]}]'::jsonb
    )
  $$,
  'a stopped branch with different text can replace the old branch'
);

SELECT is(
  (
    select messages #>> '{0,parts,0,text}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'Noah가 다른 쪽을 본다.',
  'the fallback distinguishes a branch even when its message id is reused'
);

SELECT lives_ok(
  $$
    select public.save_episode_run_fallback(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]},{"id":"user-2","role":"user","parts":[{"type":"text","text":"Can you help?"}]}]'::jsonb
    )
  $$,
  'a stopped scene with a new message can move the run forward'
);

SELECT is(
  (
    select messages #>> '{1,id}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'user-2',
  'the fallback keeps a newly visible message id'
);

SELECT throws_ok(
  $$insert into public.episode_runs (user_id, episode_id, messages)
    values (
      '33333333-3333-4333-8333-333333333333',
      '11000000-0000-4000-8000-000000000002',
      '[]'::jsonb
    )$$,
  '42501',
  null,
  'a signed-in account cannot insert a run directly'
);

SELECT throws_ok(
  $$delete from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'$$,
  '42501',
  null,
  'a signed-in account cannot delete a run directly'
);

SELECT throws_ok(
  $$truncate public.episode_runs$$,
  '42501',
  null,
  'a signed-in account cannot truncate episode runs'
);

SELECT throws_ok(
  $$
    select public.save_episode_run(
      '11000000-0000-4000-8000-000000000003'::uuid,
      '[]'::jsonb
    )
  $$,
  '22023',
  null,
  'a future episode cannot acquire a saved scene'
);

RESET ROLE;

SELECT function_privs_are(
  'public',
  'complete_episode_run',
  array['uuid', 'jsonb']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can complete a saved scene after its ending exists'
);

SELECT function_privs_are(
  'public',
  'complete_episode_run_fallback',
  array['uuid', 'jsonb']::name[],
  'authenticated',
  array['EXECUTE'],
  'a signed-in account can complete the scene visible when stopping'
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

SELECT lives_ok(
  $$
    select public.complete_episode_run(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '[{"id":"opening-1","role":"assistant","parts":[{"type":"text","text":"Mia가 새 잔을 내민다."}]},{"id":"ending-1","role":"assistant","parts":[{"type":"data-ending","data":{"kind":"성공","outcome":"새 아이스 아메리카노를 받아냈다."}}]}]'::jsonb
    )
  $$,
  'an ended episode becomes a completed conversation'
);

SELECT ok(
  (
    select completed_at is not null
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  'a completed conversation is marked complete'
);

SELECT is(
  (
    select messages #>> '{1,id}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  'ending-1',
  'the completed conversation keeps the ending message'
);

SELECT lives_ok(
  $$
    select public.save_episode_run(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '[]'::jsonb
    )
  $$,
  'a stale active save after completion raises no error'
);

SELECT is(
  (
    select messages #>> '{1,id}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000001'
  ),
  'ending-1',
  'a stale active save cannot overwrite a completed conversation'
);

SELECT throws_ok(
  $$
    select public.complete_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[]'::jsonb
    )
  $$,
  '22023',
  null,
  'a conversation cannot complete before its ending exists'
);

SELECT lives_ok(
  $$
    select public.save_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]},{"id":"user-2","role":"user","parts":[{"type":"text","text":"Can you help?"}]}]'::jsonb
    )
  $$,
  'the request messages are saved before the model writes its ending'
);

SELECT is(
  (
    select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '타협',
      '다른 단말기로 계산했다.'
    )
  ),
  true,
  'the second episode ending is recorded before its transcript completes'
);

SELECT lives_ok(
  $$
    select public.complete_episode_run_fallback(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]},{"id":"user-2","role":"user","parts":[{"type":"text","text":"Can you help?"}]},{"id":"ending-2","role":"assistant","parts":[{"type":"text","text":"He brings another terminal."},{"type":"data-ending","data":{"kind":"타협","outcome":"다른 단말기로 계산했다."}}]}]'::jsonb
    )
  $$,
  'a stopped ending can complete after only its request messages were saved'
);

SELECT ok(
  (
    select completed_by_fallback
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'the stopped ending is marked as a fallback completion'
);

SELECT lives_ok(
  $$
    select public.complete_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]},{"id":"user-2","role":"user","parts":[{"type":"text","text":"Can you help?"}]},{"id":"ending-2","role":"assistant","parts":[{"type":"text","text":"A different terminal."},{"type":"data-ending","data":{"kind":"타협","outcome":"다른 단말기로 계산했다."}}]}]'::jsonb
    )
  $$,
  'a divergent normal completion cannot replace the stopped branch'
);

SELECT is(
  (
    select messages #>> '{2,parts,0,text}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'He brings another terminal.',
  'the fallback transcript survives an incompatible normal completion'
);

SELECT lives_ok(
  $$
    select public.complete_episode_run(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '[{"id":"opening-2","role":"assistant","parts":[{"type":"text","text":"Noah가 다른 쪽을 본다."}]},{"id":"user-2","role":"user","parts":[{"type":"text","text":"Can you help?"}]},{"id":"ending-2","role":"assistant","parts":[{"type":"text","text":"He brings another terminal."},{"type":"data-ending","data":{"kind":"타협","outcome":"다른 단말기로 계산했다."}},{"type":"data-next-up","data":{"episodeId":"11000000-0000-4000-8000-000000000003"}}]}]'::jsonb
    )
  $$,
  'the longer compatible server transcript can upgrade the fallback completion'
);

SELECT is(
  (
    select messages #>> '{2,parts,2,type}'
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'data-next-up',
  'normal completion restores the longer compatible server transcript'
);

SELECT ok(
  (
    select not completed_by_fallback
    from public.episode_runs
    where episode_id = '11000000-0000-4000-8000-000000000002'
  ),
  'the upgraded transcript becomes the immutable normal completion'
);

SET LOCAL request.jwt.claims TO
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}';

SELECT is(
  (select count(*) from public.episode_runs),
  0::bigint,
  'another account sees none of the saved or completed scenes'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
