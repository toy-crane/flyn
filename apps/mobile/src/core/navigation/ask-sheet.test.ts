import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { Platform } from "react-native";

import { getAskSheetOptions } from "./ask-sheet";

const BACKGROUND = "#f4f4f6";
const TITLE = "AI에게 물어보기";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getAskSheetOptions", () => {
  // The conversation behind the sheet is not a screen this one came from, so
  // the only way out is the close button in the toolbar.
  test("물어보는 자리를 native page sheet로 열고 뒤로 가기를 두지 않는다", () => {
    jest.replaceProperty(Platform, "OS", "ios");

    expect(getAskSheetOptions(BACKGROUND, TITLE)).toEqual({
      headerBackVisible: false,
      // The sheet already has its own edge; a hairline draws a second one.
      headerShadowVisible: false,
      headerTransparent: true,
      presentation: "pageSheet",
      scrollEdgeEffects: { top: "soft" },
      title: TITLE,
    });
  });

  test("Android는 테마 배경을 쓴 앱 바를 그린다", () => {
    jest.replaceProperty(Platform, "OS", "android");

    expect(getAskSheetOptions(BACKGROUND, TITLE)).toEqual({
      headerBackVisible: false,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: BACKGROUND },
      presentation: "pageSheet",
      title: TITLE,
    });
  });

  // 물어보는 자리는 그것이 시작된 대화처럼 읽히고 스크롤되므로, 어느
  // 플랫폼에서도 헤더를 다르게 만나지 않는다.
  test("어느 플랫폼에서도 제목 아래 구분선을 두지 않는다", () => {
    for (const os of ["android", "ios"] as const) {
      jest.replaceProperty(Platform, "OS", os);

      expect(getAskSheetOptions(BACKGROUND, TITLE)).toMatchObject({
        headerShadowVisible: false,
      });
    }
  });
});
