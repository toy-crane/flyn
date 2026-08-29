import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type LanguageModel,
  safeValidateUIMessages,
  streamText,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { Hono, type MiddlewareHandler } from "hono";

import { resolveModelId } from "../../shared/model-id";
import { logRequestAbort, logRequestFailure } from "../../shared/request-log";
import { speakerModelText, streamSceneText } from "../../shared/scene-stream";
import { type AuthedEnv, createUserGuard } from "../../shared/user-guard";
import { askSystemPrompt, readAskedCorrection } from "./ask";
import { type EpisodeCorrection, judgeCorrection } from "./correction";
import { episodeSystemPrompt, episodeTags } from "./episode";
import {
  completeEpisodeRun,
  completeEpisodeRunFallback,
  currentEpisode,
  nextUpAfter,
  readEpisodeSession,
  readFinishedEpisodes,
  readStoryView,
  recordEpisodeEnding,
  saveEpisodeRun,
  saveEpisodeRunFallback,
  storyMemoriesOf,
} from "./progress";
import {
  type EpisodeClient,
  readStoryContent,
  type StoryContent,
} from "./story";

export interface EpisodeDependencies {
  authMiddleware?: MiddlewareHandler;
  model?: LanguageModel;
}

const CONFLICT_STATUS = 409;

// biome-ignore lint/suspicious/useAwait: 장면 파서가 받는 비동기 스트림 형태가 필요하다
async function* authoredScene(script: string): AsyncIterable<string> {
  yield script;
}

interface SceneResponseOptions {
  onEnd?: (messages: UIMessage[]) => Promise<void>;
  originalMessages: UIMessage[];
  write: (writer: UIMessageStreamWriter) => Promise<unknown>;
}

function sceneResponse({
  onEnd,
  originalMessages,
  write,
}: SceneResponseOptions): Response {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        await write(writer);
        writer.write({ type: "finish" });
      },
      onEnd: onEnd ? ({ messages }) => onEnd(messages) : undefined,
      originalMessages,
    }),
  });
}

function hasEnding(messages: readonly UIMessage[]): boolean {
  return messages.some((message) =>
    message.parts.some((part) => part.type === "data-ending")
  );
}

function textOfMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * 앱이 이 에피소드에서 이미 받은 패턴 키.
 *
 * 교정은 대화 기록에 남지 않으므로 서버는 지난 턴에 무엇을 알려 줬는지 알지
 * 못한다. 같은 패턴을 두 번 만들지 않는 일은 그 목록을 가진 앱이 함께 보내야
 * 성립한다. 목록이 아니거나 낱말이 아닌 값은 없는 것으로 친다.
 */
function seenPatternsOf(body: unknown): string[] {
  const sent = (body as { seenPatterns?: unknown } | null)?.seenPatterns;

  return Array.isArray(sent)
    ? sent.filter((pattern): pattern is string => typeof pattern === "string")
    : [];
}

/**
 * 장면과 나란히 도는 교정 한 건.
 *
 * 장면을 만드는 호출과 같은 턴에 있지만 서로를 기다리지 않는다. 교정이 늦어도
 * 장면은 그대로 흐르고, 교정이 실패해도 이야기는 계속된다. 실패를 여기서
 * 삼키는 것이 그 약속이다.
 */
async function correctionFor(
  messages: UIMessage[],
  model: LanguageModel,
  seenPatterns: string[],
  signal: AbortSignal,
  onFailure: (error: unknown) => void
): Promise<EpisodeCorrection | undefined> {
  const asked = messages.at(-1);

  if (asked?.role !== "user") {
    return;
  }

  try {
    return await judgeCorrection({
      context: await convertToModelMessages(messages.slice(0, -1), {
        convertDataPart: (part) =>
          part.type === "data-speaker"
            ? { text: speakerModelText(part.data), type: "text" }
            : undefined,
      }),
      messageId: asked.id,
      model,
      original: textOfMessage(asked),
      seenPatterns,
      signal,
    });
  } catch (error) {
    onFailure(error);
  }
}

