export const APP_SYMBOLS = {
  disclosure: {
    name: "chevron.right",
    size: 14,
    weight: "medium",
  },
} as const;

export type AppSymbolName = keyof typeof APP_SYMBOLS;
