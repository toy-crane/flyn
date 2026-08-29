import type { Database } from "@repo/supabase";
import type { SupabaseContext } from "@supabase/server";

/** 로그인한 사람의 권한으로 데이터베이스에 닿는 클라이언트. */
export type EpisodeClient = SupabaseContext<Database>["supabase"];

/** 지금 홈이 바로 보여 주는 공식 스토리. */
export const DEFAULT_STORY_SLUG = "mia-cafe";

/** 데이터베이스에서 읽어 장면과 화면이 함께 쓰는 한 에피소드. */
export interface EpisodeScript {
  cast: readonly string[];
  endings: {
    compromise: string;
    failure: string;
    success: string;
  };
  id: string;
  number: number;
  opening: string;
  preview: string;
  situation: string;
  situationEmoji: string;
  stage: string;
  storyId: string;
  title: string;
}

/** 하나의 완결된 공식 스토리와 그 안의 순서 있는 에피소드. */
export interface StoryContent {
  completion: { copy: string; title: string };
  episodes: EpisodeScript[];
  id: string;
  position: number;
  slug: string;
  targetLanguage: string;
  title: string;
}

/** 목록과 상세가 한 스토리에서 읽는 화 한 줄. 각본 본문은 담지 않는다. */
export interface StoryCatalogEpisode {
  id: string;
  number: number;
  preview: string;
  title: string;
}

/**
 * 고르고 되돌아보는 화면이 읽는 스토리 한 줄.
 *
 * 각본, 무대, 결말 기준은 빠져 있다. 목록과 상세는 어느 화가 있는지만 알면
 * 되고, 장면을 만드는 글은 그 화를 실제로 여는 경로가 따로 읽는다.
 */
export interface StoryCatalogEntry {
  completion: { copy: string; title: string };
  coverEmoji: string;
  coverImagePath: string | null;
  episodes: StoryCatalogEpisode[];
  hook: string;
  id: string;
  intro: string;
  position: number;
  slug: string;
  title: string;
}

/**
 * 모든 공식 스토리를 정해진 순서로 읽는다.
 *
 * 한 번의 쿼리로 스토리와 그 안의 화 목록을 함께 받는다. 각본 본문을 빼는
 * 것이 이 읽기의 요점이다. 스토리가 늘어도 목록 한 장의 값이 화 수만큼
 * 커지지 않는다.
 */
export async function readStoryCatalog(
  client: EpisodeClient
): Promise<StoryCatalogEntry[]> {
  const { data, error } = await client
    .from("stories")
    .select(
      "id, position, slug, title, hook, intro, cover_emoji, cover_image_path, completion_title, completion_copy, episodes(id, number, title, preview)"
    )
    .order("position")
    .order("number", { referencedTable: "episodes" });

  if (error) {
    throw new Error(`Reading the story catalog failed: ${error.message}`);
  }

  return data.map((story) => ({
    completion: {
      copy: story.completion_copy,
      title: story.completion_title,
    },
    coverEmoji: story.cover_emoji,
    coverImagePath: story.cover_image_path,
    episodes: story.episodes.map((episode) => ({
      id: episode.id,
      number: episode.number,
      preview: episode.preview,
      title: episode.title,
    })),
    hook: story.hook,
    id: story.id,
    intro: story.intro,
    position: story.position,
    slug: story.slug,
    title: story.title,
  }));
}

/** 화 id의 생김새. 데이터베이스에 묻기 전에 여기서 먼저 가린다. */
const EPISODE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 이 화가 속한 스토리의 각본을 읽는다.
 *
 * 장면을 여는 경로는 어느 스토리인지 알지 못한 채 화 하나만 받는다. 스토리가
 * 여럿이므로 그 화가 어디에 속했는지부터 물어야, 진행과 기억을 다른 스토리와
 * 섞지 않는다. 없는 화를 물으면 빈손으로 돌아온다.
 *
 * 경로에서 오는 값이라 화 id의 모양조차 보장되지 않는다. uuid가 아닌 값을 그대로
 * 물으면 데이터베이스가 형 변환에서 실패하고, 없는 화를 물은 것이 서버 오류로
 * 둔갑한다. 모양이 아닌 값은 묻지 않고 없는 화로 돌려준다.
 */
export async function readStoryOfEpisode(
  client: EpisodeClient,
  episodeId: string
): Promise<StoryContent | undefined> {
  if (!EPISODE_ID.test(episodeId)) {
    return;
  }

  const { data, error } = await client
    .from("episodes")
    .select("story_id")
    .eq("id", episodeId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Reading the story of episode ${episodeId} failed: ${error.message}`
    );
  }

  return data ? await readStoryContentById(client, data.story_id) : undefined;
}

/**
 * 공식 스토리와 각본을 데이터베이스에서 읽는다.
 *
 * 두 쿼리를 따로 써서 스토리 한 줄과 에피소드 순서의 실패를 각각 드러낸다.
 * 앱이 가진 제목이나 각본을 보태는 길은 없다.
 */
export async function readStoryContent(
  client: EpisodeClient,
  slug = DEFAULT_STORY_SLUG
): Promise<StoryContent> {
  return await readStoryBy(client, "slug", slug);
}

async function readStoryContentById(
  client: EpisodeClient,
  storyId: string
): Promise<StoryContent> {
  return await readStoryBy(client, "id", storyId);
}

async function readStoryBy(
  client: EpisodeClient,
  column: "id" | "slug",
  value: string
): Promise<StoryContent> {
  const { data: story, error: storyError } = await client
    .from("stories")
    .select(
      "id, position, slug, title, target_language, completion_title, completion_copy"
    )
    .eq(column, value)
    .single();

  if (storyError) {
    throw new Error(`Reading story ${value} failed: ${storyError.message}`);
  }

  const { slug } = story;

  const { data: episodes, error: episodeError } = await client
    .from("episodes")
    .select(
      "id, story_id, number, title, preview, situation, situation_emoji, opening, stage, cast_names, ending_success, ending_compromise, ending_failure"
    )
    .eq("story_id", story.id)
    .order("number");

  if (episodeError) {
    throw new Error(
      `Reading episodes for story ${slug} failed: ${episodeError.message}`
    );
  }

  return {
    completion: {
      copy: story.completion_copy,
      title: story.completion_title,
    },
    episodes: episodes.map((episode) => ({
      cast: episode.cast_names,
      endings: {
        compromise: episode.ending_compromise,
        failure: episode.ending_failure,
        success: episode.ending_success,
      },
      id: episode.id,
      number: episode.number,
      opening: episode.opening,
      preview: episode.preview,
      situation: episode.situation,
      situationEmoji: episode.situation_emoji,
      stage: episode.stage,
      storyId: episode.story_id,
      title: episode.title,
    })),
    id: story.id,
    position: story.position,
    slug: story.slug,
    targetLanguage: story.target_language,
    title: story.title,
  };
}
