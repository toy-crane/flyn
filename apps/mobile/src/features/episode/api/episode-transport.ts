import { DefaultChatTransport, type UIMessage } from "ai";

import { aiRequestOptions } from "@/shared/ai/request-options";

export const EPISODE_API_PATH = "/ai/episode";

/**
 * How the app talks to `POST /ai/episode`.
 *
 * The episode lives nowhere but this device: every request carries the scene
 * so far, and a request carrying nothing is what opens a new episode. Nothing
 * else is added to the protocol, so the route answers the same body the AI SDK
 * builds on its own.
 */
export function createEpisodeTransport(
  getAccessToken: () => string | undefined
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>(
    aiRequestOptions(EPISODE_API_PATH, getAccessToken)
  );
}
