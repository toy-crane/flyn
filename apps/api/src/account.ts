import type { AppleGateway } from "./apple";

/**
 * 계정 삭제의 **순서**만 담는다(§5). 어느 단계에서 멈추는지가 이 스펙에서
 * 되돌릴 수 없는 판단이라, HTTP·Supabase·Apple에서 떼어내 여기 혼자 세운다.
 *
 * 가장 중요한 규칙 하나: **Apple 취소가 확실히 끝나기 전에는 Supabase 사용자를
 * 지우지 않는다.** 먼저 지우면 재시도할 수단(누가 어떤 token을 취소해야 하는지)
 * 자체가 사라지고, Apple 쪽 승인만 영원히 남는다.
 */

/** 삭제가 필요로 하는 서버 쪽 조회·삭제. 실제 구현은 Supabase admin이다. */
export interface AccountStore {
  deleteUser: (userId: string) => Promise<boolean>;
  hasAppleIdentity: (userId: string) => Promise<boolean>;
  /** 보관된 refresh token. 없으면 null. */
  readAppleRefreshToken: (userId: string) => Promise<string | null>;
}

export type DeletionOutcome =
  | { kind: "deleted" }
  /** Apple 연결 계정인데 서버에 취소 수단이 없다 — 지우면 승인이 남는다. */
  | { kind: "appleTokenUnavailable" }
  /** Apple이 취소를 거부했다. 재시도할 수 있게 두고 삭제는 하지 않는다. */
  | { kind: "appleRevokeFailed" }
  | { kind: "deleteFailed" };

export async function deleteAccount(
  store: AccountStore,
  apple: AppleGateway | null,
  userId: string
): Promise<DeletionOutcome> {
  if (await store.hasAppleIdentity(userId)) {
    // Apple 설정이 없으면 취소할 방법이 없다. "설정 안 됨"을 성공으로 넘기면
    // 심사 요구를 어긴 채 조용히 지나간다.
    if (apple === null) {
      return { kind: "appleTokenUnavailable" };
    }

    const refreshToken = await store.readAppleRefreshToken(userId);

    if (refreshToken === null) {
      return { kind: "appleTokenUnavailable" };
    }

    if (!(await apple.revoke(refreshToken))) {
      return { kind: "appleRevokeFailed" };
    }
  }

  // 여기까지 왔으면 Apple 쪽은 정리됐다. 프로필·throwaway 데이터·보관 token은
  // auth.users의 on delete cascade가 함께 지운다.
  return (await store.deleteUser(userId))
    ? { kind: "deleted" }
    : { kind: "deleteFailed" };
}
