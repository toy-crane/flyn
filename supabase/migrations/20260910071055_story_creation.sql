SET check_function_bodies = false;
ALTER TABLE public.characters DROP CONSTRAINT characters_story_id_fkey;
ALTER TABLE public.episode_characters DROP CONSTRAINT episode_characters_character_fkey;
ALTER TABLE public.episode_plays DROP CONSTRAINT episode_plays_episode_id_fkey;
ALTER TABLE public.episodes DROP CONSTRAINT episodes_story_id_fkey;
ALTER TABLE public.saved_expressions DROP CONSTRAINT saved_expressions_episode_id_fkey;
ALTER TABLE public.story_plays DROP CONSTRAINT story_plays_story_id_fkey;
DROP POLICY characters_select_authenticated ON public.characters;
DROP POLICY episode_characters_select_authenticated ON public.episode_characters;
DROP POLICY episodes_select_authenticated ON public.episodes;
DROP POLICY stories_select_authenticated ON public.stories;
CREATE FUNCTION public.create_story(story jsonb)
 RETURNS TABLE(story_id uuid, first_episode_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  maker uuid := (select auth.uid());
  made_story_id uuid;
  chapters jsonb := create_story.story -> 'episodes';
  people jsonb := create_story.story -> 'characters';
begin
  if maker is null then
    raise exception 'A signed-in user is required to make a story.'
      using errcode = '28000';
  end if;

  -- 아래 insert들은 `jsonb_array_elements`로 배열을 편다. 그 함수는 배열이
  -- 아닌 값을 받으면 오류 없이 0행을 내므로, 화가 빠진 요청이 오면 스토리 행만
  -- 만들어지고 열 수 없는 스토리가 목록에 남는다. 스펙은 실패한 시도가 아무것도
  -- 남기지 않기를 요구하므로, 아무것도 넣기 전에 여기서 센다.
  --
  -- 이 함수는 `authenticated`가 PostgREST로 직접 부를 수 있다. API가 같은 것을
  -- 먼저 세지만 그 길을 건너뛴 요청도 여기서 걸린다.
  if jsonb_typeof(people) is distinct from 'array'
    or jsonb_array_length(people) not between 1 and 4
  then
    raise exception 'A story needs 1 to 4 characters.'
      using errcode = '22023';
  end if;

  if jsonb_typeof(chapters) is distinct from 'array'
    or jsonb_array_length(chapters) not between 1 and 5
  then
    raise exception 'A story needs 1 to 5 episodes.'
      using errcode = '22023';
  end if;

  -- 인물 자리는 이름표 색의 번호다. `unique (story_id, position)`이 문장 끝에
  -- 확인하는 제약이라, 겹친 번호는 함수가 값을 돌려준 뒤 커밋에서 터진다.
  -- 여기서 먼저 보면 무엇이 잘못됐는지가 오류에 드러난다.
  if (
    select count(distinct (person -> 'position')::int)
    from jsonb_array_elements(people) as person
    where jsonb_typeof(person -> 'position') = 'number'
      and (person -> 'position')::int
        between 1 and jsonb_array_length(people)
  ) <> jsonb_array_length(people)
  then
    raise exception 'Character positions must run from 1 without repeating.'
      using errcode = '22023';
  end if;

  -- 화의 인물 수는 `episode_characters.at`이 1..3으로 막지만, 옛 열
  -- `cast_names`는 20까지 받는다. 넷을 담은 화는 그 열을 지난 뒤 자리 번호에서
  -- 막혀 오류가 실제 규칙이 아닌 곳을 가리킨다. 여기서 먼저 센다.
  if exists (
    select 1
    from jsonb_array_elements(chapters) as chapter
    where jsonb_typeof(chapter -> 'castNames') is distinct from 'array'
      or jsonb_array_length(chapter -> 'castNames') not between 1 and 3
  ) then
    raise exception 'Every episode needs 1 to 3 characters.'
      using errcode = '22023';
  end if;

  insert into public.stories (
    owner_id,
    title,
    hook,
    intro,
    cover_emoji,
    -- 이 제품이 가르치는 언어. 만드는 사람이 고르는 값이 아니다.
    target_language,
    completion_title,
    completion_copy
  )
  values (
    maker,
    create_story.story ->> 'title',
    create_story.story ->> 'hook',
    create_story.story ->> 'intro',
    create_story.story ->> 'coverEmoji',
    'en',
    create_story.story ->> 'completionTitle',
    create_story.story ->> 'completionCopy'
  )
  returning id into made_story_id;

  insert into public.characters (story_id, name, position, persona)
  select
    made_story_id,
    person ->> 'name',
    (person ->> 'position')::smallint,
    person ->> 'persona'
  from jsonb_array_elements(create_story.story -> 'characters') as person;

  -- `cast_names`는 아직 앞선 API가 읽는 옛 열이다. 같은 이름을 같은 차례로
  -- 담아야 pgTAP의 일치 검사가 지나간다.
  insert into public.episodes (
    story_id,
    number,
    title,
    preview,
    situation,
    situation_emoji,
    opening,
    stage,
    cast_names,
    ending_success,
    ending_compromise,
    ending_failure
  )
  select
    made_story_id,
    (chapter ->> 'number')::smallint,
    chapter ->> 'title',
    chapter ->> 'preview',
    chapter ->> 'situation',
    chapter ->> 'situationEmoji',
    chapter ->> 'opening',
    chapter ->> 'stage',
    array(
      select jsonb_array_elements_text(chapter -> 'castNames')
    ),
    chapter ->> 'endingSuccess',
    chapter ->> 'endingCompromise',
    chapter ->> 'endingFailure'
  from jsonb_array_elements(create_story.story -> 'episodes') as chapter;

  insert into public.episode_characters (episode_id, character_id, story_id, at)
  select
    saved.id,
    person.id,
    made_story_id,
    standing.at::smallint
  from jsonb_array_elements(create_story.story -> 'episodes') as chapter
  cross join lateral jsonb_array_elements_text(chapter -> 'castNames')
    with ordinality as standing(name, at)
  join public.episodes saved
    on saved.story_id = made_story_id
    and saved.number = (chapter ->> 'number')::smallint
  -- 카드에 없는 이름은 여기서 짝을 찾지 못하고 빈 값이 된다. 안쪽 조인으로
  -- 이으면 그 줄이 조용히 사라져 인물이 하나 모자란 화가 저장되므로, 빈 값을
  -- 그대로 내보내 `character_id`의 not null에서 막는다. 그 실패가 문장 전체를
  -- 되돌린다.
  left join public.characters person
    on person.story_id = made_story_id
    and person.name = standing.name;

  return query
  select made_story_id, saved.id
  from public.episodes saved
  where saved.story_id = made_story_id
  order by saved.number
  limit 1;
end;
$function$;
COMMENT ON FUNCTION public.create_story(jsonb) IS 'Saves one story the caller made, with its people and episodes, in a single statement. Returns the new story and its first episode.';
-- `create function`은 EXECUTE를 PUBLIC에 기본으로 준다. `db diff`는 그 기본값을
-- 비교의 바닥으로 보아 회수 문장을 만들지 않으므로 여기서 직접 회수한다. 이 줄이
-- 없으면 로그인하지 않은 요청도 이 함수를 부를 수 있다.
-- docs/decisions/supabase-schema-workflow.md를 따른다.
REVOKE ALL ON FUNCTION public.create_story(jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.create_story(jsonb) TO authenticated;
ALTER TABLE public.stories ALTER COLUMN "position" DROP NOT NULL;
ALTER TABLE public.stories ALTER COLUMN slug DROP NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;
CREATE POLICY characters_select_visible_story ON public.characters FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.stories
  WHERE (stories.id = characters.story_id))));
