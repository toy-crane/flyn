import { aiUrl } from "@/shared/ai/request-options";

const NOTE_PATH = "/ai/episode/saved-expressions";

/** 담아 둔 표현 하나가 짚는 자리. 원문과 고친 문장에 하나씩 쓴다. */
export interface SavedExpressionEntry {
  fixed: string;
  original: string;
  why: string;
}

/** 담을 수 있는 출처. 카드의 모양을 이것이 정한다. */
export type SavedExpressionKind = "utterance" | "correction" | "guidance";

/**
 * 표현 노트의 카드 하나.
 *
 * 세 출처가 공통 값을 나눠 쓰고 종류마다 필요한 것만 더한다. 인물 대사는
 * 한국어 뜻과 화자를, 영어 교정과 한국어 안내는 내가 쓴 원문과 짚을 자리를
 * 가진다. 어느 쪽인지는 `kind`가 말한다.
 */
export interface SavedExpression {
  english: string;
  entries: SavedExpressionEntry[] | null;
  episodeNumber: number;
  id: string;
  kind: SavedExpressionKind;
  meaning: string | null;
  original: string | null;
  speaker: string | null;
  storyTitle: string;
}

/** 계정에 담긴 표현을 최근 담은 것부터 읽는다. */
export async function readExpressionNote(
  accessToken: string
): Promise<SavedExpression[]> {
  const response = await fetch(aiUrl(NOTE_PATH), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Reading the expression note failed with ${response.status}`
    );
  }

  return (await response.json()) as SavedExpression[];
}

/**
 * 담아 둔 것 하나를 지운다.
 *
 * 대화의 책갈피를 다시 누르는 취소와 같은 자리로 간다. 대화와 노트는 서로를
 * 부르지 않으므로 그 문장을 여기서 한 번 더 쓴다.
 */
export async function eraseSavedExpression(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await fetch(
    `${aiUrl(NOTE_PATH)}/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(`Erasing the expression failed with ${response.status}`);
  }
}