async function persistRunBestEffort(
  client: EpisodeClient,
  episodeId: string,
  messages: UIMessage[],
  complete: boolean,
  method: string,
  path: string
): Promise<void> {
  try {
    if (complete) {
      await completeEpisodeRun(client, episodeId, messages);
    } else {
      await saveEpisodeRun(client, episodeId, messages);
    }
  } catch (error) {
    // 대화 기록이 한 턴 뒤처지는 편이 플레이나 이미 확정된 결말을 되돌리는
    // 것보다 낫다. 오류 객체에는 메시지가 들어갈 수 있어 공통 안전 로그만 쓴다.
    logRequestFailure(method, path, error);
  }
}

async function resolvePlayableEpisode(
  client: EpisodeClient,
  requested: unknown
): Promise<
  | { error: string }
  | {
      memories: ReturnType<typeof storyMemoriesOf>;
      script: StoryContent["episodes"][number];
      story: StoryContent;
    }
> {
  const story = await readStoryContent(client);
  const finished = await readFinishedEpisodes(client, story);
  const script = currentEpisode(story, finished);

  if (!script) {
    return { error: "The story is already finished." };
  }

  if (requested !== undefined && requested !== script.id) {
    return { error: "This episode is not the episode to play now." };
  }

  return {
    memories: storyMemoriesOf(finished, story),
    script,
    story,
  };
}

