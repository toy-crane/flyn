/** 이름표 색. 인물의 스토리 안 순서를 받아 어느 화에서나 같은 색이 된다. */
const CAST_TONES = [
  "text-cast-1",
  "text-cast-2",
  "text-cast-3",
  "text-cast-4",
] as const;

export function castTone(position: number | undefined): string {
  return CAST_TONES[((position ?? 1) - 1) % CAST_TONES.length] ?? CAST_TONES[0];
}
