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
  // 더 자연스럽게 쓸 여지가 있다. HIG가 info 버튼을 "행의 내용에 대한 더 많은
  // 정보를 드러낼 때만" 쓰라고 한 자리가 정확히 첨삭 시트다.
  improvable: {
    name: "info.circle",
    size: 17,
    weight: "regular",
  },
  // 그대로 잘 통했다는 상태 표시. 누를 것이 아니라 배경 없이 혼자 선다.
  passed: {
    name: "checkmark",
    size: 15,
    weight: "semibold",
  },
  // 만들어 준 값을 같은 자리에 다시 채우는 action이다. iOS에서 원형 화살표가
  // 뜻하는 새로고침과 같으므로 재시작 action에는 쓰지 않는다.
  regenerate: {
    name: "arrow.clockwise",
    size: 16,
    weight: "medium",
  },
  // 한글로 써서 번역된 영어가 전달됐다. 커스텀 글리프를 그리지 않고 시스템이
  // 번역에 쓰는 기호를 그대로 쓴다.
  translated: {
    name: "translate",
    size: 15,
    weight: "medium",
  },
} as const;

export type AppSymbolName = keyof typeof APP_SYMBOLS;
