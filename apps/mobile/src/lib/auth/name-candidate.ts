import {
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../display-name";
import { supabase } from "../supabase";

/**
 * Apple·Google이 준 이름을 온보딩 입력칸에 **미리 채우기 위한** 후보다.
 * 자동 저장하지 않는다 — 사용자가 확인하고 제출해야 프로필의 값이 된다(§3).
 *
 * Apple은 `fullName`을 최초 로그인 1회만 주므로 그때 `full_name`으로 넣어
 * 뒀고(auth/apple.ts), Google은 `signInWithIdToken`이 `name`을 함께 채운다.
 * 이메일 OTP에는 둘 다 없어 빈 문자열이 되고, 그것이 곧 "빈 입력칸으로 시작"이다.
 *
 * `getSession`은 저장소에서 읽는 로컬 호출이라 왕복이 없다. 실패는 후보가
 * 없는 것과 같게 다룬다 — 이름 후보 때문에 온보딩을 막지 않는다.
 */
export async function fetchNameCandidate(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const metadata = data.session?.user.user_metadata ?? {};
    const raw = metadata.full_name ?? metadata.name;

    if (typeof raw !== "string") {
      return "";
    }

    const candidate = normalizeDisplayName(raw);

    // 보이지 않는 문자뿐인 후보는 없는 것으로 친다. 길이는 거르지 않는다 —
    // 상한은 입력칸이 정하고, 여기서 또 재면 규칙이 두 곳으로 갈린다.
    return isDisplayNameSubmittable(candidate) ? candidate : "";
  } catch {
    return "";
  }
}
