import {
  consumeStream,
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
import {
  homeViewOf,
  readAccountProgress,
  storyDetailViewOf,
  storyListViewOf,
} from "./catalog";
import { type EpisodeCorrection, judgeCorrection } from "./correction";
import { episodeSystemPrompt, episodeTags } from "./episode";
import {
  appendEpisodeMessages,
  currentEpisode,
  type EpisodePlay,
  nextUpAfter,
  openEpisodePlay,
  readEpisodeSession,
  readFinishedEpisodes,
  recordEpisodeEnding,
  storyMemoriesOf,
} from "./progress";
import {
  type EpisodeClient,
  readStoryCatalog,
  readStoryContent,
  readStoryOfEpisode,
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
  onEnd: (responseMessage: UIMessage) => Promise<void>;
  originalMessages: UIMessage[];
  /** 이번 장면에 미리 정해 둔 id. 닫는 장면을 먼저 저장할 때 쓴다. */
  responseMessageId?: string;
  write: (writer: UIMessageStreamWriter) => Promise<unknown>;
}

/**
 * 장면 하나를 흘려보내고, 그 장면이 끝나면 서버가 스스로 저장한다.
 *
 * `generateId`가 uuid를 만든다. 앱과 서버와 데이터베이스가 같은 이름으로 같은
 * 메시지를 가리켜야 다시 받기가 "이 메시지부터"를 말할 수 있고, 저장하는 열이
 * uuid이므로 SDK 기본 생성기의 짧은 문자열은 들어가지 못한다.
 *
 * `consumeSseStream`이 이 응답의 사본을 서버가 끝까지 읽는다. 사용자가 중지하거나
 * 화면을 나가 클라이언트가 끊겨도 남은 조각이 밀리지 않고 흘러, 아래 `onEnd`가
 * 서버가 만든 데까지를 들고 실행된다. 앱이 따로 저장을 요청하던 경로가 없어진
 * 자리가 여기다.
 */
function sceneResponse({
  onEnd,
  originalMessages,
  responseMessageId,
  write,
}: SceneResponseOptions): Response {
  return createUIMessageStreamResponse({
    consumeSseStream: consumeStream,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        await write(writer);
        writer.write({ type: "finish" });
      },
      generateId: () => responseMessageId ?? crypto.randomUUID(),
      onEnd: ({ responseMessage }) => onEnd(responseMessage),
      originalMessages,
    }),
  });
}

/**
 * 메시지 한 건을 대화 끝에 남긴다. 실패해도 플레이를 막지 않는다.
 *
 * 대화 기록이 한 턴 뒤처지는 편이 플레이나 이미 확정된 결말을 되돌리는 것보다
 * 낫다. 오류 객체에는 메시지가 들어갈 수 있어 공통 안전 로그만 쓴다.
 */
