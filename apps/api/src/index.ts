import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { type AccountStore, deleteAccount } from "./account";
import {
  type AppleGateway,
  createAppleGateway,
  readAppleConfig,
} from "./apple";

interface Env {
  Variables: {
    supabaseContext: SupabaseContext<Database>;
  };
}

type Admin = SupabaseContext<Database>["supabaseAdmin"];

/** 설정이 없으면 null이다 — 호출자가 그 사실을 보고 판단한다. */
function appleGateway(): AppleGateway | null {
  const config = readAppleConfig();

  return config === null ? null : createAppleGateway(config);
}

function accountStore(admin: Admin): AccountStore {
  return {
    async deleteUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId);

      return !error;
    },

    async hasAppleIdentity(userId) {
      const { data, error } = await admin.auth.admin.getUserById(userId);

      if (error) {
        // 확인하지 못했으면 있다고 본다. 없다고 단정하면 취소를 건너뛴 채
        // 계정을 지우게 되고, 그건 되돌릴 수 없다.
        return true;
      }

      return (data.user.identities ?? []).some(
        (identity) => identity.provider === "apple"
      );
    },

    // 표는 Data API가 열지 않는 private 스키마에 있다. 이 정의자 함수가
    // service_role에게만 열린 유일한 통로다.
    async readAppleRefreshToken(userId) {
      const { data } = await admin.rpc("read_apple_refresh_token", {
        p_user_id: userId,
      });

      return data ?? null;
    },
  };
}

// 체이닝해야 AppType에 포함된다 — 따로 등록한 라우트는 조용히 빠진다.
// CORS는 @supabase/server가 처리하지 않는다.
const app = new Hono<Env>()
  .use("*", cors())
  .get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }))
  .get(
    "/server/scratch-notes/stats",
    withSupabase<Database>({ auth: "user" }),
    async (c) => {
      const { supabaseAdmin, userClaims } = c.var.supabaseContext;
      const { data, error } = await supabaseAdmin
        .from("scratch_notes")
        .select("user_id");

      if (error) {
        return c.json({ error: error.message }, 500);
      }

      return c.json({
        distinctOwners: new Set(data.map((row) => row.user_id)).size,
        totalNotes: data.length,
        you: userClaims?.id ?? null,
      });
    }
  )
  /**
   * Apple 계정 생성 때 authorization code를 받아 refresh token으로 바꿔
   * 보관한다(§6). code는 짧게 살아 있고 서버에서만 검증할 수 있다.
   *
   * **응답에 token을 담지 않는다.** 성공 여부만 돌려준다.
   */
  .post(
    "/apple/credentials",
    withSupabase<Database>({ auth: "user" }),
    async (c) => {
      const { supabaseAdmin, userClaims } = c.var.supabaseContext;
      const userId = userClaims?.id;

      if (!userId) {
        return c.json({ error: "no user" }, 401);
      }

      const body = await c.req.json<{ authorizationCode?: unknown }>();

      if (typeof body.authorizationCode !== "string") {
        return c.json({ error: "authorizationCode가 필요하다" }, 400);
      }

      const apple = appleGateway();

      if (apple === null) {
        return c.json({ error: "Apple 자격증명이 설정되지 않았다" }, 503);
      }

      const refreshToken = await apple.exchange(body.authorizationCode);

      if (refreshToken === null) {
        // Apple의 응답 본문을 그대로 흘리지 않는다.
        return c.json({ error: "Apple이 코드를 거부했다" }, 502);
      }

      // 같은 사용자가 다시 로그인하면 함수 안에서 새 token으로 갈아끼운다.
      const { error } = await supabaseAdmin.rpc("store_apple_refresh_token", {
        p_refresh_token: refreshToken,
        p_user_id: userId,
      });

      if (error) {
        return c.json({ error: "token을 보관하지 못했다" }, 500);
      }

      return c.json({ stored: true });
    }
  )
  /**
   * 전체 계정 삭제(§5). 순서와 중단 조건은 account.ts가 들고 있다.
   */
  .delete("/account", withSupabase<Database>({ auth: "user" }), async (c) => {
    const { supabaseAdmin, userClaims } = c.var.supabaseContext;
    const userId = userClaims?.id;

    if (!userId) {
      return c.json({ error: "no user" }, 401);
    }

    const outcome = await deleteAccount(
      accountStore(supabaseAdmin),
      appleGateway(),
      userId
    );

    if (outcome.kind === "deleted") {
      return c.json({ deleted: true });
    }

    if (outcome.kind === "appleRevokeFailed") {
      return c.json(
        { error: "Apple 로그인 해제에 실패했습니다.", retryable: true },
        502
      );
    }

    if (outcome.kind === "appleTokenUnavailable") {
      return c.json(
        { error: "Apple 로그인 해제 수단이 없습니다.", retryable: false },
        409
      );
    }

    return c.json(
      { error: "계정을 삭제하지 못했습니다.", retryable: true },
      500
    );
  });

export type AppType = typeof app;

export default app;
