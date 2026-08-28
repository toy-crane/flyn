import type { UIMessage } from "ai";

import type { NextEpisode } from "@/features/episode/api/story";
import { aiUrl } from "@/shared/ai/request-options";

export interface EpisodeSession {
  episode: NextEpisode;
  messages: UIMessage[];
  readOnly: boolean;
}

/** How a stopped client snapshot should meet the server's saved transcript. */
export type EpisodeStopMode = "preserve" | "replace";

export async function readEpisodeSession(
  accessToken: string,
  episodeId: string
): Promise<EpisodeSession> {
  const response = await fetch(aiUrl(`/ai/episode/${episodeId}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Reading the episode failed with ${response.status}`);
  }

  return (await response.json()) as EpisodeSession;
}

/**
 * 중지 뒤 화면에 남은 장면을 서버 기록과 한 번 더 맞춘다.
 *
 * 답변이 시작된 뒤에는 서버의 더 긴 기록을 지켜야 하지만, 다시 받기가 아직
 * 답변을 시작하지 않았다면 잘라 낸 목록 자체가 새 기록이다. 서버가 둘을
 * 구분할 수 있도록 현재 요청이 답변 다시 받기인지 함께 보낸다.
 */
export async function saveStoppedEpisodeSession(
  accessToken: string,
  episodeId: string,
  messages: UIMessage[],
  mode: EpisodeStopMode,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(aiUrl(`/ai/episode/${episodeId}`), {
    body: JSON.stringify({ messages, mode }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    method: "PUT",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Saving the stopped episode failed with ${response.status}`
    );
  }
}
