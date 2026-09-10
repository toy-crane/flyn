import type { UIMessage } from "ai";

import type {
  EpisodeCorrection,
  ExpressionResult,
} from "@/features/episode/api/episode-correction";
import type { SavedExpressionRef } from "@/features/episode/api/saved-expression";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { aiUrl } from "@/shared/ai/request-options";

/**
 * 이 화에 서는 인물 하나. 화면이 이름표를 그릴 때 쓴다.
 *
 * 설명은 오지 않는다. 그것을 읽는 것은 모델이고, 화면이 묻는 것은 이 이름이
 * 누구이고 이 스토리에서 몇 번째인가 둘뿐이다. 순서가 이름표 색의 번호가 되므로
 * 같은 인물은 어느 화에서나 같은 색으로 보인다.
 */
export interface EpisodeCastMember {
  name: string;
  position: number;
}

/** 화면이 한 화를 여는 데 필요한 각본 조각. */
export interface PlayingEpisode {
  cast?: EpisodeCastMember[];
  episodeId: string;
  number: number;
  preview: string;
  situation: string;
  situationEmoji: string;
  title: string;
}

export interface EpisodeSession {
  /**
   * 이 대화에 붙은 배울 표현. 저장된 대화에 교정 part가 없으므로 여기 실려 온다.
   *
   * 화면을 나갔다 와도 붙어 있던 배울 표현이 같은 메시지 곁으로 돌아온다.
   */
  corrections: EpisodeCorrection[];
  /**
   * 이 화가 어떻게 끝났는지. 진행 중이면 없다.
   *
   * 저장된 대화에는 결말 part가 들어 있지 않다. 결말은 서버의 플레이 기록이
   * 소유하는 사실이라, 다시 연 화면은 흐르던 part 대신 이 값으로 마무리를
   * 그린다.
   */
  ending?: EpisodeEnding;
  episode: PlayingEpisode;
  expressionResults: ExpressionResult[];
  messages: UIMessage[];
  /** 결말 다음에 보여 줄 예고. 같은 이유로 대화가 아니라 여기 실려 온다. */
  nextUp?: EpisodeNextUp;
  readOnly: boolean;
  /**
   * 이 대화에서 담아 둔 자리. 책갈피가 같은 말풍선 곁으로 돌아온다.
   *
   * 담긴 문장과 뜻은 오지 않는다. 그것을 읽는 곳은 표현 노트이고, 대화 화면이
   * 묻는 것은 이 자리를 이미 담았는가 하나다.
   */
  saved?: SavedExpressionRef[];
  story: { id: string; title: string };
}

/**
 * 저장된 한 화를 읽는다.
 *
 * 회차를 함께 말한다. 같은 화를 여러 회차에서 플레이하므로 화 id만으로는 어느
 * 대화를 여는지 정해지지 않는다.
 */
export async function readEpisodeSession(
  accessToken: string,
  storyPlayId: string,
  episodeId: string,
  signal?: AbortSignal
): Promise<EpisodeSession> {
  const path = `/ai/episode/${episodeId}?storyPlayId=${encodeURIComponent(storyPlayId)}`;
  const response = await fetch(aiUrl(path), {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Reading the episode failed with ${response.status}`);
  }

  return (await response.json()) as EpisodeSession;
}
