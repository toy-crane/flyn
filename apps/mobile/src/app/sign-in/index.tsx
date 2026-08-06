import { useRouter } from "expo-router";
import { Button, Spinner, Typography, useThemeColor } from "heroui-native";
import { useCallback, useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppleContinueButton,
  GoogleContinueButton,
} from "../../components/sign-in/provider-buttons";
import { signInWithApple } from "../../lib/auth/apple";
import { signInWithGoogle } from "../../lib/auth/google";
import { authFailedFeedback } from "../../lib/haptics";
import { useAuthAction } from "../../lib/use-auth-action";

/**
 * 소셜 우선. HeroUI가 그리는 브랜드 표면이고 vendor 버튼만 각 브랜드 지침을
 * 따른다(docs/decisions/self-contained-native-ui-boundaries.md의 배정표).
 *
 * 성공하면 onAuthStateChange가 가드를 뒤집어 스택째 벗어난다 — 여기선 실패만 다룬다.
 */
export default function SignInScreen() {
  const { clearFailure, failure, pending, run } = useAuthAction();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // 화면에 홀로 뜨는 수동형 progress는 브랜드 accent가 아니라 중립이다
  // (docs/specs/neutral-loading-indicators/spec.md). launch 화면과 같은 토큰.
  const neutral = useThemeColor("muted");

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
        contentContainerClassName="grow px-5"
        // safe area는 런타임 값이라 토큰으로 접을 수 없는 자리다.
        contentContainerStyle={{
          paddingBottom: insets.bottom + 8,
          paddingTop: insets.top + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        testID="sign-in-scroll"
      >
        <View
          accessibilityElementsHidden={pending}
          className="flex-1"
          importantForAccessibility={pending ? "no-hide-descendants" : "auto"}
        >
          {/* 헤더가 없는 화면이라 워드마크는 스택 타이틀이 아니라 본문 텍스트다. */}
          <View className="gap-2">
            <Typography.Heading type="h1">flyn</Typography.Heading>
            <Typography.Paragraph color="muted">
              로그인하고 시작하세요.
            </Typography.Paragraph>
          </View>

          <View className="min-h-10 flex-1" testID="sign-in-flex-spacer" />

          <View testID="sign-in-actions">
            <View className="gap-3" testID="sign-in-social-actions">
              <AppleContinueButton disabled={pending} onPress={handleApple} />
              <GoogleContinueButton disabled={pending} onPress={handleGoogle} />
            </View>

            {/*
             * 이메일은 소셜과 대등하지 않다 — 구분선도 카드도 없이 Google 바로
             * 아래의 muted 텍스트 action이고, 44pt를 넘는 hit target만 지킨다
             * (docs/decisions/social-sign-in-presentation.md). 문구 크기는
             * 위 설명 줄과 같은 HeroUI body preset을 쓴다 — 앱이 따로 정하던
             * 17pt 대신 라이브러리의 타이포와 iOS body ramp를 따른다.
             */}
            <Button
              className="mt-1"
              isDisabled={pending}
              onPress={handleEmail}
              variant="ghost"
            >
              <Typography.Paragraph color="muted">
                이메일로 계속하기
              </Typography.Paragraph>
            </Button>
          </View>
        </View>
      </ScrollView>

      {pending ? (
        <View
          accessibilityLabel="로그인 중"
          accessibilityRole="progressbar"
          accessibilityViewIsModal
          className="absolute inset-0 items-center justify-center bg-backdrop"
          testID="sign-in-loading-overlay"
        >
          <Spinner color={neutral} />
        </View>
      ) : null}
    </View>
  );
}
