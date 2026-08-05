import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import {
  createEpisode,
  createEpisodeDraft,
  createProductionEpisodeDependencies,
  type EpisodeDependencies,
  EpisodeHttpError,
  listEpisodeScenarios,
  regenerateEpisodeGoals,
  regenerateEpisodeRole,
} from "./episode";
import {
  createProductionRoleplayDependencies,
  type RoleplayDependencies,
  RoleplayHttpError,
  respondToEpisodeMessage,
} from "./roleplay";

interface Env {
  Variables: {
    supabaseContext: SupabaseContext<Database>;
  };
}

interface ApiDependencies {
  episode?: EpisodeDependencies;
  roleplay?: RoleplayDependencies;
}

/** 본문이 JSON이 아니면 파싱 오류도 같은 400 문구로 답한다. */
async function readJsonBody(c: Context<Env>): Promise<unknown> {
  try {
    return await c.req.json();
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: EpisodeHttpError의 네 번째 인자가 super의 cause로 전달된다.
    throw new EpisodeHttpError(
      400,
      "에피소드 정보가 올바르지 않습니다.",
      false,
      error
    );
  }
}

function episodeFailure(error: unknown, route: string) {
  if (error instanceof EpisodeHttpError) {
    return {
      body: {
        error: error.message,
        ...(error.retryable ? { retryable: true } : {}),
      },
      status: error.status,
    } as const;
  }

  // 본문은 로그에 남기지 않는다. 어느 경계가 깨졌는지만 남긴다.
  console.error("[episode] request failed", {
    message: error instanceof Error ? error.message : String(error),
    route,
  });

  return {
    body: { error: "에피소드 요청을 처리하지 못했습니다.", retryable: true },
    status: 500,
  } as const;
}

export function createApiApp(dependencies: ApiDependencies = {}) {
  const episode = dependencies.episode ?? createProductionEpisodeDependencies();
  const roleplay =
    dependencies.roleplay ?? createProductionRoleplayDependencies();

  // 체이닝해야 AppType에 포함된다 — 따로 등록한 라우트는 조용히 빠진다.
  // CORS는 @supabase/server가 처리하지 않는다.
  return (
    new Hono<Env>()
      .use("*", cors())
      .get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }))
      /**
       * 에피소드 생성은 두 번 부른다 — ① 상황 후보, ② 선택한 상황의 역할과
       * 목표. 재생성은 해당 부분만 다시 부르므로 역할·목표 라우트가 따로 있다.
       * 어느 경로든 AI가 만든 값이라 앱이 아니라 이 경계가 저장한다.
       */
      .post(
        "/episodes/scenarios",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          if (!c.var.supabaseContext.userClaims?.id) {
            return c.json({ error: "no user" }, 401);
          }

          try {
            return c.json(
              await listEpisodeScenarios({
                dependencies: episode,
                input: await readJsonBody(c),
                signal: c.req.raw.signal,
              })
            );
          } catch (error) {
            const { body, status } = episodeFailure(
              error,
              "/episodes/scenarios"
            );
            return c.json(body, status);
          }
        }
      )
      .post(
        "/episodes/draft",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          if (!c.var.supabaseContext.userClaims?.id) {
            return c.json({ error: "no user" }, 401);
          }

          try {
            return c.json(
              await createEpisodeDraft({
                dependencies: episode,
                input: await readJsonBody(c),
                signal: c.req.raw.signal,
              })
            );
          } catch (error) {
            const { body, status } = episodeFailure(error, "/episodes/draft");
            return c.json(body, status);
          }
        }
      )
      .post(
        "/episodes/draft/role",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          if (!c.var.supabaseContext.userClaims?.id) {
            return c.json({ error: "no user" }, 401);
          }

          try {
            return c.json(
              await regenerateEpisodeRole({
                dependencies: episode,
                input: await readJsonBody(c),
                signal: c.req.raw.signal,
              })
            );
          } catch (error) {
            const { body, status } = episodeFailure(
              error,
              "/episodes/draft/role"
            );
            return c.json(body, status);
          }
        }
      )
      .post(
        "/episodes/draft/goals",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          if (!c.var.supabaseContext.userClaims?.id) {
            return c.json({ error: "no user" }, 401);
          }

          try {
            return c.json(
              await regenerateEpisodeGoals({
                dependencies: episode,
                input: await readJsonBody(c),
                signal: c.req.raw.signal,
              })
            );
          } catch (error) {
            const { body, status } = episodeFailure(
              error,
              "/episodes/draft/goals"
            );
            return c.json(body, status);
          }
        }
      )
      .post(
        "/episodes",
        withSupabase<Database>({ auth: "user" }),
        async (c) => {
          const context = c.var.supabaseContext;
          const userId = context.userClaims?.id;

          if (!userId) {
            return c.json({ error: "no user" }, 401);
          }

          try {
            return c.json(
              await createEpisode({
                context,
                dependencies: episode,
                input: await readJsonBody(c),
                userId,
              })
            );
          } catch (error) {
            const { body, status } = episodeFailure(error, "/episodes");
            return c.json(body, status);
          }
        }
      )
      /**
       * 롤플레잉 한 턴. 모바일은 마지막 사용자 메시지만 보내고 서버가 DB
       * 기록으로 답한다. 한글이면 이 경계가 전달 전에 번역하므로, 앱은 전달된
       * 문장을 만들지 않고 스트림으로 돌려받는다.
       */
      .post(
        "/episodes/:episodeId/messages",
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
            return await respondToEpisodeMessage({
              context,
              dependencies: roleplay,
              episodeId: c.req.param("episodeId"),
              input,
              requestSignal: c.req.raw.signal,
              userId,
            });
          } catch (error) {
            if (error instanceof RoleplayHttpError) {
              return c.json(
                {
                  error: error.message,
                  ...(error.retryable ? { retryable: true } : {}),
                },
                error.status
              );
            }

            // 본문은 로그에 남기지 않는다. 어느 에피소드가 깨졌는지만 남긴다.
            console.error("[roleplay] request failed", {
              episodeId: c.req.param("episodeId"),
              message: error instanceof Error ? error.message : String(error),
            });
            return c.json(
              { error: "대화 요청을 처리하지 못했습니다.", retryable: true },
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

/** 스트림에 얹어 보내는 값이라 RPC 타입에 잡히지 않는다. 앱이 함께 읽는다. */
export type {
  GoalAchievement,
  JudgedSentence,
  JudgmentUpdate,
} from "./judgment";
export type { DeliveredSentence } from "./roleplay";

export default app;