export function createEpisodeRoutes(dependencies: EpisodeDependencies = {}) {
  const [requireUser, requireCurrentUser] = createUserGuard(
    dependencies.authMiddleware
  );

  return (
    new Hono<AuthedEnv>()
      .get("/story", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const story = await readStoryContent(client);

        return c.json(await readStoryView(client, story));
      })
      .get("/:episodeId", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const story = await readStoryContent(client);
        const session = await readEpisodeSession(
          client,
          story,
          c.req.param("episodeId")
        );

        if (!session) {
          return c.json({ error: "Episode conversation is unavailable." }, 404);
        }

        if (session.messages.length > 0) {
          const validated = await safeValidateUIMessages({
            messages: session.messages,
          });

          if (!validated.success) {
            throw new Error("Stored episode messages are invalid.");
          }

          session.messages = validated.data;
        }

        return c.json(session);
      })
      .put("/:episodeId", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const sent = (body as { messages?: unknown } | null)?.messages;
        const mode = (body as { mode?: unknown } | null)?.mode;

        if (mode !== "preserve" && mode !== "replace") {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const validatedMessages = await safeValidateUIMessages({
          messages: sent,
        });

        if (!validatedMessages.success) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const client = c.var.supabaseContext.supabase;
        const episodeId = c.req.param("episodeId");

        if (hasEnding(validatedMessages.data)) {
          await completeEpisodeRunFallback(
            client,
            episodeId,
            validatedMessages.data
          );
        } else {
          const resolved = await resolvePlayableEpisode(client, episodeId);

          if ("error" in resolved) {
            return c.json({ error: resolved.error }, CONFLICT_STATUS);
          }

          if (mode === "replace") {
            await saveEpisodeRun(client, episodeId, validatedMessages.data);
          } else {
            await saveEpisodeRunFallback(
              client,
              episodeId,
              validatedMessages.data
            );
          }
        }

        return c.body(null, 204);
      })
      /*
      배울 표현 하나를 두고 한국어로 묻는 자리.

      장면을 만드는 경로와 나눠 둔다. 여기서는 사건이 진행되지 않고 장면 파서도
      지나지 않으므로, 답은 말풍선이 아니라 평범한 Markdown 답변으로 흐른다.
      서버는 아무것도 저장하지 않는다: 이 대화의 수명은 앱이 소유한다.
    */
      .post("/ask", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const correction = readAskedCorrection(body);
        const validatedMessages = await safeValidateUIMessages({
          messages: (body as { messages?: unknown } | null)?.messages,
        });

        if (!(correction && validatedMessages.success)) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        if (validatedMessages.data.length === 0) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const result = streamText({
          abortSignal: c.req.raw.signal,
          messages: await convertToModelMessages(validatedMessages.data, {
            convertDataPart: (part) =>
              part.type === "data-speaker"
                ? { text: speakerModelText(part.data), type: "text" }
                : undefined,
          }),
          model: dependencies.model ?? resolveModelId(),
          onAbort: () => {
            logRequestAbort(c.req.method, c.req.path);
          },
          onError: ({ error }) => {
            logRequestFailure(c.req.method, c.req.path, error);
          },
          system: askSystemPrompt(correction),
        });

        return result.toUIMessageStreamResponse();
      })
      .post("/", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const sent = (body as { messages?: unknown } | null)?.messages;
        const requested = (body as { episodeId?: unknown } | null)?.episodeId;

        if (requested !== undefined && typeof requested !== "string") {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const client = c.var.supabaseContext.supabase;
        const resolved = await resolvePlayableEpisode(client, requested);

        if ("error" in resolved) {
          return c.json({ error: resolved.error }, CONFLICT_STATUS);
        }

        const { memories, script, story } = resolved;
        const tags = episodeTags(script);
        const persist = (runMessages: UIMessage[], complete = false) =>
          persistRunBestEffort(
            client,
            script.id,
            runMessages,
            complete,
            c.req.method,
            c.req.path
          );

        if (Array.isArray(sent) && sent.length === 0) {
          return sceneResponse({
            onEnd: (openingMessages) => persist(openingMessages),
            originalMessages: [],
            write: (writer) =>
              streamSceneText(authoredScene(script.opening), tags, writer),
          });
        }

        const validatedMessages = await safeValidateUIMessages({
          messages: sent,
        });

        if (!validatedMessages.success) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        await persist(validatedMessages.data);

        const model = dependencies.model ?? resolveModelId();
        // 장면보다 먼저 시작해 둔다. 두 호출이 나란히 돌아야 교정이 장면을
        // 기다리게 만들지 않는다.
        const correcting = correctionFor(
          validatedMessages.data,
          model,
          seenPatternsOf(body),
          c.req.raw.signal,
          (error) => logRequestFailure(c.req.method, c.req.path, error)
        );
        const result = streamText({
          abortSignal: c.req.raw.signal,
          messages: await convertToModelMessages(validatedMessages.data, {
            convertDataPart: (part) =>
              part.type === "data-speaker"
                ? { text: speakerModelText(part.data), type: "text" }
                : undefined,
          }),
          model,
          onAbort: () => {
            logRequestAbort(c.req.method, c.req.path);
          },
          onError: ({ error }) => {
            logRequestFailure(c.req.method, c.req.path, error);
          },
          system: episodeSystemPrompt(script, memories),
        });
        let didEnd = false;

        return sceneResponse({
          onEnd: (completeMessages) => persist(completeMessages, didEnd),
          originalMessages: validatedMessages.data,
          write: async (writer) => {
            // 판정이 끝나는 대로 흘려보낸다. 장면 한가운데에 도착해도 되고,
            // 실제로 그렇게 도착하는 편이 이 단위가 약속한 모습이다.
            const correctionWritten = correcting.then((correction) => {
              if (correction) {
                writer.write({
                  data: correction,
                  id: `correction-${correction.messageId}`,
                  // 대화 기록에 교정을 남길지는 아직 정하지 않은 결정이다.
                  // transient part는 메시지 목록에 들어가지 않으므로, 저장되는
                  // 장면은 이 단위 전과 똑같이 남는다.
                  transient: true,
                  type: "data-correction",
                });
              }
            });
            const { ending } = await streamSceneText(
              result.textStream,
              tags,
              writer,
              (closed) => recordEpisodeEnding(client, script.id, closed)
            );

            didEnd = Boolean(ending);

            if (ending) {
              writer.write({
                data: nextUpAfter(story, script.id),
                id: "next-up",
                type: "data-next-up",
              });
            }

            // 장면이 먼저 끝나도 응답은 교정을 두고 닫지 않는다.
            await correctionWritten;
          },
        });
      })
  );
}
