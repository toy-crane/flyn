import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type LanguageModel,
  safeValidateUIMessages,
  streamText,
  type UIMessageStreamWriter,
} from "ai";
import { Hono, type MiddlewareHandler } from "hono";

import { resolveModelId } from "../../shared/model-id";
import { logRequestAbort, logRequestFailure } from "../../shared/request-log";
import { speakerModelText, streamSceneText } from "../../shared/scene-stream";
import { type AuthedEnv, createUserGuard } from "../../shared/user-guard";
import { episodeSystemPrompt, episodeTags } from "./episode";
import {
  CURRENT_SEASON,
  currentEpisodeNumber,
  type EpisodeClient,
  nextUpAfter,
  readFinishedEpisodes,
  readSeasonView,
  recordEpisodeEnding,
} from "./progress";
import { episodeScript } from "./season";

export interface EpisodeDependencies {
  /**
   * Authentication middleware for the AI route. Tests replace it to reach the
   * handler without a real Supabase project; nothing else should.
   */
  authMiddleware?: MiddlewareHandler;
  /**
   * The model to call. Left unset, the server reads `AI_GATEWAY_MODEL` per
   * request, which is also what keeps tests off the real AI Gateway.
   */
  model?: LanguageModel;
}

const CONFLICT_STATUS = 409;

// 정해 둔 장면도 모델이 쓴 장면과 같은 파서를 지난다. 화면이 받는 part의
// 모양이 첫 장면과 그 뒤가 다르지 않다.
// biome-ignore lint/suspicious/useAwait: 장면 파서가 받는 비동기 스트림 형태가 필요하다
async function* authoredScene(script: string): AsyncIterable<string> {
  yield script;
}

function sceneResponse(
  write: (writer: UIMessageStreamWriter) => Promise<unknown>
): Response {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        await write(writer);
        writer.write({ type: "finish" });
      },
    }),
  });
}

/**
 * 지금 이 계정이 열 수 있는 화. 진행이 정하고 요청은 확인만 받는다.
 *
 * 앱이 화 번호를 실어 보내면 그 번호가 맞는지 본다. 틀린 번호는 지난 화를 다시
 * 열려는 요청이거나 화면이 뒤처진 요청이라, 조용히 다른 화를 열어 주는 대신
 * 거절한다.
 */
async function resolveEpisode(client: EpisodeClient, requested: unknown) {
  const finished = await readFinishedEpisodes(client, CURRENT_SEASON);
  const number = currentEpisodeNumber(finished);
  const script = episodeScript(number);

  if (!script) {
    return { error: "The season is already finished." } as const;
  }

  if (typeof requested === "number" && requested !== number) {
    return {
      error: `Episode ${requested} is not the episode to play now.`,
    } as const;
  }

  return { script } as const;
}

/**
 * 시즌 하나를 첫 화부터 마지막 화까지 흘려보내는 경로.
 *
 * 서버는 진행 중인 장면을 저장하지 않는다. 지금까지의 장면은 앱이 매 요청에
 * 실어 보내고, 아무것도 실려 오지 않은 요청이 곧 "이 화를 연다"는 뜻이다.
 * 서버에 남는 것은 끝난 화의 결말뿐이고, 다음에 어떤 화를 여는지는 그 기록이
 * 정한다.
 */
export function createEpisodeRoutes(dependencies: EpisodeDependencies = {}) {
  const [requireUser, requireCurrentUser] = createUserGuard(
    dependencies.authMiddleware
  );

  return (
    new Hono<AuthedEnv>()
      /**
       * 홈이 읽는 시즌 상태. 끝낸 화, 다음 화, 완주 여부가 한 번에 온다.
       *
       * 각본은 서버가 소유하므로 앱은 제목도 예고도 들고 있지 않다. 진행만
       * 따로 읽어서 앱이 합치면 두 응답이 어긋난 순간의 홈을 그리게 된다.
       */
      .get("/season", requireUser, requireCurrentUser, async (c) => {
        const view = await readSeasonView(c.var.supabaseContext.supabase);

        return c.json(view);
      })
      .post("/", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const sent = (body as { messages?: unknown } | null)?.messages;
        const requested = (body as { episode?: unknown } | null)?.episode;
        const { supabase } = c.var.supabaseContext;
        const resolved = await resolveEpisode(supabase, requested);

        if ("error" in resolved) {
          return c.json({ error: resolved.error }, CONFLICT_STATUS);
        }

        const { script } = resolved;
        const tags = episodeTags(script);

        // 아직 아무 말도 오가지 않은 요청이 "이 화를 연다"는 뜻이다. 첫 장면은
        // 모델을 부르지 않아 기다림 없이 사건이 벌어진 자리에서 열리고, 나갔다
        // 들어와도 같은 장면이 나온다. AI SDK의 검증은 빈 목록을 거절하므로 그
        // 앞에서 갈라진다.
        if (Array.isArray(sent) && sent.length === 0) {
          return sceneResponse((writer) =>
            streamSceneText(authoredScene(script.opening), tags, writer)
          );
        }

        const messages = await safeValidateUIMessages({ messages: sent });

        // Returning here is what keeps a malformed body from reaching the model,
        // so a bad request never costs a generation.
        if (!messages.success) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const result = streamText({
          // The request's own signal: when the app leaves the episode or the
          // connection drops, the model call stops burning tokens with it.
          abortSignal: c.req.raw.signal,
          // 화자 part는 모델 메시지로 갈 때 기본적으로 버려진다. 지난 장면에서
          // 누가 무슨 말을 했는지가 다음 장면의 입력이므로 각본의 줄 머리로
          // 되살린다.
          messages: await convertToModelMessages(messages.data, {
            convertDataPart: (part) =>
              part.type === "data-speaker"
                ? { text: speakerModelText(part.data), type: "text" }
                : undefined,
          }),
          model: dependencies.model ?? resolveModelId(),
          onAbort: () => {
            logRequestAbort(c.req.method, c.req.path);
          },
          // A provider failure after the response has started does not throw, so
          // `app.onError` never sees it. Without this the AI SDK's own default runs
          // `console.error(error)` on an error whose properties carry the request
          // it sent — the person's whole episode — straight into the server log.
          onError: ({ error }) => {
            logRequestFailure(c.req.method, c.req.path, error);
          },
          system: episodeSystemPrompt(script),
        });

        // `textStream`만 소비하므로 reasoning 모델로 바꿔도 추론이 장면에 섞이지
        // 않고, 제공자 오류 원문은 `createUIMessageStream`의 기본 onError가 가린다.
        return sceneResponse(async (writer) => {
          // 결말을 계정에 남긴 뒤에야 결말 part가 나간다. 남기지 못하면 화면이
          // 끝난 척하지 않고, 사용자는 같은 화를 이어서 다시 시도할 수 있다.
          const ending = await streamSceneText(
            result.textStream,
            tags,
            writer,
            (closed) =>
              recordEpisodeEnding(
                supabase,
                CURRENT_SEASON,
                script.number,
                closed
              )
          );

          if (ending) {
            // 예고는 각본에 미리 쓴 글이라 결말과 같은 응답에 실어 보낸다.
            // 마무리 화면이 진행을 다시 읽어 올 때까지 빈 채로 있지 않는다.
            writer.write({
              data: nextUpAfter(script.number),
              id: "next-up",
              type: "data-next-up",
            });
          }
        });
      })
  );
}
