interface ExpressionEntry {
  fixed: string;
  isError?: boolean;
  original: string;
}

interface LocatedMark {
  at: number;
  isMarked: boolean;
  text: string;
}

interface Position {
  left: number;
  marks: LocatedMark[];
  right: number;
  used: string;
}

/** 원문을 완성 문장으로 바꾸는 실제 경로에서 오류 위치를 찾는다. */
export function originalErrorMarks(
  entries: readonly ExpressionEntry[],
  original: string,
  fixed: string
): LocatedMark[] {
  const pending: Position[] = [
    { left: 0, marks: [], right: 0, used: "0".repeat(entries.length) },
  ];
  const seen = new Set<string>();
  const allUsed = "1".repeat(entries.length);
  while (pending.length && seen.size < 10_000) {
    const position = pending.pop();
    if (!position) {
      break;
    }
    const key = `${position.left}:${position.right}:${position.used}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (
      position.left === original.length &&
      position.right === fixed.length &&
      position.used === allUsed
    ) {
      return position.marks;
    }
    appendPositions(pending, position, entries, original, fixed);
  }
  // 옛 결과에서 대응을 복원할 수 없으면 중복 위치를 추측해 표시하지 않는다.
  return [];
}

function appendPositions(
  pending: Position[],
  position: Position,
  entries: readonly ExpressionEntry[],
  original: string,
  fixed: string
) {
  const { left, marks, right, used } = position;
  if (
    left < original.length &&
    right < fixed.length &&
    original[left] === fixed[right]
  ) {
    pending.push({ left: left + 1, marks, right: right + 1, used });
  }
  for (const [index, entry] of entries.entries()) {
    if (
      !(entry.original && entry.fixed) ||
      entry.original === entry.fixed ||
      !original.startsWith(entry.original, left) ||
      !fixed.startsWith(entry.fixed, right)
    ) {
      continue;
    }
    pending.push({
      left: left + entry.original.length,
      marks: [
        ...marks,
        { at: left, isMarked: entry.isError !== false, text: entry.original },
      ],
      right: right + entry.fixed.length,
      used: `${used.slice(0, index)}1${used.slice(index + 1)}`,
    });
  }
}
