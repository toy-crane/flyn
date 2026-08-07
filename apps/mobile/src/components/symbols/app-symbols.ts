/**
 * `@expo/ui`가 그리는 native 표면의 SF Symbol 어휘. 브랜드 층은 Ionicons를
 * 쓰므로 여기 남는 것은 native toolbar·form이 소비하는 것뿐이다
 * (docs/decisions/apple-hig-with-app-theme.md).
 */
export const APP_SYMBOLS = {
  disclosure: {
    name: "chevron.right",
    size: 14,
    weight: "medium",
  },
} as const;

export type AppSymbolName = keyof typeof APP_SYMBOLS;
