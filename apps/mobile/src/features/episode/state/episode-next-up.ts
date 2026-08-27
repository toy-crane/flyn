import type { UIMessage } from "ai";

/** What comes after the episode that just ended. */
export interface EpisodeNextUp {
  copy: string;
  /** The next episode's id, or null once the story is finished. */
  episodeId: string | null;
  number: number | null;
  title: string;
}

/**
 * The preview the server sent with the ending, if it sent one.
 *
 * 예고는 각본에 미리 쓴 글이라 결말과 같은 응답에 실려 온다. 마무리 화면이
 * 진행을 다시 읽어 올 때까지 예고 자리가 비어 있지 않고, 마지막 화 뒤에는
 * 예고 대신 스토리 완주 안내가 같은 자리로 온다.
 */
export function nextUpOfEpisode(
  messages: UIMessage[]
): EpisodeNextUp | undefined {
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "data-next-up") {
        continue;
      }

      const data = part.data as
        | {
            copy?: unknown;
            episodeId?: unknown;
            number?: unknown;
            title?: unknown;
          }
        | null
        | undefined;
      const episodeId = data?.episodeId;
      const number = data?.number;

      if (
        typeof data?.copy === "string" &&
        typeof data.title === "string" &&
        (episodeId === null || typeof episodeId === "string") &&
        (number === null || typeof number === "number")
      ) {
        return { copy: data.copy, episodeId, number, title: data.title };
      }
    }
  }
}
