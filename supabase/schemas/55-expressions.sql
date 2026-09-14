create trigger expressions_set_timestamps
  before insert or update on public.expressions
  for each row execute function public.set_row_timestamps();

-- 담은 시각은 노트 순서다. 같은 담기 요청으로 순서를 바꾸지 않는다.
create function public.stamp_expression_saved_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.saved_at is not null then
    if new.kind = 'dialogue' and new.meaning is null then
      raise exception 'A pending expression cannot be saved.' using errcode = '23514';
    end if;
    if tg_op = 'UPDATE' and old.saved_at is not null then
      new.saved_at := old.saved_at;
    else
      new.saved_at := clock_timestamp();
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.stamp_expression_saved_at() from public, anon, authenticated, service_role;
-- 시각 정규화가 공통 수정 시각 검사보다 먼저 실행돼야 중복 담기가 no-op이다.
create trigger expressions_01_stamp_saved_at before insert or update on public.expressions
  for each row execute function public.stamp_expression_saved_at();

-- FK가 원본 연결을 끊거나 노트에서 취소하면 수명이 끝난 표현만 정리한다.
create function public.remove_unsaved_orphan_expression()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- 삭제 이유: 2026-09-14 사용자가 원본과 저장 표시가 모두 없는 표현의 삭제를 승인했다.
  delete from public.expressions where id = new.id and message_id is null and saved_at is null;
  return null;
end;
$$;
revoke all on function public.remove_unsaved_orphan_expression() from public, anon, authenticated, service_role;
create trigger expressions_remove_unsaved_orphan after update on public.expressions
  for each row when (new.message_id is null and new.saved_at is null)
  execute function public.remove_unsaved_orphan_expression();

-- 계정과 에피소드가 모두 같은 출처인지 DB에서 확인한다.
create function public.check_expression_source()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.message_id is not null and not exists (
    select 1 from public.episode_messages m
    join public.episode_plays p on p.id = m.episode_play_id
    where m.id = new.message_id and m.user_id = new.user_id and p.episode_id = new.episode_id
      and m.role = case when new.kind = 'dialogue' then 'assistant' else 'user' end
  ) then
    raise exception 'Expression source does not match its owner, episode or kind.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.check_expression_source() from public, anon, authenticated, service_role;
create trigger expressions_check_source before insert or update of message_id, user_id, episode_id, kind on public.expressions
  for each row execute function public.check_expression_source();

-- 선점과 완료는 원본 메시지부터 잠근다. 삭제와 경쟁해도 원본을 되살리지 않는다.
create function public.claim_dialogue_expression(
  p_message_id uuid, p_dialogue_index integer, p_speaker text, p_text text, p_token uuid
)
returns setof public.expressions language plpgsql security definer set search_path = '' as $$
declare
  source_episode uuid;
begin
  select p.episode_id into source_episode from public.episode_messages m
  join public.episode_plays p on p.id = m.episode_play_id
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'assistant'
  for update of m;
  if not found then
    raise exception 'The dialogue source is unavailable.' using errcode = '42501';
  end if;
  insert into public.expressions(user_id, episode_id, message_id, kind, dialogue_index, speaker, text, claim_token, expires_at)
  values (auth.uid(), source_episode, p_message_id, 'dialogue', p_dialogue_index, p_speaker, p_text, p_token, clock_timestamp() + interval '30 seconds')
  on conflict (message_id, coalesce(dialogue_index, -1)) where message_id is not null
  do update set claim_token = excluded.claim_token, expires_at = excluded.expires_at
  where public.expressions.meaning is null and public.expressions.expires_at <= clock_timestamp();
  return query select * from public.expressions e
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index and e.user_id = auth.uid();
end;
$$;
revoke all on function public.claim_dialogue_expression(uuid, integer, text, text, uuid) from public, anon, authenticated, service_role;
grant execute on function public.claim_dialogue_expression(uuid, integer, text, text, uuid) to authenticated;

