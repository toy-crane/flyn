import { aiUrl } from "@/shared/ai/request-options";

/** 담을 수 있는 출처. 화면에 그대로 보이지 않으므로 영어 키를 쓴다. */
export type SavedExpressionKind = "utterance" | "correction" | "guidance";

/**
 * 대화에서 담아 둔 표현 하나를 가리키는 이름표.
 *
 * 어느 자리의 책갈피를 채울지와 취소할 때 무엇을 지울지가 여기 다 있다. 문장과
 * 뜻은 오지 않는다. 그것을 읽는 곳은 표현 노트다.
 */
export interface SavedExpressionRef {
  id: string;
  kind: SavedExpressionKind;
  messageId: string;
  /** 인물 대사는 장면 안의 몇 번째 대사인지, 나머지는 없다. */
  utteranceAt: number | null;
}

/**
 * 담을 자리 하나를 가리키는 말.
 *
 * 인물 대사는 메시지와 그 안의 대사 자리로, 배울 표현은 메시지 하나로 정해진다.
 * 영어 교정인지 한국어 안내인지는 서버가 가르므로 여기서 말하지 않는다.
 */
export type SavedExpressionSpot =
  | { kind: "utterance"; messageId: string; utteranceAt: number }
  | { kind: "learning"; messageId: string };

/** 같은 자리를 가리키는 두 이름표가 같은 열쇠를 만든다. */
export function spotKey(spot: SavedExpressionSpot): string {
  return spot.kind === "utterance"
    ? `${spot.messageId}:${spot.utteranceAt}`
    : `${spot.messageId}:learning`;
}

/** 서버가 돌려준 이름표가 가리키는 자리. */
export function spotOfRef(saved: SavedExpressionRef): SavedExpressionSpot {
  return saved.kind === "utterance" && saved.utteranceAt !== null
    ? {
        kind: "utterance",
        messageId: saved.messageId,
        utteranceAt: saved.utteranceAt,
      }
    : { kind: "learning", messageId: saved.messageId };
}

const SAVED_PATH = "/ai/episode/saved-expressions";

/**
 * 표현 하나를 담는다.
 *
 * 자리만 보낸다. 화면에 보이는 영어와 화자는 서버가 저장된 대화에서 다시
 * 읽으므로, 여기서 실어 보낼 글이 없다.
 */
export async function saveExpression(
  accessToken: string | undefined,
  storyPlayId: string,
  episodeId: string,
  spot: SavedExpressionSpot,
  signal: AbortSignal
): Promise<SavedExpressionRef> {
  const response = await fetch(aiUrl(SAVED_PATH), {
    body: JSON.stringify({
      episodeId,
      storyPlayId,
      ...spot,
    }),
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    method: "POST",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Saving the expression failed with ${response.status}`);
  }

  const saved = (await response.json()) as Partial<SavedExpressionRef> | null;

  if (
    typeof saved?.id !== "string" ||
    typeof saved.messageId !== "string" ||
    typeof saved.kind !== "string"
  ) {
    throw new Error("The saved expression came back in an unknown shape.");
  }

  return {
    id: saved.id,
    kind: saved.kind as SavedExpressionKind,
    messageId: saved.messageId,
    utteranceAt:
      typeof saved.utteranceAt === "number" ? saved.utteranceAt : null,
  };
}

/** 담아 둔 것 하나를 도로 놓는다. 책갈피를 다시 누르면 여기로 온다. */
export async function eraseSavedExpression(
  accessToken: string | undefined,
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(
    `${aiUrl(SAVED_PATH)}/${encodeURIComponent(id)}`,
    {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      method: "DELETE",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Erasing the expression failed with ${response.status}`);
  }
}
