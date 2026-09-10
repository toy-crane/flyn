import type { Database } from "@repo/supabase";
import type { SupabaseContext } from "@supabase/server";

/** 로그인한 사람의 권한으로 데이터베이스에 닿는 클라이언트. */
export type EpisodeClient = SupabaseContext<Database>["supabase"];

/**
 * 한 스토리에 사는 인물. 화가 바뀌어도 같은 것만 담는다.
 *
 * 그 화에서의 사정은 여기가 아니라 화의 무대가 쓴다. 설명이 한 곳에 있으므로
 * 모든 화의 프롬프트에 같은 문장이 들어가고 인물이 화를 거듭해도 흐려지지 않는다.
 */
export interface StoryCharacter {
  name: string;
  persona: string;
  /** 스토리 안의 순서. 화면에서 이름표 색의 번호가 된다. */
  position: number;
}

/** 데이터베이스에서 읽어 장면과 화면이 함께 쓰는 한 에피소드. */
export interface EpisodeScript {
  /** 이 화에 서는 인물. 그 화의 목록에 적힌 차례대로다. */
  cast: readonly StoryCharacter[];
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
  /**
   * 이 화에 서는 인물의 이름과 스토리 안 순서.
   *
   * 새 회차의 1화는 아직 저장된 대화가 없어 세션을 읽지 못한다. 그 화면이
   * 이름표 색을 고르는 데 필요한 값을 여기서 가져간다.
   */
  cast: readonly StoryCharacter[];
  id: string;
  number: number;
  preview: string;
  /** 상세가 모든 화에 공개하는, 결말을 드러내지 않는 상황 설명. */
  situation: string;
  situationEmoji: string;
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
  coverBlurhash: string | null;
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
      "id, position, slug, title, hook, intro, cover_emoji, cover_image_path, cover_blurhash, completion_title, completion_copy, episodes(id, number, title, preview, situation, situation_emoji)"
    )
    .order("position")
    .order("number", { referencedTable: "episodes" });

  if (error) {
    throw new Error(`Reading the story catalog failed: ${error.message}`);
  }

  const cast = await readCatalogCast(client);

  return data.map((story) => ({
    completion: {
      copy: story.completion_copy,
      title: story.completion_title,
    },
    coverBlurhash: story.cover_blurhash,
    coverEmoji: story.cover_emoji,
    coverImagePath: story.cover_image_path,
    episodes: story.episodes.map((episode) => ({
      cast: cast.get(episode.id) ?? [],
      id: episode.id,
      number: episode.number,
      preview: episode.preview,
      situation: episode.situation,
      situationEmoji: episode.situation_emoji,
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
 * 이 회차가 진행하는 스토리의 각본을 읽는다.
 *
 * 이어가는 요청은 회차 하나만 들고 온다. 행 권한이 남의 회차를 감추므로, 읽히지
 * 않으면 이어갈 수 없다는 답이 그대로 나온다.
 */
export async function readStoryOfPlay(
  client: EpisodeClient,
  storyPlayId: string
): Promise<StoryContent | undefined> {
  if (!EPISODE_ID.test(storyPlayId)) {
    return;
  }

  const { data, error } = await client
    .from("story_plays")
    .select("story_id")
    .eq("id", storyPlayId)
    .maybeSingle();

  if (error) {
    throw new Error(`Reading run ${storyPlayId} failed: ${error.message}`);
  }

  return data ? await readStoryContentById(client, data.story_id) : undefined;
}

/**
 * 인물 연결을 화 id로 묶는다. 목록의 차례는 화가 정한 `at`이다.
 *
 * 인물은 스토리가 소유하고 화는 그중 누구인지만 가리키므로, 두 줄기를 받아
 * 여기서 잇는다. 앱은 이 순서를 스스로 알 수 없다.
 */
function castOfLinks(
  people: readonly {
    id: string;
    name: string;
    persona: string;
    position: number;
  }[],
  links: readonly { at: number; character_id: string; episode_id: string }[]
): Map<string, StoryCharacter[]> {
  const byId = new Map(
    people.map((person) => [
      person.id,
      {
        name: person.name,
        persona: person.persona,
        position: person.position,
      } satisfies StoryCharacter,
    ])
  );
  const cast = new Map<string, StoryCharacter[]>();

  for (const link of links) {
    const person = byId.get(link.character_id);

    if (!person) {
      continue;
    }

    const standing = cast.get(link.episode_id);

    if (standing) {
      standing.push(person);
    } else {
      cast.set(link.episode_id, [person]);
    }
  }

  return cast;
}

/**
 * 공식 콘텐츠 전체의 인물 연결을 한 번에 읽는다.
 *
 * 목록과 상세가 같은 조회 하나를 쓴다. 스토리당 인물이 넷을 넘지 못하고 화당
 * 셋을 넘지 못하므로 이 조회가 콘텐츠 크기에 비례해 커지지 않는다.
 */
async function readCatalogCast(
  client: EpisodeClient
): Promise<Map<string, StoryCharacter[]>> {
  const [people, links] = await Promise.all([
    client.from("characters").select("id, name, position, persona"),
    client
      .from("episode_characters")
      .select("episode_id, character_id, at")
      .order("at"),
  ]);

  if (people.error) {
    throw new Error(
      `Reading the official cast failed: ${people.error.message}`
    );
  }

  if (links.error) {
    throw new Error(
      `Reading the official cast links failed: ${links.error.message}`
    );
  }

  return castOfLinks(people.data, links.data);
}

/**
 * 인물 행이 아직 없는 화를 이전 화자 목록으로 세운다.
 *
 * 콘텐츠는 스키마와 API보다 늦게 운영에 올라간다. 그 사이 `characters`가 비어
 * 있으면 화자 판정이 통째로 무너져 모든 대사가 화자 없는 줄이 된다. 이름만 있는
 * 인물로 세우면 말풍선과 이름표는 살고 설명만 빠진다. 콘텐츠가 올라간 뒤에는
 * 이 길로 오지 않는다.
 *
 * `cast_names`를 지우는 마이그레이션이 이 대비도 함께 걷어낸다.
 */
function namesOnlyCast(names: readonly string[]): StoryCharacter[] {
  return names.map((name, index) => ({
    name,
    persona: "",
    position: index + 1,
  }));
}

/**
 * 이 스토리의 화마다 누가 서는지 읽어 화 id로 묶는다.
 *
 * 인물은 스토리가 소유하고 화는 그중 누구인지만 가리키므로, 두 번 물어 앱이
 * 아니라 여기서 잇는다. 한 스토리의 인물은 넷을 넘지 못하고 한 화의 인물은
 * 셋을 넘지 못하므로 이 조회가 화 수만큼 커지지 않는다.
 *
 * 목록의 차례는 화가 정한 `at`이다. 프롬프트의 등장인물 문장이 이 차례로 이름을
 * 부르므로, 같은 인물이라도 화마다 먼저 불릴 수 있다.
 */
async function readStoryCast(
  client: EpisodeClient,
  storyId: string,
  slug: string
): Promise<Map<string, StoryCharacter[]>> {
  const [people, links] = await Promise.all([
    client
      .from("characters")
      .select("id, name, position, persona")
      .eq("story_id", storyId),
    client
      .from("episode_characters")
      .select("episode_id, character_id, at")
      .eq("story_id", storyId)
      .order("at"),
  ]);

  if (people.error) {
    throw new Error(
      `Reading characters for story ${slug} failed: ${people.error.message}`
    );
  }

  if (links.error) {
    throw new Error(
      `Reading the cast of story ${slug} failed: ${links.error.message}`
    );
  }

  return castOfLinks(people.data, links.data);
}

/**
 * 스토리 하나와 그 각본을 데이터베이스에서 읽는다.
 *
 * 두 쿼리를 따로 써서 스토리 한 줄과 에피소드 순서의 실패를 각각 드러낸다.
 * 앱이 가진 제목이나 각본을 보태는 길은 없다.
 */
export async function readStoryContentById(
  client: EpisodeClient,
  storyId: string
): Promise<StoryContent> {
  const { data: story, error: storyError } = await client
    .from("stories")
    .select(
      "id, position, slug, title, target_language, completion_title, completion_copy"
    )
    .eq("id", storyId)
    .single();

  if (storyError) {
    throw new Error(`Reading story ${storyId} failed: ${storyError.message}`);
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

  const cast = await readStoryCast(client, story.id, slug);

  return {
    completion: {
      copy: story.completion_copy,
      title: story.completion_title,
    },
    episodes: episodes.map((episode) => ({
      cast: cast.get(episode.id) ?? namesOnlyCast(episode.cast_names),
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
