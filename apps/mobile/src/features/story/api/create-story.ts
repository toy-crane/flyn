import {
  DefaultChatTransport,
  parseJsonEventStream,
  type UIMessage,
  uiMessageChunkSchema,
} from "ai";

import type { StoryOutline } from "@/features/story/ui/story-outline-card";
import { aiRequestOptions } from "@/shared/ai/request-options";

export const CREATE_STORY_API_PATH = "/ai/episode/create";
export const SAVE_STORY_API_PATH = "/ai/episode/stories";

/** 스토리 카드가 흐르는 조각의 이름. 서버가 붙이는 이름과 같아야 한다. */
export const OUTLINE_PART_TYPE = "tool-proposeStory";

/**
 * 스토리를 같이 만드는 대화가 서버와 말하는 방법.
 *
 * 서버는 이 대화를 저장하지 않는다. 지난 카드도 대화 기록 안의 조각으로만
 * 남으므로, 요청마다 지금까지의 대화 전체가 함께 간다.
 */
export function createStoryTransport(
  getAccessToken: () => string | undefined
): DefaultChatTransport<UIMessage> {
  return new DefaultChatTransport<UIMessage>(
    aiRequestOptions(CREATE_STORY_API_PATH, getAccessToken)
  );
}

/** 저장이 끝난 뒤 앱이 바로 여는 자리. */
export interface MadeStory {
  episodeId: string;
  storyId: string;
}
export type StoryCreationStage = "script" | "cover" | "saving";

function readCreationStage(data: unknown): StoryCreationStage {
  const stage = (data as { stage?: unknown } | null)?.stage;
  if (stage !== "script" && stage !== "cover" && stage !== "saving") {
    throw new Error("Unknown story stage.");
  }
  return stage;
}
function readMadeStory(value: unknown): MadeStory {
  const data = value as Partial<MadeStory> | null;
  if (typeof data?.storyId !== "string" || typeof data.episodeId !== "string") {
    throw new Error("Invalid created story.");
  }
  return { episodeId: data.episodeId, storyId: data.storyId };
}

/**
 * 확정한 개요로 각본을 만들어 저장한다.
 *
 * 저장은 이 요청에서 처음 일어난다. 카드가 몇 번 바뀌어도 여기까지 오지 않으면
 * 어디에도 스토리가 생기지 않는다. 실패하면 아무것도 남지 않는다.
 */
export async function saveStory(
  accessToken: string,
  outline: StoryOutline,
  onProgress?: (stage: StoryCreationStage) => void
): Promise<MadeStory> {
  const options = aiRequestOptions(SAVE_STORY_API_PATH, () => accessToken);
  const response = await options.fetch(options.api, {
    body: JSON.stringify({ outline }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Making the story failed with ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Story stream is missing.");
  }
  const reader = parseJsonEventStream({
    schema: uiMessageChunkSchema,
    stream: response.body,
  }).getReader();
  let made: MadeStory | undefined;
  try {
    for (;;) {
      // biome-ignore lint/performance/noAwaitInLoops: 서버가 알린 단계 순서를 그대로 따른다
      const next = await reader.read();
      if (next.done) {
        break;
      }
      if (!next.value.success) {
        throw next.value.error;
      }
      const part = next.value.value;
      if (part.type === "error") {
        throw new Error(part.errorText);
      }
      if (part.type === "data-story-progress") {
        onProgress?.(readCreationStage(part.data));
      }
      if (part.type === "data-story-created") {
        made = readMadeStory(part.data);
      }
    }
  } finally {
    reader.releaseLock();
  }
  if (!made) {
    throw new Error("Story creation did not finish.");
  }
  return made;
}

/**
 * 메시지 하나에 실린 스토리 카드를 읽는다.
 *
 * 조각이 아직 오는 중이면 `input`이 반쪽이라 그리지 않는다. 반쪽 카드는 인물이
 * 하나씩 나타나는 것처럼 보여 다 만들어진 카드와 구별되지 않는다.
 */
export function outlineOfMessage(message: UIMessage): StoryOutline | undefined {
  const part = message.parts.find(
    (candidate) => candidate.type === OUTLINE_PART_TYPE
  ) as { input?: unknown; state?: string } | undefined;

  if (!part || part.state === "input-streaming") {
    return;
  }

  const outline = part.input as Partial<StoryOutline> | undefined;

  if (
    typeof outline?.title !== "string" ||
    typeof outline.hook !== "string" ||
    typeof outline.cover !== "string" ||
    !(Array.isArray(outline.characters) && Array.isArray(outline.episodes))
  ) {
    return;
  }

  return {
    characters: outline.characters,
    cover: outline.cover,
    episodes: outline.episodes,
    hook: outline.hook,
    // 카드에 보이지 않지만 표지 그림이 쓴다. 서버까지 그대로 넘긴다.
    setting: outline.setting,
    title: outline.title,
  };
}

/** 대화에 남은 카드 중 가장 최근 것을 든 메시지. `대화 시작하기`가 여기 붙는다. */
export function latestOutline(
  messages: readonly UIMessage[]
): { messageId: string; outline: StoryOutline } | undefined {
  for (let at = messages.length - 1; at >= 0; at -= 1) {
    const message = messages[at];
    const outline = message ? outlineOfMessage(message) : undefined;

    if (message && outline) {
      return { messageId: message.id, outline };
    }
  }
}
