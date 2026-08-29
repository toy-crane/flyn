import { DefaultChatTransport, type UIMessage } from "ai";

import { aiRequestOptions } from "@/shared/ai/request-options";

export const EPISODE_API_PATH = "/ai/episode";

/**
 * How the app talks to `POST /ai/episode`.
 *
 * Every request carries the scene so far. The server saves that same message
 * list to the account after each turn.
 *
 * `getEpisodeId` rides along so the request says which episode the screen thinks
 * it is playing. The server decides on its own from the account's progress and
 * refuses a request that names a different one, which is how a screen left
 * behind by a finished episode fails loudly instead of quietly playing the
 * wrong scene. It is a function for the same reason the token is: the transport
 * resolves the body on every send.
 *
 * `getSeenPatterns`는 이 에피소드에서 이미 받은 배울 표현의 패턴 키다. 교정은
 * 대화 기록에 남지 않아서 서버가 지난 턴에 무엇을 알려 줬는지 알지 못하므로,
 * 같은 패턴을 두 번 만들지 않는 일은 그 목록을 가진 앱이 함께 보내야 성립한다.
 */
export function createEpisodeTransport(
  getAccessToken: () => string | undefined,
  getEpisodeId: () => string | undefined,
  getSeenPatterns: () => string[]
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(EPISODE_API_PATH, getAccessToken),
    body: () => ({
      episodeId: getEpisodeId(),
      seenPatterns: getSeenPatterns(),
    }),
  });
}
