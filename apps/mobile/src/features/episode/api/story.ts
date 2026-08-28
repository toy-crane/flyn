import { aiUrl } from "@/shared/ai/request-options";

export const STORY_API_PATH = "/ai/episode/story";

/** 홈의 끝낸 에피소드 목록 한 줄. */
export interface FinishedEpisode {
  episodeId: string;
  hasTranscript: boolean;
  /** 성공, 타협 또는 실패. */
  kind: string;
  number: number;
  outcome: string;
  title: string;
}

/** 이 계정이 다음에 이어 갈 에피소드. */
export interface NextEpisode {
  episodeId: string;
  number: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

/** 홈이 공식 스토리 하나를 그리는 데 필요한 전부. */
export interface Story {
  completion: { copy: string; title: string };
  finished: FinishedEpisode[];
  id: string;
  next: NextEpisode | null;
  targetLanguage: string;
  title: string;
  total: number;
}

export async function readStory(accessToken: string): Promise<Story> {
  const response = await fetch(aiUrl(STORY_API_PATH), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Reading the story failed with ${response.status}`);
  }

  return (await response.json()) as Story;
}
