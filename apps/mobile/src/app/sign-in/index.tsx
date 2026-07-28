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
import { GoogleButton } from "../../components/sign-in/google-button";
import { signInWithApple } from "../../lib/auth/apple";
import { signInWithGoogle } from "../../lib/auth/google";
import { authFailedFeedback } from "../../lib/haptics";
import { useAuthAction } from "../../lib/use-auth-action";
import { useAppTheme } from "../../theme/app-theme";
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
  const app = useAppTheme();
  const { clearFailure, failure, pending, run } = useAuthAction();
  const router = useRouter();
  const dark = useColorScheme() === "dark";

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
    router.push("/sign-in/email");
  }, [router]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      // 세이프 에어리어를 여기서 잡는다 — py 하드코딩과 justify-center를 걷어냈다.
      //
      // grow와 justify-between을 함께 쓰지 않는다. grow가 minHeight를 프레임
      // 높이로 잡는데 contentInsetAdjustmentBehavior가 그 위에 상단 인셋을 더해서,
      // 두 블록을 양 끝으로 벌리면 아래 블록이 인셋만큼 화면 밖으로 밀린다 —
      // 시뮬레이터에서 `이메일로 계속하기`가 실제로 잘려 나갔다.
      contentContainerClassName="gap-10 px-5 pb-6 pt-10"
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* 헤더가 없는 화면이라 워드마크는 스택 타이틀이 아니라 본문 Text다. */}
      <View className="gap-2">
        <Text className="font-bold text-4xl text-foreground tracking-tight">
          flyn
        </Text>
        <Text className="text-[17px] text-muted-foreground">
          로그인하고 시작하세요.
        </Text>
      </View>

      <View className="gap-3">
        {/* Apple이 기준이고 Google을 여기 맞춘다. cornerRadius와 buttonStyle 말고는
            우리가 건드릴 수 있는 손잡이가 없다 — style의 배경·모서리는 동작하지
            않을뿐더러 App Store 가이드라인 위반이다. */}
        <AppleAuthenticationButton
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

        <GoogleButton disabled={pending} onPress={handleGoogle} />

        <Pressable
          accessibilityRole="button"
          className="items-center py-3"
          onPress={handleEmail}
        >
          <Text className="text-[17px] text-primary">이메일로 계속하기</Text>
        </Pressable>

        {/* 라벨을 갈아끼우지 않고 위에 얹는다. */}
        {pending ? (
          <View className="absolute inset-0 items-center justify-center rounded-2xl bg-overlay">
            <ActivityIndicator color={app.primary} />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
