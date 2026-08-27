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
import { createUserGuard } from "../../shared/user-guard";
import {
  EPISODE_OPENING,
  EPISODE_SYSTEM_PROMPT,
  EPISODE_TAGS,
} from "./episode";

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

// 정해 둔 장면도 모델이 쓴 장면과 같은 파서를 지난다. 화면이 받는 part의
// 모양이 첫 장면과 그 뒤가 다르지 않다.
// biome-ignore lint/suspicious/useAwait: 장면 파서가 받는 비동기 스트림 형태가 필요하다
async function* authoredScene(script: string): AsyncIterable<string> {
  yield script;
}

function sceneResponse(
  write: (writer: UIMessageStreamWriter) => Promise<void>
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
 * 에피소드 하나를 사건 시작부터 결말까지 흘려보내는 경로.
 *
 * 서버는 에피소드를 저장하지 않는다. 지금까지의 장면은 앱이 매 요청에 실어
 * 보내고, 아무것도 실려 오지 않은 요청이 곧 "에피소드를 새로 연다"는 뜻이다.
 */
export function createEpisodeRoutes(dependencies: EpisodeDependencies = {}) {
  const [requireUser, requireCurrentUser] = createUserGuard(
    dependencies.authMiddleware
  );

  return new Hono().post("/", requireUser, requireCurrentUser, async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    const sent = (body as { messages?: unknown } | null)?.messages;

    // 아직 아무 말도 오가지 않은 요청이 "에피소드를 새로 연다"는 뜻이다. 첫
    // 장면은 모델을 부르지 않아 기다림 없이 사건이 벌어진 자리에서 열리고,
    // 다시 시작해도 같은 카페 장면이 나온다. AI SDK의 검증은 빈 목록을
    // 거절하므로 그 앞에서 갈라진다.
    if (Array.isArray(sent) && sent.length === 0) {
      return sceneResponse((writer) =>
        streamSceneText(authoredScene(EPISODE_OPENING), EPISODE_TAGS, writer)
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
      system: EPISODE_SYSTEM_PROMPT,
    });

    // `textStream`만 소비하므로 reasoning 모델로 바꿔도 추론이 장면에 섞이지
    // 않고, 제공자 오류 원문은 `createUIMessageStream`의 기본 onError가 가린다.
    return sceneResponse((writer) =>
      streamSceneText(result.textStream, EPISODE_TAGS, writer)
    );
  });
}
