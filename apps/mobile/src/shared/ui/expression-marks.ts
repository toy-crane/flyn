/** 실제 오류만 원문에서 밑줄로 짚는다. 값이 없는 옛 결과는 오류로 읽는다. */
export function originalErrorMarks(
  entries: readonly { isError?: boolean; original: string }[]
): string[] {
  return entries
    .filter((entry) => entry.isError !== false)
    .map((entry) => entry.original);
}
