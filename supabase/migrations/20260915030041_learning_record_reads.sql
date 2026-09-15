-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.learning_days (
  zone      text,
  first_day date,
  last_day  date
)
  RETURNS TABLE (
    day              date,
    english_messages integer
  )
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select (e.occurred_at at time zone zone)::date as day, count(*)::integer
  from public.learning_events e
  where e.user_id = (select auth.uid())
    and e.kind = 'english_message'
    and e.occurred_at >= (first_day::timestamp at time zone zone)
    and e.occurred_at < ((last_day + 1)::timestamp at time zone zone)
  group by 1
  order by 1;
$function$;

COMMENT ON FUNCTION public.learning_days(text,date,date) IS 'The caller''s English message count per device day between two dates, in the given time zone. Days without English are omitted.';

-- 운영 환경은 새 함수의 EXECUTE를 API 역할에 직접 준다. PUBLIC 회수로는 그
-- 권한이 사라지지 않아 세 역할을 함께 회수한다.
REVOKE ALL ON FUNCTION public.learning_days(text, date, date) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.learning_days(text, date, date) TO authenticated;

CREATE FUNCTION public.learning_streak (
  zone  text,
  today date
)
  RETURNS TABLE (
    streak    integer,
    first_day date
  )
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  with completed_days as (
    select distinct (e.occurred_at at time zone zone)::date as day
    from public.learning_events e
    where e.user_id = (select auth.uid())
      and e.kind = 'episode_completed'
      and e.occurred_at < ((today + 1)::timestamp at time zone zone)
  ),
  runs as (
    -- 하루씩 거슬러 이어진 날은 날짜와 순번의 합이 같다.
    select day, day + (row_number() over (order by day desc))::integer as run
    from completed_days
  ),
  latest as (
    select max(day) as last_day, count(*)::integer as days
    from runs
    group by run
    order by last_day desc
    limit 1
  )
  select
    coalesce((select days from latest where last_day >= today - 1), 0),
    (
      select (min(e.occurred_at) at time zone zone)::date
      from public.learning_events e
      where e.user_id = (select auth.uid())
    );
$function$;

COMMENT ON FUNCTION public.learning_streak(text,date) IS 'The caller''s consecutive days with a finished episode through the device''s today, and their first study day, both in the given time zone.';

REVOKE ALL ON FUNCTION public.learning_streak(text, date) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.learning_streak(text, date) TO authenticated;