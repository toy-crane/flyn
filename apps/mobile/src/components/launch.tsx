import { Host } from "@expo/ui";
import { ProgressView, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { View } from "react-native";
import { colors } from "../theme/colors";

/**
 * 세션을 복원하는 동안, 그리고 복원조차 못 할 때 나오는 두 화면.
 *
 * SwiftUI로 만든다(docs/decisions/expo-ui-by-default.md의 판정표). RN이 하나도
 * 필요 없고 자명하게 self-contained라 `Host` 경계가 한 번만 열린다.
 *
 * 색은 `Host` 바깥의 RN 뷰에만 준다 — 안쪽 SwiftUI는 기본값이 이미 시맨틱
 * 색이고, `background` 모디파이어는 hex만 받아 다크 모드를 깬다.
 */

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.systemBackground }}
    >
      <Host matchContents>{children}</Host>
    </View>
  );
}

export function LaunchChecking() {
  return (
    <Screen>
      <ProgressView />
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
