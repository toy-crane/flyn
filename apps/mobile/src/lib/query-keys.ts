// 공용 쿼리 키 — 컴포넌트·테스트가 같은 키를 쓰고, 무효화 대상이 어긋나지 않게 한다.
export const queryKeys = {
  scratchNotes: ["scratch_notes"] as const,
  serverStats: ["server-stats"] as const,
};
