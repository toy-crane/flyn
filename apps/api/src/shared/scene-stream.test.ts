import { describe, expect, test } from "bun:test";

import type { UIMessageChunk, UIMessageStreamWriter } from "ai";

import { speakerModelText, streamSceneText } from "./scene-stream";

const CAST = { cast: ["만복", "준호", "세라"] } as const;
const ENDING_SCENE = {
  cast: ["Mia"],
  endings: ["성공", "타협", "실패"],
} as const;
const RECORDING_SCENE = {
  cast: ["Mia"],
  endings: ["성공", "타협", "실패"],
  notes: ["선택", "관계", "질문", "수준"],
} as const;

// biome-ignore-start lint/suspicious/useAwait: 파서가 받는 것과 같은 비동기 스트림 형태가 필요하다
async function* deltas(parts: string[]): AsyncIterable<string> {
  for (const part of parts) {
    yield part;
  }
}
// biome-ignore-end lint/suspicious/useAwait: 파서가 받는 것과 같은 비동기 스트림 형태가 필요하다

function collectingWriter(): {
  chunks: UIMessageChunk[];
  writer: UIMessageStreamWriter;
} {
  const chunks: UIMessageChunk[] = [];

  return {
    chunks,
    writer: {
      merge: () => {
        throw new Error("The scene parser never merges streams.");
      },
      onError: undefined,
      write: (chunk) => {
        chunks.push(chunk);
      },
    },
  };
}

/** Reassembles the emitted chunks into (speaker, text) segments. */
function segmentsOf(chunks: UIMessageChunk[]) {
  const segments: { name: string | null; text: string }[] = [];

  for (const chunk of chunks) {
    if (chunk.type === "data-speaker") {
      segments.push({
        name: (chunk.data as { name: string | null }).name,
        text: "",
      });
    }

    if (chunk.type === "text-delta") {
      const current = segments.at(-1);

      if (!current) {
        throw new Error("A text delta arrived before any speaker part.");
      }

      current.text += chunk.delta;
    }
  }

  return segments;
}

/** Reads the one part that carries the scene's ending, if it arrived. */
function endingOf(chunks: UIMessageChunk[]) {
  for (const chunk of chunks) {
    if (chunk.type === "data-ending") {
      return chunk.data as { kind: string; outcome: string };
    }
  }
}

