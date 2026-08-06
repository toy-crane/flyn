/**
 * `@expo/ui`를 RN 프리미티브로 갈아끼우는 jest 목.
 *
 * **왜 필요한가.** SwiftUI 트리는 jest에서 `ViewManagerAdapter_ExpoUI`라는
 * 불투명한 네이티브 호스트 뷰 하나로만 그려진다. 라벨·값·아이콘 이름이 전부
 * 네이티브 쪽 prop으로 넘어가버려 **RNTL이 안을 들여다볼 수 없다.** 목이 없으면
 * Settings 화면은 "무엇이 그려졌나"를 한 줄도 단언할 수 없다.
 *
 * 저장소가 `expo-apple-authentication`을 Pressable로 갈아끼우는 것과 같은
 * 성격이다 — 벤더의 렌더링이 아니라 **우리 배선**을 검증하는 게 목적이라
 * 네이티브 경계를 목으로 막는 것이 맞는 자리다.
 *
 * 담는 범위는 앱이 실제로 import하는 것뿐이다. `@expo/ui`가 남은 자리는 Settings
 * 화면과 그 전용 컴포넌트(profile-avatar·native-symbol)뿐이고
 * (docs/decisions/self-contained-native-ui-boundaries.md), `@expo/ui/swift-ui`
 * 트리를 직접 여는 화면은 더 이상 없다.
 *
 * jest 전역(`jest.fn` 등)을 쓰지 않는다 — biome의 jest 전역 override가
 * `*.test.ts(x)`에만 걸려 있어 이 파일에서 쓰면 린트가 미선언으로 잡는다.
 */

import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface ModifierMark {
  $modifier: string;
  args: unknown[];
}

const modifierArg = <T,>(modifiers: unknown[] | undefined, name: string) =>
  (modifiers as ModifierMark[] | undefined)?.find(
    (modifier) => modifier?.$modifier === name
  )?.args[0] as T | undefined;

/** 모디파이어는 이름과 인자만 남기는 표식으로 바꾼다. */
export function modifiersMock() {
  return new Proxy(
    {},
    {
      get:
        (_target, name: string) =>
        (...args: unknown[]): ModifierMark => ({ $modifier: name, args }),
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
  modifiers,
  testID,
}: Modifiers & {
  children?: ReactNode;
  testID?: string;
}) {
  return (
    <View
      accessibilityHint={JSON.stringify(modifiers, (_key, value) =>
        value === Number.POSITIVE_INFINITY ? "Infinity" : value
      )}
      testID={testID}
    >
      {children}
    </View>
  );
}

function MockText({
  children,
  modifiers,
  style,
  ...props
}: Modifiers & {
  children?: ReactNode;
  style?: ComponentProps<typeof Text>["style"];
  testID?: string;
  textStyle?: unknown;
}) {
  const foreground = modifierArg<unknown>(modifiers, "foregroundStyle");
  const color = typeof foreground === "string" ? foreground : undefined;
  const observableProps = { ...props, modifiers } as ComponentProps<
    typeof Text
  >;

  return (
    <Text {...observableProps} style={color ? [style, { color }] : style}>
      {children}
    </Text>
  );
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
  modifiers,
  style,
  testID,
}: Modifiers & {
  alignment?: "center" | "end" | "start";
  children?: ReactNode;
  style?: ComponentProps<typeof View>["style"];
  testID?: string;
}) {
  const observableProps = { modifiers } as ComponentProps<typeof View>;

  return (
    <View
      {...observableProps}
      accessibilityHint={`row-alignment:${alignment}`}
      style={style}
      testID={testID}
    >
      {children}
    </View>
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

// Passthrough를 그대로 Object.assign하면 Host처럼 같은 함수를 쓰는 다른 자리까지
// 슬롯이 달라붙는다. 감싸는 함수를 따로 만든다.
function MockFieldGroup({ children }: { children?: ReactNode }) {
  return <View testID="expo-ui-field-group">{children}</View>;
}

const FieldGroup = Object.assign(MockFieldGroup, { Section: MockSection });

export function universalMock() {
  return {
    Column: MockColumn,
    FieldGroup,
    Host: Passthrough,
    Icon: MockIcon,
    ListItem: MockListItem,
    Row: MockRow,
    Text: MockText,
  };
}
