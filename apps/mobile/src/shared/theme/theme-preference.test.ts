import { beforeEach, expect, test } from "@jest/globals";
import Storage from "expo-sqlite/kv-store";

import { readThemePreference, writeThemePreference } from "./theme-preference";

beforeEach(() => {
  Storage.clearSync();
});

test("저장된 값이 없으면 시스템 설정으로 읽는다", () => {
  expect(readThemePreference()).toBe("system");
});

test("고른 값을 그대로 다시 읽는다", () => {
  writeThemePreference("dark");

  expect(readThemePreference()).toBe("dark");
});

test("세 값이 아닌 것이 저장돼 있으면 시스템 설정으로 돌아온다", () => {
  // What an older build, a half-written row or a hand-edited store leaves
  // behind. Carrying it forward would ask Uniwind for a theme that does not
  // exist; following the operating system is what a fresh install does.
  Storage.setItemSync("theme-preference", "sepia");

  expect(readThemePreference()).toBe("system");
});
