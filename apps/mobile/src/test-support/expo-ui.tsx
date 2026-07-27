/**
 * `@expo/ui`를 RN 프리미티브로 갈아끼우는 jest 목.
 *
 * **왜 필요한가.** SwiftUI 트리는 jest에서 `ViewManagerAdapter_ExpoUI`라는
 * 불투명한 네이티브 호스트 뷰 하나로만 그려진다. 라벨·플레이스홀더·에러 문구가
 * 전부 네이티브 쪽 prop으로 넘어가버려 **RNTL이 안을 들여다볼 수 없다.**
 * 목이 없으면 SwiftUI 화면은 "무엇이 그려졌나"를 한 줄도 단언할 수 없다.
 *
 * 저장소가 `expo-apple-authentication`을 Pressable로 갈아끼우는 것과 같은
 * 성격이다 — 벤더의 렌더링이 아니라 **우리 배선**을 검증하는 게 목적이라
 * 네이티브 경계를 목으로 막는 것이 맞는 자리다.
 *
 * jest 전역(`jest.fn` 등)을 쓰지 않는다 — biome의 jest 전역 override가
 * `*.test.ts(x)`에만 걸려 있어 이 파일에서 쓰면 린트가 미선언으로 잡는다.
 */

import { type ReactNode, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

interface ModifierMark {
  $modifier: string;
  args: unknown[];
}

const isDisabledMark = (m: unknown): boolean =>
  typeof m === "object" &&
  m !== null &&
  (m as ModifierMark).$modifier === "disabled" &&
  (m as ModifierMark).args[0] !== false;

/** 모디파이어는 이름과 인자만 남기는 표식으로 바꾼다 — Button이 disabled를 읽는다. */
export function modifiersMock() {
  return new Proxy(
    {},
    {
      get(_target, name: string) {
        if (name === "shapes") {
          return new Proxy(
            {},
            { get: (_t, shape: string) => () => ({ $shape: shape }) }
          );
        }

        return (...args: unknown[]): ModifierMark => ({
          $modifier: name,
          args,
        });
      },
    }
  );
}

interface Modifiers {
  modifiers?: unknown[];
}

function Passthrough({ children }: { children?: ReactNode }) {
  return <View>{children}</View>;
}

function MockButton({
  children,
  label,
  modifiers,
  onPress,
}: Modifiers & {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
}) {
  const disabled = (modifiers ?? []).some(isDisabledMark);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      {label === undefined ? children : <Text>{label}</Text>}
    </Pressable>
  );
}

interface ObservableState<T> {
  value: T;
}

function MockTextField({
  autoFocus,
  modifiers,
  onTextChange,
  placeholder,
  text,
}: Modifiers & {
  autoFocus?: boolean;
  onTextChange?: (next: string) => void;
  placeholder?: string;
  text?: ObservableState<string>;
}) {
  // 실물에서는 keyboardType·textContentType이 모디파이어로 붙는다. 목에서도
  // TextInput의 같은 이름 prop으로 옮겨 줘야 "oneTimeCode를 걸었나" 같은 단언이
  // 가능하다.
  const marks = (modifiers ?? []) as ModifierMark[];
  const markArg = <T,>(name: string) =>
    marks.find((m) => m?.$modifier === name)?.args[0] as T | undefined;

  return (
    <TextInput
      autoFocus={autoFocus}
      keyboardType={markArg<TextInputProps["keyboardType"]>("keyboardType")}
      onChangeText={onTextChange}
      placeholder={placeholder}
      textContentType={markArg<TextInputProps["textContentType"]>(
        "textContentType"
      )}
      value={text ? text.value : ""}
    />
  );
}

function MockProgressView() {
  return <ActivityIndicator />;
}

/** 실물과 같은 모양의 관찰 가능 상태. 목에서는 React state로 재렌더를 만든다. */
export function useNativeState<T>(initial: T): ObservableState<T> {
  const [value, setValue] = useState(initial);

  return useMemo(
    () => ({
      get value() {
        return value;
      },
      set value(next: T) {
        setValue(next);
      },
    }),
    [value]
  );
}

const containers = {
  Form: Passthrough,
  Group: Passthrough,
  Host: Passthrough,
  HStack: Passthrough,
  Section: Passthrough,
  VStack: Passthrough,
  ZStack: Passthrough,
};

const leaves = {
  Divider: () => <View />,
  ProgressView: MockProgressView,
  Spacer: () => <View />,
};

export function swiftUiMock() {
  return {
    ...containers,
    ...leaves,
    Button: MockButton,
    SecureField: MockTextField,
    Text,
    TextField: MockTextField,
    useNativeState,
  };
}

export function universalMock() {
  return {
    ...containers,
    ...leaves,
    Button: MockButton,
    Text,
    TextInput: MockTextField,
    useNativeState,
  };
}