ALTER TABLE public.episode_characters ADD CONSTRAINT episode_characters_character_fkey FOREIGN KEY (character_id, story_id) REFERENCES public.characters(id, story_id) ON DELETE CASCADE;
CREATE POLICY episode_characters_select_visible_story ON public.episode_characters FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.stories
  WHERE (stories.id = episode_characters.story_id))));
ALTER TABLE public.episode_plays ADD CONSTRAINT episode_plays_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.episodes ADD CONSTRAINT episodes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;
CREATE POLICY episodes_select_visible_story ON public.episodes FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.stories
  WHERE (stories.id = episodes.story_id))));
ALTER TABLE public.saved_expressions ADD CONSTRAINT saved_expressions_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.stories ADD COLUMN owner_id uuid;
ALTER TABLE public.stories ADD CONSTRAINT stories_authorship_usable CHECK ((owner_id IS NULL) = (slug IS NOT NULL) AND (owner_id IS NULL) = ("position" IS NOT NULL));
ALTER TABLE public.stories ADD CONSTRAINT stories_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.stories ADD COLUMN created_at timestamp with time zone DEFAULT now() NOT NULL;
CREATE INDEX stories_owner_id_created_at_idx ON public.stories (owner_id, created_at DESC) WHERE owner_id IS NOT NULL;
CREATE POLICY stories_select_official_or_own ON public.stories FOR SELECT TO authenticated USING (((owner_id IS NULL) OR (owner_id = ( SELECT auth.uid() AS uid))));
ALTER TABLE public.story_plays ADD CONSTRAINT story_plays_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) DEFERRABLE INITIALLY DEFERRED;
