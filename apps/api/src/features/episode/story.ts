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
  const { data: story, error: storyError } = await client
    .from("stories")
    .select(
      "id, position, slug, title, target_language, completion_title, completion_copy"
    )
    .eq("slug", slug)
    .single();

  if (storyError) {
    throw new Error(`Reading story ${slug} failed: ${storyError.message}`);
  }

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
