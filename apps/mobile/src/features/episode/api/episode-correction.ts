/** 배울 표현 하나. 서버가 보낸 모양 그대로다. */
export interface CorrectionEntry {
  /** 고친 문장에서 이 표현에 해당하는 조각. */
  fixed: string;
  /** 원문에서 어긋난 조각. */
  original: string;
  /** 같은 패턴을 두 번 만들지 않으려고 서버가 쓰는 키. 화면에 보이지 않는다. */
  pattern: string;
  /** 왜 그런지 한국어 한 줄. */
  why: string;
}

/** 사용자 메시지 하나에 붙는 교정. */
export interface EpisodeCorrection {
  entries: CorrectionEntry[];
  /** 모든 수정을 반영한 고친 문장 하나. */
  fixed: string;
  /** 이 교정이 붙는 사용자 메시지의 ID. */
  messageId: string;
  /** 사용자가 쓴 원문. */
  original: string;
}

function isEntry(value: unknown): value is CorrectionEntry {
  const entry = value as Partial<CorrectionEntry> | null;

  return (
    typeof entry?.fixed === "string" &&
    typeof entry.original === "string" &&
    typeof entry.pattern === "string" &&
    typeof entry.why === "string"
  );
}

/**
 * 장면 스트림으로 온 값을 교정으로 읽는다.
 *
 * 모양이 맞지 않으면 아무것도 돌려주지 않는다. 교정은 장면과 나란히 오는
 * 곁다리라, 읽지 못한 값 하나가 진행 중인 이야기를 멈추게 두지 않는다.
 */
export function correctionOfData(data: unknown): EpisodeCorrection | undefined {
  const sent = data as Partial<EpisodeCorrection> | null | undefined;

  if (
    typeof sent?.fixed !== "string" ||
    typeof sent.messageId !== "string" ||
    typeof sent.original !== "string" ||
    !Array.isArray(sent.entries) ||
    sent.entries.length === 0 ||
    !sent.entries.every(isEntry)
  ) {
    return;
  }

  return {
    entries: sent.entries,
    fixed: sent.fixed,
    messageId: sent.messageId,
    original: sent.original,
  };
}
