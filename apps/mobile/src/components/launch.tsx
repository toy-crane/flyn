import { Host } from "@expo/ui";
import { ProgressView, Text, VStack } from "@expo/ui/swift-ui";
import {
  Animation,
  accessibilityHidden,
  animation,
  font,
  foregroundStyle,
  multilineTextAlignment,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useAppTheme } from "../theme/app-theme";

const PROGRESS_REVEAL_DELAY_MS = 200;

/**
 * 세션을 복원하는 동안, 그리고 복원조차 못 할 때 나오는 두 화면.
 *
 * SwiftUI로 만든다(docs/decisions/self-contained-native-ui-boundaries.md의 판정표). RN이 하나도
 * 필요 없고 자명하게 self-contained라 `Host` 경계가 한 번만 열린다.
 *
 * background와 interactive tint는 CSS 앱 테마에서 받고, 안쪽 SwiftUI 텍스트는
 * 네이티브 계층 표현을 그대로 쓴다.
 */

function Screen({ children }: { children: React.ReactNode }) {
  const app = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: app.background }}
    >
      <Host matchContents seedColor={app.primary}>
        {children}
      </Host>
    </View>
  );
}

export function LaunchChecking() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, PROGRESS_REVEAL_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Screen>
      <ProgressView
        modifiers={[
          accessibilityHidden(!visible),
          opacity(visible ? 1 : 0),
          animation(Animation.easeOut({ duration: 0.16 }), visible),
        ]}
        testID="launch-progress"
      />
    </Screen>
  );
}

/**
 * `다시 시도` 버튼을 두지 않는다. `failed`는 오직 `!supabaseConfigured`에서만
 * 나오고(use-auth.ts), 그 값은 빌드 타임에 인라인되는 `process.env`라
 * (supabase.ts) 런타임에 바뀔 수 없다. 세션 복원 실패는 `signedOut`으로 떨어져
 * 로그인 화면이 이미 탈출구다. 버튼을 두면 복구 가능한 상태라고 거짓말하게
 * 된다 — 실제로 필요한 것은 재빌드다.
 */
export function LaunchFailed({ reason }: { reason: string }) {
  return (
    <Screen>
      <VStack modifiers={[padding({ all: 8 })]} spacing={8}>
        <Text
          modifiers={[
            font({ textStyle: "body" }),
            foregroundStyle({ style: "secondary", type: "hierarchical" }),
            multilineTextAlignment("center"),
          ]}
        >
          {reason}
        </Text>
      </VStack>
    </Screen>
  );
}
