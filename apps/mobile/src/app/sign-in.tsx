import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from "expo-apple-authentication";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Text, useColorScheme, View } from "react-native";
import { signInWithApple } from "../lib/auth/apple";
import { signInWithGoogle } from "../lib/auth/google";

export default function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const dark = useColorScheme() === "dark";

  // 성공하면 onAuthStateChange가 상태를 뒤집어 이 화면을 벗어난다 — 여기선 실패만 표시.
  const run = useCallback(
    async (signIn: () => Promise<{ error: string } | null>) => {
      if (busy.current) {
        return;
      }
      busy.current = true;
      setError(null);
      const result = await signIn();
      if (result) {
        setError(result.error);
      }
      busy.current = false;
    },
    []
  );

  const handleApple = useCallback(() => {
    run(signInWithApple);
  }, [run]);

  const handleGoogle = useCallback(() => {
    run(signInWithGoogle);
  }, [run]);

  return (
    <View className="flex-1 items-center justify-center gap-10 bg-slate-100 px-6 dark:bg-slate-950">
      <View className="items-center gap-2">
        <Text className="font-medium text-sky-600 text-xs uppercase tracking-[3px] dark:text-sky-400">
          walking skeleton
        </Text>
        <Text className="font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          flyn
        </Text>
        <Text className="text-center text-base text-slate-600 leading-relaxed dark:text-slate-400">
          Apple 또는 Google로 로그인해 세션을 얻는다.
        </Text>
      </View>

      {/* HIG 준수 — 버튼은 벤더 기본 컴포넌트 그대로, Uniwind는 레이아웃·간격만. */}
      <View className="items-center gap-3">
        <AppleAuthenticationButton
          buttonStyle={
            dark
              ? AppleAuthenticationButtonStyle.WHITE
              : AppleAuthenticationButtonStyle.BLACK
          }
          buttonType={AppleAuthenticationButtonType.SIGN_IN}
          cornerRadius={4}
          onPress={handleApple}
          style={{ height: 48, width: 312 }}
        />
        <GoogleSigninButton
          color={
            dark
              ? GoogleSigninButton.Color.Light
              : GoogleSigninButton.Color.Dark
          }
          onPress={handleGoogle}
          size={GoogleSigninButton.Size.Wide}
        />
      </View>

      {error ? (
        <Text className="text-center text-rose-600 dark:text-rose-400">
          로그인 실패: {error}
        </Text>
      ) : null}

      <StatusBar style="auto" />
    </View>
  );
}
