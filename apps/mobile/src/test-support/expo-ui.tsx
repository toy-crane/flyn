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

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
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

const modifierArg = <T,>(modifiers: unknown[] | undefined, name: string) =>
  (modifiers as ModifierMark[] | undefined)?.find(
    (modifier) => modifier?.$modifier === name
  )?.args[0] as T | undefined;

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

function MockColumn({
  children,
  testID,
}: {
  children?: ReactNode;
  testID?: string;
}) {
  return <View testID={testID}>{children}</View>;
}

function MockButton({
  children,
  disabled: disabledProp,
  label,
  modifiers,
  onPress,
}: Modifiers & {
  children?: ReactNode;
  /** universal `Button`은 모디파이어가 아니라 prop으로 받는다. */
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
}) {
  const disabled =
    disabledProp === true || (modifiers ?? []).some(isDisabledMark);
  const foreground = modifierArg<unknown>(modifiers, "foregroundStyle");
  const labelColor = typeof foreground === "string" ? foreground : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      {label === undefined ? (
        children
      ) : (
        <Text style={labelColor ? { color: labelColor } : undefined}>
          {label}
        </Text>
      )}
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

/** 아이콘 자체는 그리지 않되, 화면 테스트가 name·color·modifier 배선을 본다. */
function MockIcon({
  color,
  modifiers,
  name,
}: Modifiers & { color?: string; name: unknown }) {
  return (
    <View
      accessibilityHint={JSON.stringify(modifiers)}
      accessibilityLabel={typeof name === "string" ? name : undefined}
      style={color === undefined ? undefined : { backgroundColor: color }}
    />
  );
}

/**
 * 실물과 같은 모양의 관찰 가능 상태.
 *
 * **ref가 진실이고 React state는 재렌더 트리거일 뿐이다.** 실물에서 이 값은
 * 네이티브 쪽에서 동기로 갱신되므로 React 렌더보다 앞선다. 목이 React state만
 * 쓰면 둘이 절대 어긋나지 않아, "React 미러를 읽어서 마지막 글자를 놓치는" 버그를
 * 테스트가 통과시킨다 — 실제로 시뮬레이터에서 이메일 주소 끝 글자가 잘려
 * 발송됐다.
 */
export function useNativeState<T>(initial: T): ObservableState<T> {
  const ref = useRef(initial);
  const [, forceRender] = useState(initial);

  return useMemo(
    () => ({
      get value() {
        return ref.current;
      },
      set value(next: T) {
        ref.current = next;
        forceRender(next);
      },
    }),
    []
  );
}

/**
 * universal `TextInput`은 swift-ui `TextField`와 prop 이름이 다르다 — 값은
 * `text`가 아니라 `value`, 변경은 `onTextChange`가 아니라 `onChangeText`다.
 * 제출은 `onSubmitEditing(text)`로 **현재 값을 함께** 넘겨준다.
 */
function MockTextInput({
  autoFocus,
  maxLength,
  onChangeText,
  onSubmitEditing,
  placeholder,
  value,
}: {
  autoFocus?: boolean;
  maxLength?: number;
  onChangeText?: (next: string) => void;
  onSubmitEditing?: (text: string) => void;
  placeholder?: string;
  value?: ObservableState<string>;
}) {
  // 실물은 제출 시점의 **네이티브** 값을 넘긴다. React state를 넘기면 목이
  // 실물보다 관대해져, 미러를 읽는 버그를 테스트가 통과시킨다.
  const handleSubmitEditing = useCallback(
    () => onSubmitEditing?.(value ? value.value : ""),
    [onSubmitEditing, value]
  );

  return (
    <TextInput
      autoFocus={autoFocus}
      maxLength={maxLength}
      onChangeText={onChangeText}
      onSubmitEditing={handleSubmitEditing}
      placeholder={placeholder}
      value={value ? value.value : ""}
    />
  );
}

/** 문자열 자식은 실물이 SwiftUI `Text`로 감싼다 — 목도 같이 감싸야 단언이 닿는다. */
function wrapText(node: ReactNode) {
  return typeof node === "string" || typeof node === "number" ? (
    <Text>{node}</Text>
  ) : (
    node
  );
}

function MockListItem({
  children,
  leading,
  onPress,
  supportingText,
  trailing,
}: {
  children?: ReactNode;
  leading?: ReactNode;
  onPress?: () => void;
  supportingText?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {wrapText(leading)}
      {wrapText(children)}
      {wrapText(supportingText)}
      {wrapText(trailing)}
    </Pressable>
  );
}

function MockRow({
  alignment = "start",
  children,
}: {
  alignment?: "center" | "end" | "start";
  children?: ReactNode;
}) {
  return (
    <View accessibilityHint={`row-alignment:${alignment}`}>{children}</View>
  );
}

/** `FieldGroup.Section`의 `title`은 실물에서 헤더로 그려진다. */
function MockSection({
  children,
  title,
}: {
  children?: ReactNode;
  title?: string;
}) {
  return (
    <View>
      {title === undefined ? null : <Text>{title}</Text>}
      {children}
    </View>
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

// Passthrough를 그대로 Object.assign하면 Host·Group 등 같은 함수를 쓰는 다른
// 자리까지 슬롯이 달라붙는다. 감싸는 함수를 따로 만든다.
function MockFieldGroup({ children }: { children?: ReactNode }) {
  return <View>{children}</View>;
}

const FieldGroup = Object.assign(MockFieldGroup, {
  Section: MockSection,
  SectionFooter: Passthrough,
  SectionHeader: Passthrough,
});

const ListItem = Object.assign(MockListItem, {
  Leading: Passthrough,
  Supporting: Passthrough,
  Trailing: Passthrough,
});

export function universalMock() {
  return {
    ...containers,
    ...leaves,
    Button: MockButton,
    Column: MockColumn,
    FieldGroup,
    Icon: MockIcon,
    List: Passthrough,
    ListItem,
    Row: MockRow,
    ScrollView: Passthrough,
    Text,
    TextInput: MockTextInput,
    useNativeState,
  };
}
