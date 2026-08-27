import type { UIMessage } from "ai";

import type { NextEpisode } from "@/features/episode/api/story";
import { aiUrl } from "@/shared/ai/request-options";

export interface EpisodeSession {
  episode: NextEpisode;
  messages: UIMessage[];
  readOnly: boolean;
}

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
