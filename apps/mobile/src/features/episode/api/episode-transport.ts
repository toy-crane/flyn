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
 */
export function createEpisodeTransport(
  getAccessToken: () => string | undefined,
  getEpisodeId: () => string | undefined
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(EPISODE_API_PATH, getAccessToken),
    body: () => ({ episodeId: getEpisodeId() }),
  });
}
