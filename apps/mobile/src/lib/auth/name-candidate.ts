import {
  isDisplayNameSubmittable,
  prepareDisplayNameCandidate,
} from "../display-name";
import { supabase } from "../supabase";

/**
 * Apple·Google이 준 이름을 온보딩 입력칸에 **미리 채우기 위한** 후보다.
 * 자동 저장하지 않는다 — 사용자가 확인하고 제출해야 프로필의 값이 된다.
 */

/**
 * 방금 로그인한 credential에서 직접 꺼낸 이름.
 *
 * **경합을 없애려고 둔다.** Apple 이름은 `updateUser`로 서버에 올린 뒤
 * 세션 메타데이터로 다시 읽는 구조였는데, `signInWithIdToken`이 이미
 * SIGNED_IN을 쏜 뒤라 온보딩이 먼저 읽을 수 있었다. 그러면 Apple이 평생 한 번
 * 주는 이름이 조용히 사라진다. 기기가 이미 아는 값을 서버에 왕복시키지 않는다.
 */
let deviceKnownName: string | null = null;

/** 세션이 서기 **전에** 부른다 — 그래야 온보딩이 마운트될 때 이미 여기 있다. */
export function rememberProviderName(name: string): void {
  deviceKnownName = name;
}

/**
 * 다음 사용자에게 새지 않게 비운다. A가 Apple로 로그인해 온보딩을 마치지 않고
 * 로그아웃하면, B의 온보딩에 A의 이름이 미리 채워진다.
 */
export function forgetProviderName(): void {
  deviceKnownName = null;
}

function usable(raw: unknown): string {
  if (typeof raw !== "string") {
    return "";
  }

  const candidate = prepareDisplayNameCandidate(raw);

  // 보이지 않거나 이름에 쓸 수 없는 문자뿐인 후보는 없는 것으로 친다.
  return isDisplayNameSubmittable(candidate) ? candidate : "";
}

/**
 * 기기가 기억한 값이 먼저다. 없으면 세션 메타데이터로 폴백한다 — Google은
 * `signInWithIdToken`이 `name`을 채워 주고, Apple도 다음 실행부터는 이쪽이
 * 유일한 출처다. 이메일 OTP에는 둘 다 없어 빈 문자열이 되고, 그것이 곧 "빈
 * 입력칸으로 시작"이다.
 *
 * `getSession`은 저장소에서 읽는 로컬 호출이라 왕복이 없다. 실패는 후보가
 * 없는 것과 같게 다룬다 — 이름 후보 때문에 온보딩을 막지 않는다.
 */
export async function fetchNameCandidate(): Promise<string> {
  const remembered = usable(deviceKnownName);

  if (remembered) {
    return remembered;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const metadata = data.session?.user.user_metadata ?? {};

    // `??`를 쓰면 빈 문자열 full_name이 멀쩡한 name을 가린다. Apple ID 토큰에
    // 이름 클레임이 없으면 GoTrue가 실제로 ''를 쓴다.
    return usable(metadata.full_name) || usable(metadata.name);
  } catch {
    return "";
  }
}
