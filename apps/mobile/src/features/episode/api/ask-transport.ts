import { DefaultChatTransport, type UIMessage } from "ai";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { aiRequestOptions } from "@/shared/ai/request-options";

export const EPISODE_ASK_API_PATH = "/ai/episode/ask";

/**
 * 배울 표현 하나를 두고 묻는 대화가 서버와 말하는 방법.
 *
 * 요청마다 두 가지가 함께 간다. 에피소드 대화의 스냅샷은 물어보는 말 앞에
 * 붙고, 교정은 본문에 따로 실린다. 둘 다 시트가 열릴 때 고정되고 다시 쓰이지
 * 않는다. 서버는 이 대화를 저장하지 않는다.
 */
export function createEpisodeAskTransport(
  getAccessToken: () => string | undefined,
  correction: EpisodeCorrection,
  snapshot: UIMessage[]
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(EPISODE_ASK_API_PATH, getAccessToken),
    prepareSendMessagesRequest: ({
      body,
      id,
      messageId,
      messages,
      trigger,
    }) => ({
      body: {
        ...body,
        correction: {
          entries: correction.entries,
          fixed: correction.fixed,
          original: correction.original,
        },
        id,
        messageId,
        messages: [...snapshot, ...messages],
        trigger,
      },
    }),
  });
}
