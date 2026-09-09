import { expect, test } from "@jest/globals";

import { appTabs } from "./app-tabs";

test("세 네이티브 탭이 route group과 플랫폼별 기본·선택 아이콘을 선언한다", () => {
  expect(appTabs).toEqual([
    {
      androidIcon: { default: "home", selected: "home_filled" },
      iosIcon: { default: "house", selected: "house.fill" },
      label: "홈",
      routeName: "(home)",
    },
    {
      androidIcon: { default: "grid_view", selected: "grid_view" },
      iosIcon: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
      label: "탐색",
      routeName: "(browse)",
    },
    {
      androidIcon: { default: "auto_stories", selected: "auto_stories" },
      iosIcon: { default: "book", selected: "book.fill" },
      label: "스토리",
      routeName: "(stories)",
    },
  ]);
});
