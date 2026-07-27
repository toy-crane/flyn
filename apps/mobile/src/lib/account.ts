import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { reportAuthFailure } from "./auth/errors";
import { queryClient } from "./query-client";
import { rpc } from "./rpc";
import { supabase } from "./supabase";

/**
 * 전체 계정 삭제(§5). 서버가 Auth 사용자를 hard delete하고, 앱은 요청과 로컬
 * 정리만 한다 — secret·admin 권한은 모바일에 오지 않는다.
 *
 * 다른 auth 헬퍼와 같은 규약: 성공은 null, 실패만 `{ error }`.
 */

const GENERIC_ERROR = "계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/**
 * 서버가 이유를 이미 사용자용 문장으로 준다. 못 읽으면 일반 문구로 떨어진다 —
 * 응답 본문을 그대로 노출하지 않는다.
 *
 * 인자 타입을 `Response`로 적지 않는다. hono 클라이언트가 돌려주는 것은
 * `ClientResponse`이고, RN의 전역 `Response`와 구조가 어긋난다.
 */
async function describeFailure(response: {
  json: () => Promise<unknown>;
}): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };

    return typeof body.error === "string" ? body.error : GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
}

/**
 * 서버 계정이 사라진 뒤의 정리. **여기서 실패해도 서버 계정을 되살리지
 * 않는다**(§5) — 로컬 데이터를 버리고 signed-out 상태로 간다.
 *
 * `scope: "local"`을 쓰는 이유는 서버에 폐기를 요청할 세션이 남아 있지 않기
 * 때문이다. 사용자가 지워지면 세션·리프레시 토큰도 cascade로 함께 사라져,
 * 다른 기기까지 이미 무효다. (네트워크를 안 탄다는 뜻은 아니다 — auth-js는
 * scope와 무관하게 logout을 한 번 친다.)
 */
async function discardLocalState(): Promise<void> {
  await GoogleSignin.signOut().catch(() => {
    // Google로 로그인한 적이 없어도 나머지 정리는 계속한다.
  });

  // signOut은 던지지 않고 `{ error }`로 resolve한다 — 예전의 `.catch`로는
  // 아무것도 잡히지 않았고, 그래서 실패가 조용히 성공으로 보고됐다. 저장소가
  // 통째로 터져 거부하는 경우까지는 try가 받는다. 어느 쪽이든 아래 캐시
  // 비우기는 반드시 일어나야 하므로 진행을 막지 않는다.
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      reportAuthFailure("account:discard-local", error.message);
    }
  } catch (e) {
    reportAuthFailure(
      "account:discard-local",
      e instanceof Error ? e.message : String(e)
    );
  }

  // 비우지 않으면 다음 사용자가 지워진 계정의 행을 그대로 본다.
  queryClient.clear();
}

export async function deleteAccount(): Promise<{ error: string } | null> {
  try {
    const response = await rpc.account.$delete();

    if (!response.ok) {
      // 서버가 중단했다 — 로컬 세션은 그대로 두어 다시 시도할 수 있게 한다.
      return { error: await describeFailure(response) };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : GENERIC_ERROR };
  }

  // 서버 계정은 사라졌다. 여기서부터는 실패해도 되돌리지 않는다(§5).
  await discardLocalState();

  return null;
}
