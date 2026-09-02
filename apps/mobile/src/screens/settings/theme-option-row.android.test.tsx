import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { Platform } from "react-native";

jest.mock("@expo/ui", () => {
  const React = require("react") as typeof import("react");
  const { Text: NativeText, View } =
    require("react-native") as typeof import("react-native");

  return {
    ListItem: ({ children }: PropsWithChildren) =>
      React.createElement(View, null, children),
    Row: ({
      children,
      modifiers,
      testID,
    }: PropsWithChildren<{
      modifiers?: { $type: string }[];
      testID?: string;
    }>) =>
      React.createElement(
        View,
        // Kept on the node so a test can read the state the native row carries.
        { modifiers, testID } as never,
        children
      ),
    Spacer: () => null,
    Text: ({ children }: PropsWithChildren) =>
      React.createElement(NativeText, null, children),
  };
});

jest.mock("@expo/ui/jetpack-compose", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    RadioButton: ({ selected }: { selected: boolean }) =>
      React.createElement(View, {
        accessibilityState: { checked: selected },
        testID: "radio-button",
      }),
  };
});

// Jest resolves modules for iOS, so the Android file is named outright — the
// same way the Android save action is tested.
import { ThemeOptionRow } from "./theme-option-row.android";

/** The press belongs to the modifier here, not to a handler under test. */
const ignoreSelection = () => {
  // Nothing to record: these tests read the row's state, not its press.
};

let platform: { restore: () => void };

beforeEach(() => {
  platform = jest.replaceProperty(Platform, "OS", "android");
});

afterEach(() => {
  platform.restore();
});

test("고른 값과 나머지를 라디오 버튼으로 구분한다", async () => {
  await render(
    <ThemeOptionRow
      accent="#0a84ff"
      label="다크"
      onSelect={ignoreSelection}
      selected
      testID="theme-option-dark"
      value="dark"
    />
  );

  // `selectable` carries both halves: the press across the whole row and the
  // radio-button role TalkBack announces with the chosen state.
  expect(screen.getByTestId("theme-option-dark").props.modifiers).toEqual([
    expect.objectContaining({ role: "radioButton", selected: true }),
  ]);
  expect(screen.getByTestId("radio-button").props.accessibilityState).toEqual({
    checked: true,
  });
});

test("고르지 않은 값은 선택되지 않았다고 전달한다", async () => {
  await render(
    <ThemeOptionRow
      accent="#0a84ff"
      label="라이트"
      onSelect={ignoreSelection}
      selected={false}
      testID="theme-option-light"
      value="light"
    />
  );

  expect(screen.getByTestId("theme-option-light").props.modifiers).toEqual([
    expect.objectContaining({ role: "radioButton", selected: false }),
  ]);
  expect(screen.getByTestId("radio-button").props.accessibilityState).toEqual({
    checked: false,
  });
});
