export const APP_SYMBOLS = {
  // 달성한 목표의 초록 원 안에 드는 체크.
  achieved: {
    name: "checkmark",
    size: 10,
    weight: "bold",
  },
  // 제자리에서 접고 펴는 표시. 셰브론의 방향이 곧 다음에 일어날 일이라
  // 이름도 방향으로 둔다.
  chevronDown: {
    name: "chevron.down",
    size: 14,
    weight: "medium",
  },
  chevronUp: {
    name: "chevron.up",
    size: 14,
    weight: "medium",
  },
  disclosure: {
    name: "chevron.right",
    size: 14,
    weight: "medium",
  },
  // 만들어 준 값을 같은 자리에 다시 채우는 action이다. iOS에서 원형 화살표가
  // 뜻하는 새로고침과 같으므로 재시작 action에는 쓰지 않는다.
  regenerate: {
    name: "arrow.clockwise",
    size: 16,
    weight: "medium",
  },
} as const;

export type AppSymbolName = keyof typeof APP_SYMBOLS;
