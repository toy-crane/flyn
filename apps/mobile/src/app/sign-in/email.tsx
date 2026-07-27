import { useRouter } from "expo-router";
import { useCallback } from "react";
import { EmailForm } from "../../components/sign-in/email-form";
import { sendEmailCode } from "../../lib/auth/email";
import { useAuthAction } from "../../lib/use-auth-action";

/**
 * 발송만 맡는 얇은 라우트. 화면 자체는 SwiftUI인 `EmailForm`이 그린다.
 */
export default function EmailScreen() {
  const { failure, pending, run } = useAuthAction();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (email: string) => {
      const result = await run(() => sendEmailCode(email), "email:send");

      // 성공(null)일 때만 넘어간다. 재진입으로 무시됐거나(IGNORED) 실패했으면
      // 여기 머무른다 — 보내지도 않은 코드의 입력 화면으로 가면 안 된다.
      if (result === null) {
        router.push({ params: { email }, pathname: "/sign-in/code" });
      }
    },
    [router, run]
  );

  return (
    <EmailForm
      failure={failure?.message}
      onSubmit={handleSubmit}
      pending={pending}
    />
  );
}
