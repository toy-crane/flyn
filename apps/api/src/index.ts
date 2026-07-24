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
  );

export type AppType = typeof app;

export default app;
