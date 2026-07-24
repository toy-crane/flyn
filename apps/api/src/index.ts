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

const app = new Hono<Env>();

// @supabase/server 어댑터는 CORS를 처리하지 않는다 → Hono 기본 cors 사용.
app.use("*", cors());

app.get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }));

// admin 클라이언트로 전 유저 집계(RLS 우회) — 앱에선 못 하는 서버 전용 동작이라 게이트가 유효.
const routes = app.get(
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

export type AppType = typeof routes;

export default app;
