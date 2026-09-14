import { InputOTP, REGEXP_ONLY_DIGITS } from "heroui-native/input-otp";
import { type ComponentRef, type ReactNode, useEffect, useState } from "react";
import { View } from "react-native";

import { OTP_LENGTH } from "@/features/auth/config/email-otp";
import {
  describeCodeSent,
  formatResendLabel,
  toCodeDigits,
} from "@/features/auth/state/email-code";
import { useCodeVerify } from "@/features/auth/state/use-code-verify";
import {
  AuthFieldError,
  AuthLayout,
  AuthSubtitle,
} from "@/features/auth/ui/auth-layout";
import { signInLabels } from "@/features/auth/ui/sign-in-labels";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";
import { Button } from "@/shared/ui/button";
import { StatusLine } from "@/shared/ui/status-line";

const VERIFY_PROGRESS_DELAY_MS = 1000;

/**
 * Pulls the code out of whatever was pasted.
 *
 * HeroUI's own transformer looks for exactly six consecutive digits and returns
 * an empty string when it cannot find them, so a clipboard holding anything
 * besides the bare code wiped the field instead of filling it. Keeping every
 * digit and dropping the rest fills what it can.
 *
 * It cannot do better than that: the component caps its hidden input at the
 * code length and does not let a caller lift the cap, so iOS truncates a longer
 * paste before this ever runs.
 */
function pastedCode(pasted: string): string {
  return toCodeDigits(pasted);
}

/**
 * HeroUI's own slot: its default size, gathered at the start of the line, and
 * its own invalid outline when the code was wrong.
 */
function renderSlots({ slots }: { slots: { index: number }[] }) {
  return slots.map((slot) => (
    <InputOTP.Slot index={slot.index} key={slot.index} />
  ));
}

function CodeInputTarget({
  attempt,
  children,
  isVerifying,
}: {
  attempt: number;
  children: ReactNode;
  isVerifying: boolean;
}) {
  const [visibleAttempt, setVisibleAttempt] = useState<number>();

  useEffect(() => {
    if (!isVerifying) {
      return;
    }

    const timer = setTimeout(() => {
      setVisibleAttempt(attempt);
    }, VERIFY_PROGRESS_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [attempt, isVerifying]);

  const showsProgress = isVerifying && visibleAttempt === attempt;

  return (
    <View className="min-h-12 justify-center">
      {showsProgress ? (
        <View className="min-h-12 items-center justify-center px-2">
          <StatusLine
            label={signInLabels.verifying}
            loading
            sizeRole="control"
            testID="sign-in-code-checking"
          />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export function SignInCodeScreen({ email }: { email: string }) {
  const form = useCodeVerify(email);
  const isWaiting = form.secondsLeft > 0;
  const codeRef = useFocusOnArrival<ComponentRef<typeof InputOTP>>();

  return (
    <AuthLayout
      footer={
        <Button
          // The countdown is the whole message, so the accessible name has to
          // carry it too; a fixed name would read the same for all 60 seconds.
          accessibilityLabel={formatResendLabel(form.secondsLeft)}
          isDisabled={form.isBusy || isWaiting}
          isPending={form.pending === "resend"}
          onPress={form.resend}
          variant="tertiary"
        >
          {formatResendLabel(form.secondsLeft)}
        </Button>
      }
      subtitle={<AuthSubtitle>{describeCodeSent(email)}</AuthSubtitle>}
      title="코드를 입력해 주세요"
    >
      <View className="gap-2">
        <CodeInputTarget
          attempt={form.resetCount}
          isVerifying={form.pending === "verify"}
        >
          <InputOTP
            isDisabled={form.isBusy}
            isInvalid={form.failure !== undefined}
            // Remounting clears the wrong code. The ref focuses the new input.
            key={form.resetCount}
            maxLength={OTP_LENGTH}
            onChange={form.changeCode}
            pasteTransformer={pastedCode}
            pattern={REGEXP_ONLY_DIGITS}
            ref={codeRef}
            textInputProps={{
              accessibilityLabel: signInLabels.code,
              testID: "sign-in-code",
            }}
            value={form.code}
          >
            <InputOTP.Group>{renderSlots}</InputOTP.Group>
          </InputOTP>
        </CodeInputTarget>

        {/* No `TextField` here to hold the state, so the error takes it directly. */}
        <AuthFieldError
          isInvalid={form.failure !== undefined}
          testID="sign-in-error-code"
        >
          {form.failure?.message}
        </AuthFieldError>
      </View>
    </AuthLayout>
  );
}
