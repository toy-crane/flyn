import type { UIMessage } from "ai";

/** 에피소드를 닫은 판정. 서버가 사건이 끝났다고 본 순간 한 번만 온다. */
export interface EpisodeEnding {
  /** 결말의 종류. 성공, 타협, 실패 중 하나다. */
  kind: string;
  /** 사건의 결과 한 줄. */
  outcome: string;
}

/**
 * 에피소드가 끝났는지, 끝났다면 어떤 결말인지.
 *
 * 결말은 장면 안의 글이 아니라 별도의 part로 온다. 그래서 화면은 대사를 읽어
 * 짐작하지 않고 이 part가 있는지만 보면 되고, 없으면 사건은 아직 진행 중이다.
 * 서버가 형식을 어긴 part를 보내면 결말이 없는 마무리 화면이 열리므로, 두 값이
 * 다 갖춰졌을 때만 끝난 것으로 본다.
 */
export function endingOfEpisode(
  messages: UIMessage[]
): EpisodeEnding | undefined {
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "data-ending") {
        continue;
      }

      const data = part.data as
        | { kind?: unknown; outcome?: unknown }
        | null
        | undefined;

      if (typeof data?.kind === "string" && typeof data.outcome === "string") {
        return { kind: data.kind, outcome: data.outcome };
      }
    }
  }
}