create function public.complete_dialogue_expression(
  p_message_id uuid, p_dialogue_index integer, p_token uuid, p_meaning text
)
returns setof public.expressions language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.episode_messages m
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'assistant' for update;
  if not found then
    raise exception 'The dialogue source is unavailable.' using errcode = '42501';
  end if;
  update public.expressions e set meaning = btrim(p_meaning), claim_token = null, expires_at = null
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index and e.user_id = auth.uid()
    and e.claim_token = p_token and e.expires_at > clock_timestamp() and e.meaning is null;
  return query select * from public.expressions e
  where e.message_id = p_message_id and e.dialogue_index = p_dialogue_index
    and e.user_id = auth.uid() and e.meaning is not null;
  if not found then
    raise exception 'The expression claim expired or was replaced.' using errcode = '55000';
  end if;
end;
$$;
revoke all on function public.complete_dialogue_expression(uuid, integer, uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.complete_dialogue_expression(uuid, integer, uuid, text) to authenticated;

-- 완료 판정과 표현을 한 트랜잭션에 남긴다. 먼저 확정한 결과를 덮어쓰지 않는다.
create function public.save_expression_result(p_message_id uuid, p_status text, p_content jsonb default null)
returns text language plpgsql security definer set search_path = '' as $$
declare
  source_message public.episode_messages;
  source_episode uuid;
  source_original text;
begin
  select * into source_message from public.episode_messages m
  where m.id = p_message_id and m.user_id = auth.uid() and m.role = 'user' for update;
  if not found then
    raise exception 'The user message is unavailable.' using errcode = '42501';
  end if;
  if source_message.expression_status is not null then
    return source_message.expression_status;
  end if;
  if p_status is null or p_status not in ('provided', 'natural', 'unclear') then
    raise exception 'Unknown expression status.' using errcode = '23514';
  end if;
  if p_status = 'provided' then
    select episode_id into source_episode from public.episode_plays where id = source_message.episode_play_id;
    select btrim(string_agg(part ->> 'text', '' order by n)) into source_original
    from jsonb_array_elements(source_message.parts) with ordinality as parts(part, n)
    where part ->> 'type' = 'text';
    insert into public.expressions(user_id, episode_id, message_id, kind, text, meaning, original, entries, situation, example, example_meaning)
    values (auth.uid(), source_episode, p_message_id,
      case when source_original ~ '[가-힣ㄱ-ㅎㅏ-ㅣ]' then 'translation' else 'correction' end,
      p_content ->> 'text', p_content ->> 'meaning', source_original, p_content -> 'entries',
      p_content ->> 'situation', p_content ->> 'example', p_content ->> 'exampleMeaning');
  elsif p_content is not null then
    raise exception 'A result without an expression cannot carry content.' using errcode = '23514';
  end if;
  update public.episode_messages set expression_status = p_status where id = p_message_id;
  return p_status;
end;
$$;
revoke all on function public.save_expression_result(uuid, text, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.save_expression_result(uuid, text, jsonb) to authenticated;

-- 관리자 쓰기에서도 판정과 표현의 짝이 어긋나지 않도록 커밋 전에 확인한다.
create function public.check_message_expression_result()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid;
  status text;
  total integer;
begin
  if tg_table_name = 'episode_messages' then
    target_id := new.id;
  elsif tg_op = 'DELETE' then
    target_id := old.message_id;
  else
    target_id := new.message_id;
  end if;
  select expression_status into status from public.episode_messages where id = target_id;
  if not found then return null; end if;
  select count(*) into total from public.expressions where message_id = target_id and kind <> 'dialogue';
  if (status = 'provided') is distinct from (total = 1) and not (status is null and total = 0) then
    raise exception 'Expression status and content must be committed together.' using errcode = '23514';
  end if;
  return null;
end;
$$;
revoke all on function public.check_message_expression_result() from public, anon, authenticated, service_role;
create constraint trigger episode_messages_check_expression_result
  after insert or update on public.episode_messages deferrable initially deferred
  for each row execute function public.check_message_expression_result();
create constraint trigger expressions_check_message_result
  after insert or update or delete on public.expressions deferrable initially deferred
  for each row execute function public.check_message_expression_result();
