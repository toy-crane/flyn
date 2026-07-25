import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from "expo-apple-authentication";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { signInWithApple } from "../lib/auth/apple";
import { sendEmailCode, verifyEmailCode } from "../lib/auth/email";
import { signInWithGoogle } from "../lib/auth/google";

const CODE_LENGTH = 6;

export default function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // 코드를 보낸 뒤에만 입력칸을 연다 — 이메일 단계와 코드 단계를 가르는 상태.
  const [codeSent, setCodeSent] = useState(false);
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
      return result;
    },
    []
  );

  const handleApple = useCallback(() => {
    run(signInWithApple);
  }, [run]);

  const handleGoogle = useCallback(() => {
    run(signInWithGoogle);
  }, [run]);

  const handleSendCode = useCallback(async () => {
    const result = await run(() => sendEmailCode(email.trim()));
    if (!result) {
      setCodeSent(true);
    }
  }, [email, run]);

  const handleVerifyCode = useCallback(() => {
    run(() => verifyEmailCode(email.trim(), code));
  }, [code, email, run]);

  const handleChangeEmail = useCallback(() => {
    setCodeSent(false);
    setCode("");
    setError(null);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-slate-100 dark:bg-slate-950"
      contentContainerClassName="grow justify-center gap-8 px-6 py-16"
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center gap-2">
        <Text className="font-medium text-sky-600 text-xs uppercase tracking-[3px] dark:text-sky-400">
          walking skeleton
        </Text>
        <Text className="font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          flyn
        </Text>
        <Text className="text-center text-base text-slate-600 leading-relaxed dark:text-slate-400">
          Apple·Google 또는 이메일로 로그인해 세션을 얻는다.
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

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
        <Text className="text-slate-500 text-xs dark:text-slate-500">또는</Text>
        <View className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
      </View>

      {codeSent ? (
        <View className="gap-3">
          <Text className="text-center text-slate-600 text-sm dark:text-slate-400">
            {email}로 보낸 6자리 코드를 입력하라.
          </Text>
          <TextInput
            autoComplete="one-time-code"
            autoFocus
            className="rounded-lg bg-white px-4 py-3 text-center text-2xl text-slate-900 tracking-[8px] dark:bg-white/10 dark:text-slate-50"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            onChangeText={setCode}
            placeholder="000000"
            textContentType="oneTimeCode"
            value={code}
          />
          <Pressable
            className={`items-center rounded-lg bg-sky-600 py-3 ${code.length === CODE_LENGTH ? "" : "opacity-40"}`}
            disabled={code.length !== CODE_LENGTH}
            onPress={handleVerifyCode}
          >
            <Text className="font-semibold text-white">로그인</Text>
          </Pressable>
          <Pressable className="items-center py-1" onPress={handleChangeEmail}>
            <Text className="text-slate-500 text-sm dark:text-slate-400">
              다른 이메일로 받기
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-3">
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            className="rounded-lg bg-white px-4 py-3 text-slate-900 dark:bg-white/10 dark:text-slate-50"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="이메일 주소"
            placeholderTextColor={dark ? "#94a3b8" : "#64748b"}
            value={email}
          />
          <Pressable
            className={`items-center rounded-lg bg-sky-600 py-3 ${email.includes("@") ? "" : "opacity-40"}`}
            disabled={!email.includes("@")}
            onPress={handleSendCode}
          >
            <Text className="font-semibold text-white">코드 받기</Text>
          </Pressable>
        </View>
      )}

      {error ? (
        <Text className="text-center text-rose-600 dark:text-rose-400">
          로그인 실패: {error}
        </Text>
      ) : null}

      <StatusBar style="auto" />
    </ScrollView>
  );
}
