/**
 * 화면 테스트용 `expo-router` 대역.
 *
 * `_layout.test.tsx`의 대역과는 모양이 다르다. 거기서 `Stack.Screen`은 라우트
 * **선언**이라 `screen:${name}`을 그려야 가드 배선이 보이지만, 화면 안에서는
 * 헤더 **설정**이라 아무것도 그리면 안 된다.
 */

import type { ReactNode } from "react";
import { Platform, Pressable } from "react-native";

const NOTHING = () => null;

function Toolbar({ children }: { children?: ReactNode }) {
  return children;
}

function ToolbarButton({
  accessibilityLabel,
  disabled,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon?: unknown;
  onPress: () => void;
}) {
  // Expo Router의 Android toolbar는 SF Symbol 문자열을 렌더링하지 않는다.
  if (Platform.OS === "android" && typeof icon === "string") {
    return null;
  }

  return (
    <Pressable
      accessibilityHint={typeof icon === "string" ? `sf:${icon}` : "image"}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    />
  );
}

function ToolbarView({ children }: { children?: ReactNode }) {
  return children;
}

/**
 * 실물은 `asChild`로 받은 컴포넌트를 native header의 title 자리에 그린다.
 * 목은 그 자리를 화면 트리에 그대로 두어, 헤더가 나르는 결정을 단언할 수 있게
 * 한다.
 */
function Title({ children }: { children?: ReactNode }) {
  return children;
}

/** 화면들이 부르는 라우터. 메서드만 jest.fn이라 resetAllMocks에 안전하다. */
export const routerStub = {
  back: jest.fn(),
  dismissTo: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

let searchParams: Record<string, string> = {};
let isFocused = true;

/** `useLocalSearchParams`가 돌려줄 값. beforeEach에서 세운다. */
export function setSearchParams(next: Record<string, string>) {
  searchParams = next;
}

/** `useIsFocused`가 돌려줄 값. 화면 이탈/복귀 테스트에서 세운다. */
export function setIsFocused(next: boolean) {
  isFocused = next;
}

export function expoRouterMock() {
  const Stack = Object.assign(NOTHING, {
    Protected: NOTHING,
    Screen: Object.assign(NOTHING, { BackButton: NOTHING }),
    Title,
    Toolbar: Object.assign(Toolbar, {
      Button: ToolbarButton,
      View: ToolbarView,
    }),
  });

  return {
    Stack,
    // jest.fn이 아니라 맨 함수다. 저장소가 beforeEach에서 resetAllMocks를 쓰는데,
    // 그게 구현을 지워 useRouter()가 undefined를 돌려주게 된다.
    useIsFocused: () => isFocused,
    useLocalSearchParams: () => searchParams,
    useRouter: () => routerStub,
  };
}
