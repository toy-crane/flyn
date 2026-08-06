import { useLocalSearchParams } from "expo-router";
import { LinkButton, Spinner, Typography, useThemeColor } from "heroui-native";
import { useCallback, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { OtpInput, type OtpInputRef } from "../../components/sign-in/otp-input";
import { sendEmailCode, verifyEmailCode } from "../../lib/auth/email";
import { describeAuthError } from "../../lib/auth/errors";
import { authFailedFeedback, authSucceededFeedback } from "../../lib/haptics";
import { isCodeComplete } from "../../lib/otp-code";
import { IGNORED, useAuthAction } from "../../lib/use-auth-action";
import { useResendCooldown } from "../../lib/use-resend-cooldown";

/**
 * 코드 입력. 6칸과 그 위에 겹친 단일 필드는 HeroUI 토큰 위의 커스텀
 * `OtpInput`이 소유한다 — 라이브러리 `InputOTP`가 붙여넣기 검증에서 탈락했다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표와 근거).
 *
 * `다른 이메일로 받기`는 없다 — 헤더의 뒤로가기가 그 역할을 한다.
 */
export default function CodeScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const {
    clearFailure: clearVerifyFailure,
    failure: verifyFailure,
    pending: verifyPending,
    run: runVerification,
  } = useAuthAction();
  const {
    failure: resendFailure,
    pending: resendPending,
    run: runResend,
  } = useAuthAction();
  const { canResend, remaining, restart } = useResendCooldown();
  const [code, setCode] = useState("");
  const codeInputRef = useRef<OtpInputRef>(null);
  const lastSubmittedCode = useRef<string | null>(null);
  const locked = verifyPending || resendPending;
  const accent = useThemeColor("accent");

  const focusCodeInput = useCallback(() => {
    requestAnimationFrame(() => codeInputRef.current?.focus());
  }, []);

  const handleVerify = useCallback(
    async (nextCode: string) => {
      // 주소가 없으면 검증할 것이 없다. 딥링크로 이 화면에 바로 온 경우다.
      if (
        !(email && isCodeComplete(nextCode)) ||
        locked ||
        lastSubmittedCode.current === nextCode
      ) {
        return;
      }

      lastSubmittedCode.current = nextCode;

      const result = await runVerification(
        () => verifyEmailCode(email, nextCode),
        "email:verify"
      );

      if (result === null) {
        // 가드가 이 화면을 걷어가기 직전의 마지막 신호다.
        authSucceededFeedback();
      } else if (result !== IGNORED) {
        authFailedFeedback();
        setCode("");
        lastSubmittedCode.current = null;
        focusCodeInput();
      }
    },
    [email, focusCodeInput, locked, runVerification]
  );

  const handleChangeCode = useCallback(
    (next: string) => {
      setCode(next);
      clearVerifyFailure();

      if (!isCodeComplete(next)) {
        lastSubmittedCode.current = null;
        return;
      }

      handleVerify(next);
    },
    [clearVerifyFailure, handleVerify]
  );

  const handleResend = useCallback(async () => {
    if (!(email && canResend) || locked) {
      return;
    }

    const result = await runResend(() => sendEmailCode(email), "email:resend");

    if (result === IGNORED) {
      return;
    }

    if (result === null) {
      setCode("");
      lastSubmittedCode.current = null;
      clearVerifyFailure();
      restart();
      focusCodeInput();
      return;
    }

    const retryAfter = describeAuthError(result.error).retryAfterSeconds;

    if (retryAfter && retryAfter > remaining) {
      restart(retryAfter);
    }
  }, [
    canResend,
    clearVerifyFailure,
    email,
    focusCodeInput,
    locked,
    remaining,
    restart,
    runResend,
  ]);

  const resendLabel = canResend
    ? "코드 다시 받기"
    : `${remaining}초 후 다시 받기`;
  const resendLocked = !(email && canResend) || locked;
  let inlineAction = (
    <>
      <Typography color="muted" type="body-sm">
        코드가 안 왔나요?
      </Typography>
      <LinkButton isDisabled={resendLocked} onPress={handleResend} size="sm">
        <LinkButton.Label className="text-accent">
          {resendLabel}
        </LinkButton.Label>
      </LinkButton>
    </>
  );

  if (resendPending) {
    inlineAction = (
      <>
        <Spinner color={accent} size="sm" />
        <Typography color="muted" type="body-sm">
          보내는 중…
        </Typography>
      </>
    );
  }

  if (verifyPending) {
    inlineAction = (
      <>
        <Spinner color={accent} size="sm" />
        <Typography color="muted" type="body-sm">
          확인 중…
        </Typography>
      </>
    );
  }

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 px-5 pt-6"
      contentInsetAdjustmentBehavior="automatic"
      // 칸을 다시 탭해 키보드를 되부를 수 있어야 한다.
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Typography.Paragraph>6자리 코드를 입력해 주세요.</Typography.Paragraph>
        {email ? (
          <Typography.Paragraph color="muted">{email}</Typography.Paragraph>
        ) : null}
      </View>

      <View className="gap-3">
        <OtpInput
          disabled={locked}
          invalid={verifyFailure?.kind === "invalidCode"}
          onChangeText={handleChangeCode}
          ref={codeInputRef}
          value={code}
        />

        <View className="min-h-6 flex-row items-center justify-center gap-2">
          {inlineAction}
        </View>

        {email ? null : (
          <Typography className="text-danger" type="body-sm">
            이메일 주소를 다시 입력해 주세요.
          </Typography>
        )}

        {/* 입력에 붙은 검증 결과라 얼럿이 아니라 인라인 각주다. */}
        {verifyFailure ? (
          <Typography className="text-danger" type="body-sm">
            {verifyFailure.message}
          </Typography>
        ) : null}

        {resendFailure ? (
          <Typography className="text-danger" type="body-sm">
            {resendFailure.message}
          </Typography>
        ) : null}
      </View>
    </ScrollView>
  );
}
