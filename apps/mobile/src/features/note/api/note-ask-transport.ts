import { DefaultChatTransport, type UIMessage } from "ai";

import { aiRequestOptions } from "@/shared/ai/request-options";
import type { SavedExpression } from "./expression-note";

/** 대화에서 연 질문과 같은 자리. 한 기능은 다른 기능을 부르지 않으므로 여기 한 번 더 쓴다. */
const NOTE_ASK_API_PATH = "/ai/episode/ask";

/**
 * 표현 노트에서 담아 둔 표현 하나를 두고 묻는 대화가 서버와 말하는 방법.
 *
 * 요청마다 두 가지가 함께 간다. 출처는 저장한 표현이다. 인물 대사면 화자, 영어
 * 원문과 뜻이고, 교정과 안내면 내가 쓴 원문, 고친 문장과 짚은 자리다. 그리고 그
 * 표현이 나온 원래 대화가 질문 앞에 붙는다. 서버는 이 대화를 저장하지 않는다.
 *
 * 원래 대화는 첫 질문을 보낼 때 한 번 읽고 그 뒤로는 다시 읽지 않는다. 같은
 * 질문창에서 나누는 말이 같은 문맥 위에 쌓여야 앞의 답과 뒤의 답이 어긋나지 않는다.
 * 대화나 메시지가 지워졌으면 읽는 쪽이 빈 대화를 주고, 질문은 저장한 표현만으로
 * 간다. 읽기가 실패하면 그 질문은 실패로 끝나고 다시 보낼 때 다시 읽는다.
 */
export function createNoteAskTransport(
  getAccessToken: () => string | undefined,
  expression: SavedExpression,
  readContext: () => Promise<UIMessage[]>
): DefaultChatTransport<UIMessage> {
  let context: Promise<UIMessage[]> | undefined;
  const contextOnce = () => {
    context ??= readContext().catch((error: unknown) => {
      context = undefined;
      throw error;
    });

    return context;
  };

  return new DefaultChatTransport<UIMessage>({
    ...aiRequestOptions(NOTE_ASK_API_PATH, getAccessToken),
    prepareSendMessagesRequest: async ({
      body,
      id,
      messageId,
      messages,
      trigger,
    }) => ({
      body: {
        ...body,
        ...(expression.kind === "dialogue"
          ? {
              utterance: {
                meaning: expression.meaning ?? "",
                speaker: expression.speaker ?? "",
                text: expression.english,
              },
            }
          : {
              correction: {
                entries: expression.entries ?? [],
                fixed: expression.english,
                original: expression.original ?? "",
              },
            }),
        id,
        messageId,
        messages: [...(await contextOnce()), ...messages],
        trigger,
      },
    }),
  });
}
