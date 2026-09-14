-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE OR REPLACE FUNCTION public.record_english_message()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  spoken text;
  message_row public.episode_messages%rowtype;
begin
  if tg_op = 'DELETE' then
    -- 계정 삭제의 연쇄 삭제 중에는 학습 사실을 새로 만들지 않는다.
    if not exists (select 1 from public.profiles where id = old.user_id) then
      return old;
    end if;
    message_row := old;
  else
    if new.expression_status is null then
      return new;
    end if;
    message_row := new;
  end if;

  if message_row.role <> 'user' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  select string_agg(part->>'text', ' ') into spoken
  from jsonb_array_elements(message_row.parts) part
  where part->>'type' = 'text';

  if spoken ~ '[A-Za-z]' and spoken !~ '[가-힣ㄱ-ㅎㅏ-ㅣ]' then
    insert into public.learning_events (kind, source_id, user_id, occurred_at)
    values (
      'english_message', message_row.id, message_row.user_id, message_row.created_at
    )
    on conflict do nothing;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

CREATE TRIGGER episode_messages_preserve_english
  BEFORE DELETE ON public.episode_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.record_english_message();