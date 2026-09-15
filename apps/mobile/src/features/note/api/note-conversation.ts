import type { UIMessage } from "ai";

import { aiUrl } from "@/shared/ai/request-options";
import type { SavedExpressionConversation } from "./expression-note";

const NOT_FOUND = 404;

/**
 * 담아 둔 표현이 나온 대화를, 그 표현이 나온 메시지까지 읽는다.
 *
 * 노트는 두 곳에서 이것을 쓴다. `대화에서 보기`를 누르면 그 대화가 아직 있는지
 * 확인하고, `AI에게 물어보기`는 여기서 읽은 대화를 문맥으로 싣는다. 뒤의 대화는
 * 표현을 이해하는 데 필요하지 않아 싣지 않는다.
 *
 * 대화가 지워졌거나 그 메시지가 다시 받기와 수정으로 사라졌으면 `null`이다. 연결이
 * 끊긴 것 같은 다른 실패는 없는 대화로 바꾸지 않고 그대로 알린다. 없는 대화로
 * 답하면 노트가 멀쩡한 대화의 입구를 숨긴다.
 *
 * 대화 화면과 같은 경로를 읽지만 그 기능을 부르지 않는다. 한 기능은 다른 기능을
 * import하지 않으므로 경로를 여기서 한 번 더 쓴다.
 */
export async function readNoteConversation(
  accessToken: string,
  conversation: SavedExpressionConversation,
  signal?: AbortSignal
): Promise<UIMessage[] | null> {
  const path = `/ai/episode/${conversation.episodeId}?storyPlayId=${encodeURIComponent(conversation.storyPlayId)}`;
  const response = await fetch(aiUrl(path), {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });

  if (response.status === NOT_FOUND) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Reading the saved expression's conversation failed with ${response.status}`
    );
  }

  const { messages } = (await response.json()) as { messages: UIMessage[] };
  const at = messages.findIndex(
    (message) => message.id === conversation.messageId
  );

  return at < 0 ? null : messages.slice(0, at + 1);
}
