import { expect, jest, test } from "@jest/globals";
import { Platform } from "react-native";

import { profileLabels } from "@/features/auth/ui/profile-labels";
import { getSettingsScreenOptions, settingsScreens } from "./settings-screens";

const BACKGROUND = "#0B0B0D";

test("설정 계층은 루트 스택의 형제 화면 셋이다", () => {
  // Siblings rather than a nested stack: a nested stack makes 설정 a first
  // screen, and a first screen has no native back button to leave with.
  expect(settingsScreens.map((screen) => screen.name)).toEqual([
    "settings",
    "settings/profile",
    "settings/theme",
  ]);
  expect(settingsScreens.map((screen) => screen.title)).toEqual([
    "설정",
    "프로필",
    "화면 모드",
  ]);
});

test("제목은 설정 행이 읽는 이름과 같은 상수에서 온다", () => {
  // A row that opens a screen with a different title reads as two settings, so
  // both sides read one constant rather than each spelling the name out.
  const themeScreen = settingsScreens.find(
    (screen) => screen.name === "settings/theme"
  );

  expect(themeScreen?.title).toBe(profileLabels.themeMode);
});

test("iOS는 투명 헤더와 스크롤 가장자리를 시스템에 맡긴다", () => {
  const platform = jest.replaceProperty(Platform, "OS", "ios");

  try {
    // The app paints no header background of its own here; the system material
    // and the scroll edge effect are what the transparent header is for.
    expect(getSettingsScreenOptions(BACKGROUND)).toEqual({
      headerBackButtonDisplayMode: "minimal",
      // Hidden from view but not from a screen reader, which otherwise reads
      // the name of the screen behind — the tab group.
      headerBackTitle: "뒤로 가기",
      headerShadowVisible: false,
      headerShown: true,
      headerTransparent: true,
      scrollEdgeEffects: { top: "soft" },
    });
  } finally {
    platform.restore();
  }
});

test("Android는 앱 배경색의 Material 앱 바를 쓴다", () => {
  const platform = jest.replaceProperty(Platform, "OS", "android");

  try {
    // Opaque, so the screen below starts under the bar rather than behind it
    // and no screen adds a top inset of its own.
    expect(getSettingsScreenOptions(BACKGROUND)).toEqual({
      headerBackButtonDisplayMode: "minimal",
      headerBackTitle: "뒤로 가기",
      headerShadowVisible: false,
      headerShown: true,
      headerStyle: { backgroundColor: BACKGROUND },
    });
  } finally {
    platform.restore();
  }
});
