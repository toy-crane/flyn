import { DefaultChatTransport, type UIMessage } from "ai";

import { aiRequestOptions } from "@/shared/ai/request-options";

export const EPISODE_API_PATH = "/ai/episode";

/**
 * How the app talks to `POST /ai/episode`.
 *
 * Only what the person just wrote goes out. The server reads the scene so far
 * from its own record, so a request stays the same size however long the
 * conversation grows, and a scene the app rewrote locally cannot become the
 * record.
 *
 * `keepThrough` names the last message the app still agrees with. The server
 * drops everything it stored after that one, which is what makes a retry or an
 * edit remove the answers they replace. The SDK trims its own list before a
 * regeneration, so the same last-message rule covers all three cases: a new
 * question, an edited one, and a retry.
 *
 * `getEpisodeId` rides along so the request says which episode the screen thinks
 * it is playing. The server decides on its own from the account's progress and
 * refuses a request that names a different one, which is how a screen left
 * behind by a finished episode fails loudly instead of quietly playing the
 * wrong scene. It is a function for the same reason the token is: the transport
 * resolves the body on every send.
 *
 * 회차가 있으면 그 회차를 이어가고, 없으면 어느 스토리인지만 말한다. 새 대화의
 * 회차는 서버가 첫 사용자 메시지에서 만들고, 만든 id를 응답으로 알려 준다.
 * 그래서 첫 장면만 보고 나오면 기록에 아무 줄도 생기지 않는다.
 *
 * 교정 기록이나 원문은 별도로 싣지 않는다. 표현 확인 경로는 저장된 사용자
 * 메시지를 읽고, 반복된 실수도 메시지마다 확인한다.
 */
export function createEpisodeTransport(
  getAccessToken: () => string | undefined,
  getEpisodeId: () => string | undefined,
  getRunId: () => string | undefined,
  getStoryId: () => string | undefined
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(EPISODE_API_PATH, getAccessToken),
    prepareSendMessagesRequest: ({ messages, trigger }) => {
      const episodeId = getEpisodeId();
      const runId = getRunId();
      const where = runId === undefined ? { storyId: getStoryId() } : { runId };

      if (trigger === "regenerate-message") {
        return {
          body: {
            ...where,
            episodeId,
            keepThrough: messages.at(-1)?.id ?? null,
          },
        };
      }

      return {
        body: {
          ...where,
          episodeId,
          keepThrough: messages.at(-2)?.id ?? null,
          message: messages.at(-1),
        },
      };
    },
  });
}
