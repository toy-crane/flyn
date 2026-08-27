import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type LanguageModel,
  safeValidateUIMessages,
  streamText,
} from "ai";
import { Hono, type MiddlewareHandler } from "hono";

import { logRequestAbort, logRequestFailure } from "../../shared/request-log";
import { speakerModelText, streamSceneText } from "../../shared/scene-stream";
import { createUserGuard } from "../../shared/user-guard";
import { resolveModelId } from "./config";
import { WORLD_CAST, WORLD_SYSTEM_PROMPT } from "./world";

export interface AiChatDependencies {
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

export function createAiChatRoutes(dependencies: AiChatDependencies = {}) {
  // Built once per app rather than per request, and applied to the AI route
  // only.
  const [requireUser, requireCurrentUser] = createUserGuard(
    dependencies.authMiddleware
  );

  return new Hono().post("/", requireUser, requireCurrentUser, async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    const messages = await safeValidateUIMessages({
      messages: (body as { messages?: unknown } | null)?.messages,
    });

    // Returning here is what keeps a malformed body from reaching the model,
    // so a bad request never costs a generation.
    if (!messages.success) {
      return c.json({ error: "Invalid request body." }, 400);
    }

    const result = streamText({
      // The request's own signal: when the app stops generation or the
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
      // it sent — the person's whole conversation — straight into the server
      // log.
      onError: ({ error }) => {
        logRequestFailure(c.req.method, c.req.path, error);
      },
      system: WORLD_SYSTEM_PROMPT,
    });

    // 스파이크: 응답은 모델 텍스트를 그대로가 아니라 장면으로 내려보낸다.
    // `textStream`만 소비하므로 reasoning 모델로 바꿔도 추론이 응답에 섞이지
    // 않고, 제공자 오류 원문은 `createUIMessageStream`의 기본 onError가
    // 가린다.
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start" });
          await streamSceneText(
            result.textStream,
            { cast: WORLD_CAST },
            writer
          );
          writer.write({ type: "finish" });
        },
      }),
    });
  });
}