describe("streamSceneText", () => {
  test("splits speaker lines and narration even when names arrive in pieces", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas([
        "국물 김이 ",
        "오른다.\n만",
        "복: 어서 와",
        ".\n준호: 사장님, 저",
        "도요.",
      ]),
      CAST,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([
      { name: null, text: "국물 김이 오른다." },
      { name: "만복", text: "어서 와." },
      { name: "준호", text: "사장님, 저도요." },
    ]);
  });

  test("keeps consecutive lines of one speaker in one segment", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas(["세라: 오늘도 야근이에요.\n세라: 국수 하나 주세요.\n"]),
      CAST,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([
      { name: "세라", text: "오늘도 야근이에요.\n국수 하나 주세요." },
    ]);
  });

  test("treats an unknown name as narration instead of a new speaker", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(deltas(["길동: 나도 한 그릇 주쇼.\n"]), CAST, writer);

    expect(segmentsOf(chunks)).toEqual([
      { name: null, text: "길동: 나도 한 그릇 주쇼." },
    ]);
  });

  test("closes every opened text part", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(deltas(["만복: 어서 와.\n비가 온다."]), CAST, writer);

    const starts = chunks.filter((chunk) => chunk.type === "text-start");
    const ends = chunks.filter((chunk) => chunk.type === "text-end");

    expect(starts).toHaveLength(2);
    expect(ends).toHaveLength(2);
  });

  test("turns an ending line into the scene's ending instead of an utterance", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas([
        "Mia: Here, let me remake that.\n",
        "직원이 새 잔을 집는다.\n",
        "성공: 원하던 커피를 새로 받아냈다.\n",
      ]),
      ENDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([
      { name: "Mia", text: "Here, let me remake that." },
      { name: null, text: "직원이 새 잔을 집는다." },
    ]);
    expect(endingOf(chunks)).toEqual({
      kind: "성공",
      outcome: "원하던 커피를 새로 받아냈다.",
    });
  });

  test("leaves a scene that is still running without an ending", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas(["Mia: What can I get you?"]),
      ENDING_SCENE,
      writer
    );

    expect(endingOf(chunks)).toBeUndefined();
  });

  // 결말 줄이 조각조각 도착해도 말풍선으로 새지 않아야 한다. 판정이 끝나기
  // 전에 흘려보내면 화면에 결말이 대사처럼 남는다.
  test("collects an ending that arrives in pieces", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas(["타", "협: 뜨거운 라떼를 ", "그냥 받았다."]),
      ENDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([]);
    expect(endingOf(chunks)).toEqual({
      kind: "타협",
      outcome: "뜨거운 라떼를 그냥 받았다.",
    });
  });

  // 두 번째 결말 줄이 조각조각 도착해도 처음 판정에 덧붙지 않아야 한다.
  test("never lets a later ending leak into the first", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas(["실패: 아무것도 얻지 못했다.\n실패: 다시", " 실패했다.\n"]),
      ENDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([]);
    expect(endingOf(chunks)).toEqual({
      kind: "실패",
      outcome: "아무것도 얻지 못했다.",
    });
  });

  // 결말은 사건이 끝났다는 한 번의 판정이다. 모델이 두 번 쓰면 처음 것만 남기고
  // 나머지는 화면에 흘리지 않는다.
  test("keeps the first ending and never shows a later one", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(
      deltas(["실패: 아무것도 얻지 못했다.\n실패: 다시 실패했다.\n"]),
      ENDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([]);
    expect(endingOf(chunks)).toEqual({
      kind: "실패",
      outcome: "아무것도 얻지 못했다.",
    });
  });

  // 기록 줄은 화면에 흐르지 않고 반환값으로만 온다. 결말 뒤에 오므로 결말을
  // 넘겨받는 쪽은 이미 다 모인 기록을 함께 본다.
  test("keeps note lines off the screen and returns them instead", async () => {
    const { chunks, writer } = collectingWriter();

    const outcome = await streamSceneText(
      deltas([
        "Mia: Here you go.\n",
        "성공: 원하던 커피를 새로 받아냈다.\n",
        "선택: 영수증을 보여 주며 침착하게 요구했다.\n",
        "관계: Mia가 실수를 인정했다.\n",
        "질문: 내일도 이 카페에 들를지.\n",
        "수준: 중급 초반. 짧고 분명한 문장을 쓴다.",
      ]),
      RECORDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([{ name: "Mia", text: "Here you go." }]);
    expect(outcome.notes).toEqual({
      관계: "Mia가 실수를 인정했다.",
      선택: "영수증을 보여 주며 침착하게 요구했다.",
      수준: "중급 초반. 짧고 분명한 문장을 쓴다.",
      질문: "내일도 이 카페에 들를지.",
    });
  });

  test("collects a note that arrives in pieces", async () => {
    const { chunks, writer } = collectingWriter();

    const outcome = await streamSceneText(
      deltas(["성공: 받아냈다.\n선", "택: 침착하게 ", "요구했다."]),
      RECORDING_SCENE,
      writer
    );

    expect(segmentsOf(chunks)).toEqual([]);
    expect(outcome.notes.선택).toBe("침착하게 요구했다.");
  });

  test("keeps the first note when the same one arrives twice", async () => {
    const { writer } = collectingWriter();

    const outcome = await streamSceneText(
      deltas(["선택: 먼저 쓴 줄.\n선택: 나중에 쓴 줄.\n"]),
      RECORDING_SCENE,
      writer
    );

    expect(outcome.notes.선택).toBe("먼저 쓴 줄.");
  });

  // 기록을 쓰지 않은 장면도 끝난 장면이다. 결말만 남고 기억이 비는 것이지
  // 장면이 깨지지는 않는다.
  test("closes a scene that wrote no notes at all", async () => {
    const { writer } = collectingWriter();

    const outcome = await streamSceneText(
      deltas(["성공: 받아냈다."]),
      RECORDING_SCENE,
      writer
    );

    expect(outcome.ending?.kind).toBe("성공");
    expect(outcome.notes).toEqual({});
  });

  test("keeps a note tag out of a scene that has none", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(deltas(["선택: 국수를 골랐다.\n"]), CAST, writer);

    expect(segmentsOf(chunks)).toEqual([
      { name: null, text: "선택: 국수를 골랐다." },
    ]);
  });

  test("keeps an ending tag out of a scene that has none", async () => {
    const { chunks, writer } = collectingWriter();

    await streamSceneText(deltas(["성공: 국수를 다 먹었다.\n"]), CAST, writer);

    expect(segmentsOf(chunks)).toEqual([
      { name: null, text: "성공: 국수를 다 먹었다." },
    ]);
    expect(endingOf(chunks)).toBeUndefined();
  });
});

describe("speakerModelText", () => {
  test("restores a speaker as a screenplay line head", () => {
    expect(speakerModelText({ name: "만복" })).toBe("\n만복: ");
  });

  test("restores narration as a bare line break", () => {
    expect(speakerModelText({ name: null })).toBe("\n");
    expect(speakerModelText(undefined)).toBe("\n");
  });
});
