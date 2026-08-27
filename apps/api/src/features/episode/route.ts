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

  return new Hono<AuthedEnv>()
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
        system: episodeSystemPrompt(script, memories),
      });
      let didEnd = false;

      return sceneResponse({
        onEnd: (completeMessages) => persist(completeMessages, didEnd),
        originalMessages: validatedMessages.data,
        write: async (writer) => {
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
        },
      });
    });
}
