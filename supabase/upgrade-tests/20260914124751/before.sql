-- 새 기록 트리거가 도입되기 전의 대화와 완료를 재현한다.
insert into auth.users (id, email)
values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'learning-upgrade@example.test');

insert into public.stories
  (id, position, slug, title, hook, intro, target_language, completion_title, completion_copy)
values (
  'e1111111-1111-4111-8111-111111111111', 9999, 'ci-learning-event',
  'Learning history', 'A short hook', 'A short introduction', 'en', 'Done', 'Done today'
);

insert into public.episodes
  (id, story_id, number, title, preview, situation, situation_emoji, opening, stage,
   ending_success, ending_compromise, ending_failure)
values (
  'a1111111-1111-4111-8111-111111111111',
  'e1111111-1111-4111-8111-111111111111', 1, 'First', 'Preview', 'Situation', '☕',
  'Opening', 'Stage', 'Success', 'Compromise', 'Failure'
);

insert into public.story_plays (id, user_id, story_id, started_at)
values
  ('b1111111-1111-4111-8111-111111111111', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   'e1111111-1111-4111-8111-111111111111', '2026-01-01 00:00:00+00'),
  ('b2222222-2222-4222-8222-222222222222', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   'e1111111-1111-4111-8111-111111111111', '2026-02-01 00:00:00+00');

insert into public.episode_plays
  (id, user_id, story_play_id, episode_id, started_at, finished_at, ending_kind, ending_outcome)
values (
  'f1111111-1111-4111-8111-111111111111',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'b1111111-1111-4111-8111-111111111111',
  'a1111111-1111-4111-8111-111111111111',
  '2026-01-01 00:00:00+00', '2026-01-01 00:12:00+00', '성공', '커피를 받았다'
);

insert into public.episode_messages (id, episode_play_id, user_id, role, parts)
values
  ('d1111111-1111-4111-8111-111111111111', 'f1111111-1111-4111-8111-111111111111',
   'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'assistant',
   '[{"type":"text","text":"Here is your coffee."}]'::jsonb),
  ('d2222222-2222-4222-8222-222222222222', 'f1111111-1111-4111-8111-111111111111',
   'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'user',
   '[{"type":"text","text":"May I have a coffee?"}]'::jsonb),
  ('d3333333-3333-4333-8333-333333333333', 'f1111111-1111-4111-8111-111111111111',
   'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'user',
   '[{"type":"text","text":"커피 한 잔 주세요"}]'::jsonb);

-- 앞선 스키마 마이그레이션이 만든 트리거의 결과만 지워 과거 행을 재현한다.
delete from public.learning_events;

insert into public.expressions
  (id, user_id, episode_id, message_id, kind, dialogue_index, text, meaning, speaker, saved_at)
values (
  '91111111-1111-4111-8111-111111111111',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'a1111111-1111-4111-8111-111111111111',
  'd1111111-1111-4111-8111-111111111111',
  'dialogue', 0, 'Here is your coffee.', '여기 커피 나왔어요.', 'Mia', now()
);

create schema ci_learning_upgrade;
create table ci_learning_upgrade.messages as
  select id, user_id, role, parts, created_at from public.episode_messages;
create table ci_learning_upgrade.completed as
  select id, user_id, finished_at from public.episode_plays where finished_at is not null;
