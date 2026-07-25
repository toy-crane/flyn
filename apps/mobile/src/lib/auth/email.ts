import { supabase } from "../supabase";

// apple·google 헬퍼와 같은 규약: 성공은 null, 실패만 { error }.

// 템플릿이 {{ .Token }}을 보내므로 링크가 아니라 6자리 코드가 간다(config.toml).
export async function sendEmailCode(
  email: string
): Promise<{ error: string } | null> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  return error ? { error: error.message } : null;
}

export async function verifyEmailCode(
  email: string,
  token: string
): Promise<{ error: string } | null> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  return error ? { error: error.message } : null;
}
