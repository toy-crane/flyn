import { describe, expect, test } from "bun:test";

import type { UIMessageChunk, UIMessageStreamWriter } from "ai";

import { speakerModelText, streamSceneText } from "./scene-stream";

const CAST = ["만복", "준호", "세라"] as const;

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
