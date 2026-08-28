import type { UIMessage } from "ai";

import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { aiUrl } from "@/shared/ai/request-options";

/** 화면이 한 화를 여는 데 필요한 각본 조각. */
export interface PlayingEpisode {
  episodeId: string;
  number: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

export interface EpisodeSession {
  /**
   * 이 화가 어떻게 끝났는지. 진행 중이면 없다.
   *
   * 저장된 대화에는 결말 part가 들어 있지 않다. 결말은 서버의 플레이 기록이
   * 소유하는 사실이라, 다시 연 화면은 흐르던 part 대신 이 값으로 마무리를
   * 그린다.
   */
  ending?: EpisodeEnding;
  episode: PlayingEpisode;
  messages: UIMessage[];
  /** 결말 다음에 보여 줄 예고. 같은 이유로 대화가 아니라 여기 실려 온다. */
  nextUp?: EpisodeNextUp;
  readOnly: boolean;
}

export async function readEpisodeSession(
  accessToken: string,
  episodeId: string
): Promise<EpisodeSession> {
  const response = await fetch(aiUrl(`/ai/episode/${episodeId}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Reading the episode failed with ${response.status}`);
  }

  return (await response.json()) as EpisodeSession;
}