async function saveSceneBestEffort(
  client: EpisodeClient,
  play: EpisodePlay,
  message: UIMessage,
  method: string,
  path: string
): Promise<void> {
  try {
    await appendEpisodeMessages(client, play, [message]);
  } catch (error) {
    logRequestFailure(method, path, error);
  }
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
 * 교정은 아직 대화 기록에 남지 않으므로 서버는 지난 턴에 무엇을 알려 줬는지 알지
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

/** 앱이 한 턴에 보내는 것. 지난 장면은 여기 없다. */
interface TurnRequest {
  episodeId: string | undefined;
  /** 이 메시지까지 남기고 뒤를 지운다. `null`이면 이 화를 처음부터 다시 연다. */
  keepThrough: string | null | undefined;
  /** 사람이 방금 쓴 말. 첫 장면을 여는 요청에는 없다. */
  message: UIMessage | undefined;
}

/**
 * 요청 몸통을 읽어 이번 턴이 무엇인지 정한다.
 *
 * 앱이 실어 보낼 수 있는 것은 사람이 방금 쓴 말 하나뿐이다. 상대의 장면은 서버가
 * 쓰고 서버가 남기므로, `role`이 다른 메시지는 기록으로 들어오기 전에 거절한다.
 */
async function readTurnRequest(
  body: unknown
): Promise<TurnRequest | { error: string }> {
  const asked = body as {
    episodeId?: unknown;
    keepThrough?: unknown;
    message?: unknown;
  } | null;
  const refusal = { error: "Invalid request body." };

  if (asked?.episodeId !== undefined && typeof asked.episodeId !== "string") {
    return refusal;
  }

  if (
    asked?.keepThrough !== undefined &&
    asked.keepThrough !== null &&
    typeof asked.keepThrough !== "string"
  ) {
    return refusal;
  }

  const shape = {
    episodeId: asked?.episodeId,
    keepThrough: asked?.keepThrough,
  };

  if (asked?.message === undefined) {
    return { ...shape, message: undefined };
  }

  const validated = await safeValidateUIMessages({
    messages: [asked.message],
  });

  if (!validated.success) {
    return refusal;
  }

  const [message] = validated.data;

  return message?.role === "user" ? { ...shape, message } : refusal;
}

/**
 * 이 요청이 지금 진행할 수 있는 화인지 가린다.
 *
 * 어느 스토리인지는 요청이 말하지 않는다. 화 하나만 오므로 그 화가 속한
 * 스토리부터 찾고, 진행과 기억을 그 스토리 안에서만 읽는다. 여러 스토리를
 * 번갈아 해도 서로 섞이지 않는 자리가 여기다.
 */
async function resolvePlayableEpisode(
  client: EpisodeClient,
  requested: string | undefined
): Promise<
  | { error: string }
  | {
      memories: ReturnType<typeof storyMemoriesOf>;
      script: StoryContent["episodes"][number];
      story: StoryContent;
    }
> {
  const story =
    requested === undefined
      ? await readStoryContent(client)
      : await readStoryOfEpisode(client, requested);

  if (!story) {
    return { error: "This episode is not part of any story." };
  }

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
      .get("/home", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const [catalog, progress] = await Promise.all([
          readStoryCatalog(client),
          readAccountProgress(client),
        ]);

        return c.json(homeViewOf(catalog, progress));
      })
      .get("/stories", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const [catalog, progress] = await Promise.all([
          readStoryCatalog(client),
          readAccountProgress(client),
        ]);

        return c.json(storyListViewOf(catalog, progress));
      })
      .get("/stories/:storyId", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const [catalog, progress] = await Promise.all([
          readStoryCatalog(client),
          readAccountProgress(client),
        ]);
        const entry = catalog.find(
          (story) => story.id === c.req.param("storyId")
        );

        if (!entry) {
          return c.json({ error: "Story is unavailable." }, 404);
        }

        return c.json(storyDetailViewOf(entry, progress));
      })
      .get("/:episodeId", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const episodeId = c.req.param("episodeId");
        const story = await readStoryOfEpisode(client, episodeId);

        if (!story) {
          return c.json({ error: "Episode conversation is unavailable." }, 404);
        }

        const session = await readEpisodeSession(client, story, episodeId);

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
        const asked = await readTurnRequest(body);

        if ("error" in asked) {
          return c.json({ error: asked.error }, 400);
        }

        const client = c.var.supabaseContext.supabase;
        const resolved = await resolvePlayableEpisode(client, asked.episodeId);

        if ("error" in resolved) {
          return c.json({ error: resolved.error }, CONFLICT_STATUS);
        }

        const { memories, script, story } = resolved;
        const tags = episodeTags(script);
        const play = await openEpisodePlay(
          client,
          script.id,
          asked.keepThrough
        );
        const sent = asked.message;
        const saveScene = (message: UIMessage) =>
          saveSceneBestEffort(client, play, message, c.req.method, c.req.path);

        if (sent) {
          // 저장은 최선 노력이라 실패해도 여기서 멈추지 않는다. 모델에는 어느
          // 쪽이든 이 말을 넘긴다. 대화가 한 턴 뒤처지는 편이 플레이를 막는 것보다
          // 낫다.
          await saveScene(sent);
          play.messages.push(sent);
          play.nextPosition += 1;
        }

        if (play.messages.length === 0) {
          return sceneResponse({
            onEnd: saveScene,
            originalMessages: [],
            write: (writer) =>
              streamSceneText(authoredScene(script.opening), tags, writer),
          });
        }

        const model = dependencies.model ?? resolveModelId();
        // 장면보다 먼저 시작해 둔다. 두 호출이 나란히 돌아야 교정이 장면을
        // 기다리게 만들지 않는다.
        const correcting = correctionFor(
          play.messages,
          model,
          seenPatternsOf(body),
          c.req.raw.signal,
          (error) => logRequestFailure(c.req.method, c.req.path, error)
        );
        const result = streamText({
          abortSignal: c.req.raw.signal,
          messages: await convertToModelMessages(play.messages, {
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
        // 결말이 난 플레이에는 더 이상 메시지를 넣을 수 없다. 그래서 닫는 장면은
        // 결말보다 먼저 저장하고, `onEnd`는 그 사실을 알고 다시 저장하지 않는다.
        const sceneId = crypto.randomUUID();
        let isSceneSaved = false;

        return sceneResponse({
          onEnd: (message) =>
            isSceneSaved ? Promise.resolve() : saveScene(message),
          originalMessages: play.messages,
          responseMessageId: sceneId,
          write: async (writer) => {
            // 판정이 끝나는 대로 흘려보낸다. 장면 한가운데에 도착해도 되고,
            // 실제로 그렇게 도착하는 편이 이 단위가 약속한 모습이다.
            const correctionWritten = correcting.then((correction) => {
              if (correction) {
                writer.write({
                  data: correction,
                  id: `correction-${correction.messageId}`,
                  // 교정을 행으로 남기는 것은 다음 단위가 한다. transient part는
                  // 메시지 목록에 들어가지 않으므로, 저장되는 장면은 교정이 붙기
                  // 전과 똑같이 남는다.
                  transient: true,
                  type: "data-correction",
                });
              }
            });
            const { ending } = await streamSceneText(
              result.textStream,
              tags,
              writer,
              async (closed) => {
                await saveScene({
                  id: sceneId,
                  parts: closed.parts,
                  role: "assistant",
                });
                isSceneSaved = true;
                await recordEpisodeEnding(client, script.id, closed);
              }
            );

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
