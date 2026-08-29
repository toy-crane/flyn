import { aiUrl } from "@/shared/ai/request-options";

export const HOME_API_PATH = "/ai/episode/home";
export const STORIES_API_PATH = "/ai/episode/stories";

/** 홈과 스토리 탭이 같은 카드로 그리는 스토리 한 장. */
export interface StoryCard {
  coverEmoji: string;
  coverImageUrl: string | null;
  /** 끝낸 화 수. 분절 진행 바가 이만큼 찬다. */
  finished: number;
  hook: string;
  storyId: string;
  title: string;
  total: number;
}

/** 홈의 이어 하기 카드와 진행 중인 스토리 행. */
export interface ContinueCard extends StoryCard {
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  preview: string;
  /** 진행하다 만 화면 참. 버튼 문구와 보조 한 줄이 이것으로 갈린다. */
  resuming: boolean;
}

/** 홈이 진행을 잇는 데 필요한 전부. */
export interface Home {
  /** 이어 하기 카드. 모든 스토리를 완주했으면 없다. */
  continueCard: ContinueCard | null;
  /** 아직 아무 화도 열지 않은 계정. 카드 위 제목이 첫 이야기가 된다. */
  firstTime: boolean;
  /** 이어 하기 카드 말고 더 진행 중인 스토리. 최근 것부터. */
  others: ContinueCard[];
}

/** 상세의 한 화가 놓인 자리. */
export type StoryEpisodeState = "finished" | "locked" | "next";

/** 스토리 상세의 에피소드 목록 한 줄. */
export interface StoryEpisode {
  episodeId: string;
  /** 끝낸 화 중 대화 기록이 남은 것만 다시 열 수 있다. */
  hasTranscript: boolean;
  number: number;
  /** 끝낸 화가 얻어낸 결과 한 줄. */
  outcome: string | null;
  /** 다음 화의 예고. 아직 열리지 않은 화는 감춘다. */
  preview: string | null;
  state: StoryEpisodeState;
  title: string;
}

/** 스토리 하나를 펼쳐 보는 화면. */
export interface StoryDetail extends StoryCard {
  episodes: StoryEpisode[];
  intro: string;
  /** 시작하거나 이어 갈 화. 완주했으면 없다. */
  next: {
    episodeId: string;
    number: number;
    resuming: boolean;
  } | null;
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

export function readHome(accessToken: string): Promise<Home> {
  return read(HOME_API_PATH, accessToken, "the home");
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
