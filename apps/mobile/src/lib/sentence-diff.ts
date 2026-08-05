/**
 * 개선 문장에서 **바뀐 자리**를 찾는다. 밑줄은 Apple Writing Tools처럼 이미
 * 적용된 변경을 뜻하므로 개선 문장에만 붙고, 어디가 바뀌었는지 스스로 말해야
 * 한다. 말풍선 본문에는 밑줄을 넣지 않는다.
 */

const WHITESPACE = /^\s+$/u;
const WORD_BOUNDARY = /(\s+)/u;
/** 앞뒤 공백과 그 사이의 본문. 밑줄이 낱말 밖으로 새지 않게 갈라 놓는다. */
const PADDED_TEXT = /^(\s*)([\S\s]*?)(\s*)$/u;

/** 개선 문장의 한 도막. `changed`인 도막에만 밑줄이 간다. */
export interface SentenceSegment {
  changed: boolean;
  text: string;
}

interface DiffOp {
  kind: "insert" | "keep" | "remove";
  token: string;
}

/** 낱말과 그 사이의 공백을 함께 남긴다. 도막을 이어 붙이면 원문 그대로가 된다. */
function tokenize(sentence: string): string[] {
  return sentence.split(WORD_BOUNDARY).filter((token) => token.length > 0);
}

function lcsLengths(left: string[], right: string[]): number[][] {
  const table: number[][] = Array.from({ length: left.length + 1 }, () =>
    new Array<number>(right.length + 1).fill(0)
  );

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      const rows = table[i] ?? [];
      const next = table[i + 1] ?? [];

      rows[j] =
        left[i] === right[j]
          ? (next[j + 1] ?? 0) + 1
          : Math.max(next[j] ?? 0, rows[j + 1] ?? 0);
    }
  }

  return table;
}

/** 가장 긴 공통 부분을 그대로 두고 나머지만 바뀐 것으로 본다. */
function diffTokens(before: string[], after: string[]): DiffOp[] {
  const table = lcsLengths(before, after);
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;

  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      ops.push({ kind: "keep", token: after[j] ?? "" });
      i += 1;
      j += 1;
      continue;
    }

    if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      ops.push({ kind: "remove", token: before[i] ?? "" });
      i += 1;
      continue;
    }

    ops.push({ kind: "insert", token: after[j] ?? "" });
    j += 1;
  }

  for (; i < before.length; i += 1) {
    ops.push({ kind: "remove", token: before[i] ?? "" });
  }

  for (; j < after.length; j += 1) {
    ops.push({ kind: "insert", token: after[j] ?? "" });
  }

  return ops;
}

/**
 * 낱말 하나가 다른 낱말 하나로 바뀌었으면 앞뒤 공통 부분을 덜어 낸다.
 * `Sound`가 `Sounds`가 됐을 때 밑줄이 붙는 곳은 `s` 하나다.
 */
function refineWord(before: string, after: string): SentenceSegment[] {
  const from = Array.from(before);
  const to = Array.from(after);
  let head = 0;

  while (head < from.length && head < to.length && from[head] === to[head]) {
    head += 1;
  }

  let tail = 0;

  while (
    tail < from.length - head &&
    tail < to.length - head &&
    from.at(-1 - tail) === to.at(-1 - tail)
  ) {
    tail += 1;
  }

  const middle = to.slice(head, to.length - tail).join("");

  // 덜어 내기만 한 변경은 밑줄을 그을 자리가 없다. 낱말 전체를 짚는다.
  if (middle.length === 0) {
    return [{ changed: true, text: after }];
  }

  return [
    { changed: false, text: to.slice(0, head).join("") },
    { changed: true, text: middle },
    { changed: false, text: to.slice(to.length - tail).join("") },
  ];
}

function blockSegments(
  removed: string[],
  inserted: string[]
): SentenceSegment[] {
  // 낱말이 1:1로 갈렸을 때만 낱말 안까지 들어간다. 그 밖에는 새로 온 낱말을
  // 통째로 짚는다.
  if (removed.length === inserted.length) {
    return inserted.flatMap((token, index) =>
      refineWord(removed[index] ?? "", token)
    );
  }

  return inserted.map((token) => ({ changed: true, text: token }));
}

/** 공백에는 밑줄을 긋지 않는다. 밑줄이 낱말 밖으로 새어 나가 보인다. */
function releaseWhitespace(segment: SentenceSegment): SentenceSegment[] {
  if (!segment.changed) {
    return [segment];
  }

  const [, head = "", body = "", tail = ""] =
    PADDED_TEXT.exec(segment.text) ?? [];

  return [
    { changed: false, text: head },
    { changed: true, text: body },
    { changed: false, text: tail },
  ];
}

function mergeSegments(segments: SentenceSegment[]): SentenceSegment[] {
  const merged: SentenceSegment[] = [];

  for (const segment of segments) {
    if (segment.text.length === 0) {
      continue;
    }

    const last = merged.at(-1);

    if (last?.changed === segment.changed) {
      last.text += segment.text;
      continue;
    }

    merged.push({ ...segment });
  }

  return merged;
}

/**
 * 전달된 문장에서 개선 문장으로 가며 바뀐 자리. 앞의 문장은 사용자가 실제로
 * 보낸 말이라, 바뀐 자리가 곧 첨삭이 손댄 곳이다.
 */
export function improvedSegments(
  delivered: string,
  improved: string
): SentenceSegment[] {
  const ops = diffTokens(tokenize(delivered), tokenize(improved));
  const segments: SentenceSegment[] = [];
  let removed: string[] = [];
  let inserted: string[] = [];

  const closeBlock = () => {
    if (removed.length > 0 || inserted.length > 0) {
      segments.push(...blockSegments(removed, inserted));
      removed = [];
      inserted = [];
    }
  };

  for (const op of ops) {
    if (op.kind === "keep") {
      closeBlock();
      segments.push({ changed: false, text: op.token });
      continue;
    }

    if (op.kind === "remove") {
      removed.push(op.token);
      continue;
    }

    inserted.push(op.token);
  }

  closeBlock();

  return mergeSegments(
    segments.flatMap((segment) =>
      WHITESPACE.test(segment.text)
        ? [{ changed: false, text: segment.text }]
        : releaseWhitespace(segment)
    )
  );
}
