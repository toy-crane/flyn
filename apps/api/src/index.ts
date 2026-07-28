import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  type ChatDependencies,
  ChatHttpError,
  createProductionChatDependencies,
  respondToChatMessage,
} from "./chat";

interface Env {
  Variables: {
    supabaseContext: SupabaseContext<Database>;
  };
}

interface ApiDependencies {
  chat?: ChatDependencies;
}

export function createApiApp(dependencies: ApiDependencies = {}) {
  const chat = dependencies.chat ?? createProductionChatDependencies();

  // 체이닝해야 AppType에 포함된다 — 따로 등록한 라우트는 조용히 빠진다.
  // CORS는 @supabase/server가 처리하지 않는다.
  return (
    new Hono<Env>()
      .use("*", cors())
      .get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }))
      .post(
        "/chats/:chatId/messages",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          const context = c.var.supabaseContext;
          const userId = context.userClaims?.id;

          if (!userId) {
            return c.json({ error: "no user" }, 401);
          }

          let input: unknown;
          try {
            input = await c.req.json();
          } catch {
            return c.json({ error: "메시지 형식이 올바르지 않습니다." }, 400);
          }

          try {
            return await respondToChatMessage({
              context,
              dependencies: chat,
              input,
              requestSignal: c.req.raw.signal,
              roomId: c.req.param("chatId"),
              userId,
            });
          } catch (error) {
            if (error instanceof ChatHttpError) {
              return c.json(
                {
                  error: error.message,
                  ...(error.retryable ? { retryable: true } : {}),
                },
                error.status
              );
            }

            console.error("[chat] request failed", {
              message: error instanceof Error ? error.message : String(error),
              roomId: c.req.param("chatId"),
            });
            return c.json(
              {
                error: "채팅 요청을 처리하지 못했습니다.",
                retryable: true,
              },
              500
            );
          }
        }
      )
      /**
       * 전체 계정 삭제. Auth 사용자를 hard delete하면 프로필과 사용자 소유
       * 데이터가 `on delete cascade`로 함께 사라진다.
       *
       * Apple 승인 취소는 하지 않는다 —
       * docs/decisions/no-apple-token-revocation.md.
       *
       * 이 라우트가 admin 권한을 쓰는 이유가 이것이다. 삭제는 RLS로 표현할 수 없다.
       */
      .delete(
        "/account",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          const { supabaseAdmin, userClaims } = c.var.supabaseContext;
          const userId = userClaims?.id;

          if (!userId) {
            return c.json({ error: "no user" }, 401);
          }

          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

          // 404는 목표가 이미 달성된 상태다. 첫 요청이 서버에서 성공했는데 응답이
          // 유실되면 앱에는 세션이 남아 사용자가 다시 누르는데, 그때마다 404를 실패로
          // 답하면 **영원히 지울 수 없다** — 앱 안에서 계정을 지울 수 있어야 한다는
          // 요구를 정확히 어긴다. 이 엔드포인트는 멱등이어야 한다.
          if (error && error.status !== 404) {
            // 실패를 성공으로 답하면 앱이 로컬 세션을 비우고 로그인 화면으로 가버려,
            // 사용자는 지워졌다고 믿는데 계정은 그대로 남는다.
            //
            // 원문은 응답이 아니라 여기로 보낸다. 버리면 프로덕션에서 키가 잘못된
            // 것(403)인지 다른 이유인지 구분할 방법이 없다.
            console.error("[account] delete failed", {
              message: error.message,
              status: error.status,
            });

            return c.json(
              {
                error: "계정을 삭제하지 못했습니다.",
                retryable: true,
              },
              500
            );
          }

          return c.json({ deleted: true });
        }
      )
  );
}

const app = createApiApp();

export type AppType = typeof app;

export default app;
