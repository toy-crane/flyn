import {
  DefaultChatTransport,
  type PrepareSendMessagesRequest,
  type UIMessage,
} from "ai";

import { aiRequestOptions } from "@/shared/ai/request-options";

export const CHAT_API_PATH = "/ai/chat";

/** How the app talks to `POST /ai/chat` for a conversation of its own. */
export function createChatTransport(
  getAccessToken: () => string | undefined
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>(
    aiRequestOptions(CHAT_API_PATH, getAccessToken)
  );
}

/**
 * The parent conversation in front of the side chat's own messages.
 *
 * This is the whole of what a side chat adds to the protocol: the same body
 * the transport would have built on its own, with the snapshot ahead of
 * `messages`. Everything else is passed through, so a side chat request stays
 * the request the route already answers.
 */
export function prependParentSnapshot(
  snapshot: UIMessage[]
): PrepareSendMessagesRequest<UIMessage> {
  return ({ body, id, messageId, messages, trigger }) => ({
    body: {
      ...body,
      id,
      messageId,
      messages: [...snapshot, ...messages],
      trigger,
    },
  });
}

/**
 * How a side chat talks to the same route, carrying the parent conversation.
 *
 * The snapshot goes with every request, so the model reads the conversation
 * the phrase came from without any of it entering the side chat's own message
 * list. It is fixed when the side chat opens and never written back: the
 * server stores nothing and this transport asks it for nothing.
 */
export function createSideChatTransport(
  getAccessToken: () => string | undefined,
  snapshot: UIMessage[]
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(CHAT_API_PATH, getAccessToken),
    prepareSendMessagesRequest: prependParentSnapshot(snapshot),
  });
}
