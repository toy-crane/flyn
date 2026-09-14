-- 새 기록 방식이 적용되기 전에 이미 말하고 끝낸 사실을 보존한다.
-- 다시 실행해도 원본 ID별로 한 번만 기록한다.
insert into public.learning_events (kind, source_id, user_id, occurred_at)
select 'english_message', message.id, message.user_id, message.created_at
from public.episode_messages message
cross join lateral (
  select string_agg(part->>'text', ' ') as spoken
  from jsonb_array_elements(message.parts) part
  where part->>'type' = 'text'
) body
where message.role = 'user'
  and body.spoken ~ '[A-Za-z]'
  and body.spoken !~ '[가-힣ㄱ-ㅎㅏ-ㅣ]'
on conflict do nothing;

insert into public.learning_events (kind, source_id, user_id, occurred_at)
select 'episode_completed', played.id, played.user_id, played.finished_at
from public.episode_plays played
where played.finished_at is not null
on conflict do nothing;
