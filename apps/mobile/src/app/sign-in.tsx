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
const NON_DIGITS = /\D/g;

// 재진입으로 무시된 호출을 성공(null)과 구분한다 — 둘 다 falsy면 UI가 앞으로 나가버린다.
const IGNORED = Symbol("ignored");
type RunResult = { error: string } | null | typeof IGNORED;

export default function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // 코드를 보낸 뒤에만 입력칸을 연다 — 이메일 단계와 코드 단계를 가르는 상태.
  const [codeSent, setCodeSent] = useState(false);
  // 렌더에 쓰이는 게 아니라 중복 제출만 막는다. 표시용은 pending이 담당한다.
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const dark = useColorScheme() === "dark";

  // 성공하면 onAuthStateChange가 상태를 뒤집어 이 화면을 벗어난다 — 여기선 실패만 표시.
  const run = useCallback(
    async (
      signIn: () => Promise<{ error: string } | null>
    ): Promise<RunResult> => {
      if (busy.current) {
        return IGNORED;
      }

      busy.current = true;
      setPending(true);
      setError(null);

      try {
        const result = await signIn();

        if (result) {
          setError(result.error);
        }

        return result;
      } catch (e) {
        // 헬퍼가 던지면 여기서 잡는다. finally가 없으면 busy가 영구히 잠겨 화면이 죽는다.
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        return { error: message };
      } finally {
        busy.current = false;
        setPending(false);
      }
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

    // 성공(null)일 때만 넘어간다. 무시된 호출이나 실패는 이메일 단계에 남는다.
    if (result === null) {
      setCodeSent(true);
    }
  }, [email, run]);

  const handleVerifyCode = useCallback(() => {
    if (code.length !== CODE_LENGTH) {
      return;
    }

    run(() => verifyEmailCode(email.trim(), code));
  }, [code, email, run]);

  // 붙여넣기에는 "코드: 448183"처럼 숫자가 아닌 문자가 섞여 온다. maxLength가 앞에서
  // 잘라버리면 6자로 보이지만 검증은 실패하므로, 숫자만 남기고 나서 자른다.
  const handleChangeCode = useCallback((next: string) => {
    setCode(next.replace(NON_DIGITS, "").slice(0, CODE_LENGTH));
  }, []);

  const handleChangeEmail = useCallback(() => {
    setCodeSent(false);
    setCode("");
    setError(null);
  }, []);

  const codeComplete = code.length === CODE_LENGTH;
  const emailValid = email.trim().includes("@");
  const placeholderColor = dark ? "#94a3b8" : "#64748b";

  return (
    <ScrollView
      // 키보드가 올라오면 콘텐츠를 밀어올린다. 없으면 화면이 딱 프레임 높이라
      // 스크롤 여지가 0이 되어 제출 버튼이 키보드에 가린 채 닿지 않는다.
      automaticallyAdjustKeyboardInsets
      className="flex-1 bg-slate-100 dark:bg-slate-950"
      contentContainerClassName="grow justify-center gap-8 px-6 py-16"
      keyboardDismissMode="interactive"
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
            onChangeText={handleChangeCode}
            placeholder="000000"
            placeholderTextColor={placeholderColor}
            textContentType="oneTimeCode"
            value={code}
          />
          <Pressable
            accessibilityLabel="로그인"
            accessibilityRole="button"
            accessibilityState={{ disabled: !codeComplete || pending }}
            className={`items-center rounded-lg bg-sky-600 py-3 ${codeComplete && !pending ? "" : "opacity-40"}`}
            disabled={!codeComplete || pending}
            onPress={handleVerifyCode}
          >
            <Text className="font-semibold text-white">
              {pending ? "확인 중…" : "로그인"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="items-center py-1"
            onPress={handleChangeEmail}
          >
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
            placeholderTextColor={placeholderColor}
            value={email}
          />
          <Pressable
            accessibilityLabel="코드 받기"
            accessibilityRole="button"
            accessibilityState={{ disabled: !emailValid || pending }}
            className={`items-center rounded-lg bg-sky-600 py-3 ${emailValid && !pending ? "" : "opacity-40"}`}
            disabled={!emailValid || pending}
            onPress={handleSendCode}
          >
            <Text className="font-semibold text-white">
              {pending ? "보내는 중…" : "코드 받기"}
            </Text>
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
