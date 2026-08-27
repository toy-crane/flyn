import type { Database } from "@repo/supabase";
import type { SupabaseContext } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import type { MiddlewareHandler } from "hono";

/**
 * 로그인을 확인한 경로가 쥐고 있는 것.
 *
 * `supabase`는 그 사람의 권한으로 데이터베이스에 닿는 클라이언트다. 스키마
 * 타입을 붙여 두면 경로가 없는 열을 읽거나 함수 인자를 빠뜨릴 때 배포가
 * 아니라 타입 검사에서 걸린다.
 */
export interface AuthedEnv {
  Variables: { supabaseContext: SupabaseContext<Database> };
}

/**
 * 비용이 드는 AI 경로가 요구하는 로그인 확인.
 *
 * 경로마다 따로 만들지 않고 여기서 한 번에 만든다. `app.use('*')`로 걸면
 * `/health`까지 함께 막히므로, 각 경로가 이 미들웨어를 직접 붙인다.
 *
 * secret key 자리표시자는 설정 선택이 아니라 우회다. `@supabase/server@1.4.1`은
 * 인증 방식과 무관하게 `supabaseAdmin`을 미리 만들어서, `auth: "user"`도 secret
 * key 없이는 실행을 거부한다. AI 경로는 관리자 권한을 쓰지 않으므로 진짜 secret
 * key를 두면 RLS를 통째로 넘길 힘만 배포에 남는다. 자리표시자는 그 힘을 두지
 * 않고, 나중에 누가 `supabaseAdmin`을 부르면 조용히 통과하지 않고 이 문자열로
 * 실패한다. 패키지가 관리자 클라이언트를 필요할 때만 만들면 지운다.
 */
export function createUserGuard(
  /**
   * AI 경로의 인증 미들웨어. 테스트가 진짜 Supabase 프로젝트 없이 handler까지
   * 닿으려고 바꿔 끼운다. 그 밖에는 바꾸지 않는다.
   */
  authMiddleware?: MiddlewareHandler
): [MiddlewareHandler<AuthedEnv>, MiddlewareHandler<AuthedEnv>] {
  const requireUser =
    authMiddleware ??
    withSupabase<Database>({
      auth: "user",
      env: { secretKeys: { default: "unused-ai-route-never-calls-admin" } },
    });

  const requireCurrentUser: MiddlewareHandler<AuthedEnv> = async (c, next) => {
    const { data, error } = await c.var.supabaseContext.supabase.auth.getUser();

    if (error || !data.user) {
      return c.json({ error: "Unauthorized." }, 401);
    }

    await next();
  };

  return [requireUser, requireCurrentUser];
}
