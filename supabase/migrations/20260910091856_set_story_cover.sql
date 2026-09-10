-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE FUNCTION public.set_story_cover (
  story_id       uuid,
  cover_path     text,
  cover_blurhash text
)
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  update public.stories
  set cover_image_path = set_story_cover.cover_path,
      cover_blurhash = set_story_cover.cover_blurhash
  where stories.id = set_story_cover.story_id
    and stories.owner_id = (select auth.uid())
    and stories.cover_image_path is null
    and set_story_cover.cover_path ~ (
      '^made/' || (select auth.uid())::text || '/[0-9a-f]{64}\.png$'
    )
    -- 해시 이름은 길이가 정해져 있지만, 미리보기 해시는 클라이언트가 보내는
    -- 값이다. 열에 제약이 없으므로 여기서 막는다.
    and char_length(set_story_cover.cover_blurhash) between 6 and 128;
$function$;

COMMENT ON FUNCTION public.set_story_cover(uuid,text,text) IS 'Attaches one cover to a story the caller made, once, from that caller''s own folder.';

-- diff는 PUBLIC만 회수한다. 운영에서는 API 역할에 직접 부여된 EXECUTE가
-- 남으므로, `supabase/schemas/50-functions.sql`이 적은 대로 세 역할을 함께
-- 회수한다. 근거는 docs/decisions/supabase-schema-workflow.md에 있다.
REVOKE ALL ON FUNCTION public.set_story_cover(uuid, text, text) FROM PUBLIC, anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.set_story_cover(uuid, text, text) TO authenticated;