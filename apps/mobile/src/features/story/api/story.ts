import { aiUrl } from "@/shared/ai/request-options";

export const STORIES_API_PATH = "/ai/episode/stories";
export const RECENT_API_PATH = "/ai/episode/recent";

/**
 * 탐색이 보여 주는 스토리 한 장.
 *
 * 진행이 없다. 같은 스토리를 여러 회차로 진행하므로 목록에 세울 대표 진행이
 * 없고, 진행과 결과는 대화 기록이 회차마다 따로 보여 준다.
 */
export interface StoryCard {
  coverBlurhash: string | null;
  coverEmoji: string;
  coverImagePath: string | null;
  hook: string;
  storyId: string;
  title: string;
  /** 스토리의 화 수. */
  total: number;
}

/** 스토리 상세의 에피소드 목록 한 줄. 모든 화가 같은 모양이다. */
export interface StoryEpisode {
  episodeId: string;
  number: number;
  /** 결말을 드러내지 않는 상황 설명. 모든 화가 공개한다. */
  situation: string;
  /**
   * 상황 줄이 앞에 두는 그림 문자. 상세는 쓰지 않는다.
   *
   * 새 회차의 1화는 아직 회차가 없어 저장된 대화를 읽을 수 없다. 그 화면이
   * 상황 줄을 그리는 데 필요한 값을 여기서 가져간다.
   */
  situationEmoji: string;
  title: string;
}

/** 스토리 하나를 펼쳐 보는 화면. */
export interface StoryDetail extends StoryCard {
  episodes: StoryEpisode[];
  intro: string;
}

/** 스토리 탭의 최근 대화 한 줄. */
export interface RecentStory {
  coverBlurhash: string | null;
  coverEmoji: string;
  coverImagePath: string | null;
  hook: string;
  storyId: string;
  title: string;
}

/** 회차 카드를 펼치면 보이는 끝낸 화 한 줄. */
export interface StoryPlayEpisode {
  episodeId: string;
  /** 다시 열어 읽을 대화가 남아 있다. 없으면 누를 수 없다. */
  hasTranscript: boolean;
  number: number;
  /** 그 화가 얻어낸 결과 한 줄. */
  outcome: string;
  title: string;
}

/** 대화 기록의 회차 카드 하나. */
export interface StoryPlay {
  episodes: StoryPlayEpisode[];
  /** 끝낸 화 수. 분절 진행 바가 이만큼 찬다. */
  finished: number;
  /** 이어갈 화. 이 회차를 완주했으면 없다. */
  next: {
    episodeId: string;
    number: number;
    title: string;
  } | null;
  /** 카드 제목이 되는 시작 시각. */
  startedAt: string;
  storyPlayId: string;
}

/** 대화 기록 화면 한 장. */
export interface StoryPlays {
  coverBlurhash: string | null;
  coverEmoji: string;
  coverImagePath: string | null;
  intro: string;
  plays: StoryPlay[];
  storyId: string;
  title: string;
  total: number;
}

async function read<Value>(
  path: string,
  accessToken: string,
  what: string
): Promise<Value> {
  const response = await fetch(aiUrl(path), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Reading ${what} failed with ${response.status}`);
  }

  return (await response.json()) as Value;
}

export function readStories(accessToken: string): Promise<StoryCard[]> {
  return read<{ stories: StoryCard[] }>(
    STORIES_API_PATH,
    accessToken,
    "the stories"
  ).then((view) => view.stories);
}

export function readStoryDetail(
  accessToken: string,
  storyId: string
): Promise<StoryDetail> {
  return read(`${STORIES_API_PATH}/${storyId}`, accessToken, "the story");
}

export function readRecentStories(accessToken: string): Promise<RecentStory[]> {
  return read<{ stories: RecentStory[] }>(
    RECENT_API_PATH,
    accessToken,
    "the recent stories"
  ).then((view) => view.stories);
}

export function readStoryPlays(
  accessToken: string,
  storyId: string
): Promise<StoryPlays> {
  return read(
    `${STORIES_API_PATH}/${storyId}/plays`,
    accessToken,
    "the conversations"
  );
}
