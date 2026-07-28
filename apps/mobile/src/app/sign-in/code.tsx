import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { CodeInput } from "../../components/sign-in/code-input";
import { verifyEmailCode } from "../../lib/auth/email";
import { authFailedFeedback, authSucceededFeedback } from "../../lib/haptics";
import { isCodeComplete } from "../../lib/otp-code";
import { useAuthAction } from "../../lib/use-auth-action";
import { colors } from "../../theme/colors";

/**
 * 코드 입력. 6칸 합성이 RN이라 이 화면도 RN이다
 * (docs/decisions/expo-ui-by-default.md의 스파이크 결과).
 *
 * `다른 이메일로 받기`는 없다 — 헤더의 뒤로가기가 그 역할을 한다.
 */
export default function CodeScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const { clearFailure, failure, pending, run } = useAuthAction();
  const [code, setCode] = useState("");

  const handleChangeCode = useCallback(
    (next: string) => {
      setCode(next);
      clearFailure();
    },
    [clearFailure]
  );

  const handleVerify = useCallback(async () => {
    // 주소가 없으면 검증할 것이 없다. 딥링크로 이 화면에 바로 온 경우다.
    if (!(email && isCodeComplete(code))) {
      return;
    }

    const result = await run(
      () => verifyEmailCode(email, code),
      "email:verify"
    );

    if (result === null) {
      // 가드가 이 화면을 걷어가기 직전의 마지막 신호다.
      authSucceededFeedback();
    } else if (result) {
      authFailedFeedback();
    }
  }, [code, email, run]);

  const locked = !isCodeComplete(code) || pending;

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      className="flex-1"
      contentContainerClassName="gap-6 px-5 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      // CodeInput을 다시 탭해 키보드를 되부를 수 있어야 한다.
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.systemBackground }}
    >
      <Text className="text-[15px]" style={{ color: colors.secondaryLabel }}>
        {email}로 보낸 6자리 코드를 입력해 주세요.
      </Text>

      <CodeInput
        invalid={failure?.kind === "invalidCode"}
        onChangeText={handleChangeCode}
        value={code}
      />

      {/* 입력에 붙은 검증 결과라 얼럿이 아니라 인라인 각주다. */}
      {failure ? (
        <Text className="text-[13px]" style={{ color: colors.systemRed }}>
          {failure.message}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        className="items-center justify-center"
        disabled={locked}
        onPress={handleVerify}
        style={{
          // opacity-40은 iOS 관용이 아니다. 채운 버튼의 비활성은 회색 배경이다.
          backgroundColor: locked ? colors.systemGray5 : colors.systemBlue,
          borderCurve: "continuous",
          borderRadius: 14,
          height: 50,
        }}
      >
        <Text
          className="font-semibold text-[17px]"
          style={{ color: locked ? colors.tertiaryLabel : "#FFFFFF" }}
        >
          로그인
        </Text>
      </Pressable>

      {pending ? <ActivityIndicator /> : null}

      <View />
    </ScrollView>
  );
}
