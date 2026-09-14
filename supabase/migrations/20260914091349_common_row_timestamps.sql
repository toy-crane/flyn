-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP TRIGGER app_version_policies_set_timestamps ON public.app_version_policies;

DROP FUNCTION public.set_app_version_policy_timestamps();

DROP TRIGGER profiles_set_updated_at ON public.profiles;

DROP FUNCTION public.set_updated_at();

CREATE FUNCTION public.set_row_timestamps()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if tg_op = 'INSERT' then
    new.created_at := clock_timestamp();
    new.updated_at := new.created_at;
  else
    new.created_at := old.created_at;
    new.updated_at := old.updated_at;
    if new is distinct from old then
      new.updated_at := clock_timestamp();
    end if;
  end if;
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.set_row_timestamps() FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE public.characters
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.characters
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.characters SET updated_at = created_at;

CREATE TRIGGER characters_set_timestamps
  BEFORE INSERT OR UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.episode_characters
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.episode_characters
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.episode_characters SET updated_at = created_at;

CREATE TRIGGER episode_characters_set_timestamps
  BEFORE INSERT OR UPDATE ON public.episode_characters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.episode_messages
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.episode_messages SET updated_at = created_at;

CREATE TRIGGER episode_messages_set_timestamps
  BEFORE INSERT OR UPDATE ON public.episode_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.episode_plays
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.episode_plays
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.episode_plays SET created_at = started_at, updated_at = started_at;

CREATE TRIGGER episode_plays_set_timestamps
  BEFORE INSERT OR UPDATE ON public.episode_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.episodes
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.episodes
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.episodes SET updated_at = created_at;

CREATE TRIGGER episodes_set_timestamps
  BEFORE INSERT OR UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.language_levels
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.language_levels
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.language_levels SET created_at = observed_at, updated_at = observed_at;

CREATE TRIGGER language_levels_set_timestamps
  BEFORE INSERT OR UPDATE ON public.language_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

CREATE TRIGGER profiles_set_timestamps
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.retired_usernames
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.retired_usernames
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.retired_usernames SET created_at = retired_at, updated_at = retired_at;

CREATE TRIGGER retired_usernames_set_timestamps
  BEFORE INSERT OR UPDATE ON public.retired_usernames
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.stories
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.stories SET updated_at = created_at;

CREATE TRIGGER stories_set_timestamps
  BEFORE INSERT OR UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

ALTER TABLE public.story_plays
  ADD COLUMN created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

ALTER TABLE public.story_plays
  ADD COLUMN updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL;

-- 기존 사건 시각을 보존하고, 과거 수정 이력이 없으면 생성 시각으로 시작한다.
UPDATE public.story_plays SET created_at = started_at, updated_at = started_at;

CREATE TRIGGER story_plays_set_timestamps
  BEFORE INSERT OR UPDATE ON public.story_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();

CREATE OR REPLACE TRIGGER app_version_policies_set_timestamps
  BEFORE INSERT OR UPDATE ON public.app_version_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_timestamps();