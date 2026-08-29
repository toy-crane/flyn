export const appTabs = [
  {
    androidIcon: { default: "home", selected: "home_filled" },
    iosIcon: { default: "house", selected: "house.fill" },
    label: "홈",
    routeName: "(home)",
  },
  {
    androidIcon: { default: "auto_stories", selected: "auto_stories" },
    iosIcon: { default: "book", selected: "book.fill" },
    label: "스토리",
    routeName: "(stories)",
  },
] as const;
