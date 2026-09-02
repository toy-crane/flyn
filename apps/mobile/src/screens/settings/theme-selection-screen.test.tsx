import { expect, jest, test } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { ThemeSelectionScreen } from "./theme-selection-screen";

const ACCENT = "#0a84ff";
const BACKGROUND = "#f4f4f6";
const SURFACE = "#ffffff";

jest.mock("@expo/ui", () => {
  const React = require("react") as typeof import("react");
  const {
    Pressable,
    Text: NativeText,
    View,
  } = require("react-native") as typeof import("react-native");
  const Container = ({
    children,
    testID,
  }: PropsWithChildren<{ testID?: string }>) =>
    React.createElement(View, { testID }, children);

  return {
    FieldGroup: Object.assign(Container, { Section: Container }),
    Host: Container,
    // Renders as its own node so a test can assert which row is marked.
    Icon: ({ name }: { name: string }) =>
      React.createElement(NativeText, null, name),
    // A native list row takes a press anywhere across it and reads its own text
    // as its accessible name, so the stand-in does the same. The modifiers stay
    // on the element because that is where the selected state lives.
    ListItem: ({
      children,
      modifiers,
      onPress,
      testID,
      trailing,
    }: PropsWithChildren<{
      modifiers?: { $type: string }[];
      onPress?: () => void;
      testID?: string;
      trailing?: React.ReactNode;
    }>) =>
      React.createElement(
        Pressable,
        // Kept on the node so a test can read the state the native row carries.
        { accessibilityRole: "button", modifiers, onPress, testID } as never,
        children,
        trailing
      ),
    Row: ({
      children,
      modifiers,
      onPress,
      testID,
    }: PropsWithChildren<{
      modifiers?: { $type: string }[];
      onPress?: () => void;
      testID?: string;
    }>) =>
      React.createElement(
        View,
        { modifiers, onPress, testID } as never,
        children
      ),
    Spacer: Container,
    Text: ({ children }: PropsWithChildren) =>
      React.createElement(NativeText, null, children),
  };
});

function renderSelection({
  onSelect = () => {
    // Most tests are about what the screen shows.
  },
  themePreference = "system" as const,
}: {
  onSelect?: (preference: "dark" | "light" | "system") => void;
  themePreference?: "dark" | "light" | "system";
} = {}) {
  return render(
    <ThemeSelectionScreen
      accent={ACCENT}
      background={BACKGROUND}
      onSelect={onSelect}
      surface={SURFACE}
      themePreference={themePreference}
    />
  );
}

test("세 값을 항상 모두 보여 준다", async () => {
  await renderSelection();

  // The whole point of a screen rather than a menu: every value, and the one in
  // force, are readable without opening anything.
  expect(screen.getByText("라이트")).toBeOnTheScreen();
  expect(screen.getByText("다크")).toBeOnTheScreen();
  expect(screen.getByText("시스템 설정")).toBeOnTheScreen();
});

test("iOS는 고른 값 하나에만 체크를 두고 선택 상태를 읽어 준다", async () => {
  await renderSelection({ themePreference: "dark" });

  const selected = screen.getByTestId("theme-option-dark");
  const unselected = screen.getByTestId("theme-option-light");

  expect(screen.getAllByText("checkmark")).toHaveLength(1);
  // The mark alone says nothing to a screen reader, so the row carries the
  // state in words and in the trait VoiceOver reads as 선택됨.
  expect(selected.props.modifiers).toContainEqual(
    expect.objectContaining({ value: "선택됨" })
  );
  expect(selected.props.modifiers).toContainEqual(
    expect.objectContaining({ traits: ["isSelected"] })
  );
  expect(unselected.props.modifiers).toContainEqual(
    expect.objectContaining({ value: "선택 안 됨" })
  );
});

test("값을 누르면 화면을 닫지 않고 그 값을 올려 보낸다", async () => {
  const onSelect = jest.fn();
  const user = userEvent.setup();

  await renderSelection({ onSelect, themePreference: "system" });

  await user.press(screen.getByTestId("theme-option-light"));

  // Applied where it is, so the new mode can be seen on the surface that
  // changed. Nothing here navigates.
  expect(onSelect).toHaveBeenCalledWith("light");
});
