import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleButton } from "../../components/sign-in/google-button";
import { signInWithApple } from "../../lib/auth/apple";
import { signInWithGoogle } from "../../lib/auth/google";
import { authFailedFeedback } from "../../lib/haptics";
import { useAuthAction } from "../../lib/use-auth-action";
import {
  SOCIAL_BUTTON_HEIGHT,
  SOCIAL_BUTTON_RADIUS,
} from "../../theme/buttons";

/**
 * 소셜 우선. 화면을 지배하는 두 버튼이 SwiftUI로 표현할 수 없는 RN 뷰라
 * 이 화면은 RN이다(docs/decisions/expo-ui-by-default.md).
 *
 * 성공하면 onAuthStateChange가 가드를 뒤집어 스택째 벗어난다 — 여기선 실패만 다룬다.
 */
export default function SignInScreen() {
  const { clearFailure, failure, pending, pendingContext, run } =
    useAuthAction();
  const router = useRouter();
  const dark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const applePending = pendingContext === "apple";
  const googlePending = pendingContext === "google";

  // 소셜 실패는 폼 검증이 아니라 OS 시트가 닫히면서 돌아오는 모달 흐름의 결과다.
  // 시트가 사라진 자리에서 버튼 아래 작은 빨간 줄은 놓치기 쉬워 iOS 관용은 얼럿이다.
  useEffect(() => {
    if (!failure) {
      return;
    }

    authFailedFeedback();
    Alert.alert(failure.title, failure.message, [
      { onPress: clearFailure, text: "확인" },
    ]);
  }, [clearFailure, failure]);

  const handleApple = useCallback(() => {
    run(signInWithApple, "apple");
  }, [run]);

  const handleGoogle = useCallback(() => {
    run(signInWithGoogle, "google");
  }, [run]);

  const handleEmail = useCallback(() => {
    if (pending) {
      return;
    }

    router.push("/sign-in/email");
  }, [pending, router]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-5"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 8,
          paddingTop: insets.top + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        testID="sign-in-scroll"
      >
        <View className="flex-1">
          {/* 헤더가 없는 화면이라 워드마크는 스택 타이틀이 아니라 본문 Text다. */}
          <View className="gap-2">
            <Text className="font-bold text-4xl text-foreground tracking-tight">
              flyn
            </Text>
            <Text className="text-[17px] text-muted-foreground">
              로그인하고 시작하세요.
            </Text>
          </View>

          <View className="min-h-10 flex-1" testID="sign-in-flex-spacer" />

          <View className="gap-3" testID="sign-in-actions">
            {/* Apple이 기준이고 Google을 여기 맞춘다. cornerRadius와 buttonStyle 말고는
                우리가 건드릴 수 있는 손잡이가 없다 — style의 배경·모서리는 동작하지
                않을뿐더러 App Store 가이드라인 위반이다. */}
            <View style={{ position: "relative" }}>
              <View pointerEvents={pending ? "none" : "auto"}>
                <AppleAuthenticationButton
                  accessibilityLabel={
                    applePending ? "Apple로 로그인 중" : "Apple로 계속하기"
                  }
                  accessibilityState={{
                    busy: applePending,
                    disabled: pending,
                  }}
                  buttonStyle={
                    dark
                      ? AppleAuthenticationButtonStyle.WHITE
                      : AppleAuthenticationButtonStyle.BLACK
                  }
                  buttonType={AppleAuthenticationButtonType.CONTINUE}
                  cornerRadius={SOCIAL_BUTTON_RADIUS}
                  onPress={handleApple}
                  // 명시적 크기는 선택이 아니다 — 없으면 버튼이 아예 렌더되지 않는다.
                  style={{ height: SOCIAL_BUTTON_HEIGHT, width: "100%" }}
                />
              </View>
              {applePending ? (
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  pointerEvents="none"
                  style={{
                    bottom: 0,
                    justifyContent: "center",
                    position: "absolute",
                    right: 16,
                    top: 0,
                  }}
                  testID="apple-button-progress"
                >
                  <ActivityIndicator color={dark ? "#000000" : "#FFFFFF"} />
                </View>
              ) : null}
            </View>

            <GoogleButton
              disabled={pending}
              onPress={handleGoogle}
              pending={googlePending}
            />

            <Pressable
              accessibilityRole="button"
              className="items-center py-3"
              disabled={pending}
              onPress={handleEmail}
            >
              <Text className="text-[17px] text-primary">
                이메일로 계속하기
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
