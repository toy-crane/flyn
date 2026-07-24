import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  Variables: {
    supabaseContext: SupabaseContext<Database>;
  };
}

// 라우트를 하나로 체이닝해야 AppType에 전부 포함된다. 따로 등록한 라우트는 타입에서
// 조용히 빠져 RPC 클라이언트가 볼 수 없다. CORS는 @supabase/server가 처리하지 않는다.
const app = new Hono<Env>()
  .use("*", cors())
  .get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }))
  // admin 클라이언트로 전 유저 집계(RLS 우회) — 앱에선 못 하는 서버 전용 동작이라 게이트가 유효.
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
  );

export type AppType = typeof app;

export default app;
