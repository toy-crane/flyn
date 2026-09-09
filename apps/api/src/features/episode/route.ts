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
import { storyDetailViewOf, storyListViewOf } from "./catalog";
import { judgeExpression } from "./correction";
import { episodeSystemPrompt, episodeTags } from "./episode";
import {
  appendEpisodeCorrection,
  appendEpisodeMessage,
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
  type EpisodeScript,
  readStoryCatalog,
  readStoryContentById,
  readStoryOfEpisode,
  readStoryOfPlay,
  type StoryContent,
} from "./story";
import {
  readRecentStories,
  readStoryPlays,
  startStoryPlay,
} from "./story-plays";

export interface EpisodeDependencies {
  authMiddleware?: MiddlewareHandler;
  model?: LanguageModel;
}

const CONFLICT_STATUS = 409;

// biome-ignore lint/suspicious/useAwait: 장면 파서가 받는 비동기 스트림 형태가 필요하다
async function* authoredScene(script: string): AsyncIterable<string> {
  yield script;
}

/**
 * 화면으로 흘려보내지 않고 장면의 part만 만들어 내는 자리.
 *
 * 새 회차의 첫 장면은 두 번 만들어진다. 한 번은 사용자가 상세에서 들어왔을 때
 * 화면으로 흐르고(그때는 아무것도 저장하지 않는다), 한 번은 사용자가 처음 말해
 * 회차가 생길 때 그 회차의 대화 첫 줄로 저장된다. 첫 장면은 각본에 적힌 글이라
 * 두 번 만들어도 같은 글이 나온다.
 */
const DISCARDING_WRITER = {
  merge: () => undefined,
  onError: () => "",
  write: () => undefined,
} as unknown as UIMessageStreamWriter;

async function openingSceneParts(
  script: EpisodeScript
): Promise<UIMessage["parts"]> {
  const { parts } = await streamSceneText(
    authoredScene(script.opening),
    episodeTags(script),
    DISCARDING_WRITER
  );

  return parts;
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
    await appendEpisodeMessage(client, play, message);
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

/** 앱이 한 턴에 보내는 것. 지난 장면은 여기 없다. */
interface TurnRequest {
  episodeId: string | undefined;
  /** 이 메시지까지 남기고 뒤를 지운다. `null`이면 이 화를 처음부터 다시 연다. */
  keepThrough: string | null | undefined;
  /** 사람이 방금 쓴 말. 첫 장면을 여는 요청에는 없다. */
  message: UIMessage | undefined;
  /** 새로 시작할 스토리. 이어가는 요청에는 없다. */
  storyId: string | undefined;
  /** 이어갈 회차. 새 대화를 시작하는 요청에는 없다. */
  storyPlayId: string | undefined;
}

function optionalString(value: unknown): { ok: false } | { ok: true } {
  return value === undefined || typeof value === "string"
    ? { ok: true }
    : { ok: false };
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
    storyPlayId?: unknown;
    storyId?: unknown;
  } | null;
  const refusal = { error: "Invalid request body." };
  const strings = [asked?.episodeId, asked?.storyPlayId, asked?.storyId];

  if (strings.some((value) => !optionalString(value).ok)) {
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
    episodeId: asked?.episodeId as string | undefined,
    keepThrough: asked?.keepThrough as string | null | undefined,
    storyId: asked?.storyId as string | undefined,
    storyPlayId: asked?.storyPlayId as string | undefined,
  };

  if (shape.storyPlayId === undefined && shape.storyId === undefined) {
    return { error: "A run or a story is required." };
  }

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

interface PlayableEpisode {
  memories: ReturnType<typeof storyMemoriesOf>;
  script: EpisodeScript;
  story: StoryContent;
  /** 이어가는 요청의 회차. 새로 시작하는 요청에는 아직 없다. */
  storyPlayId: string | undefined;
}

/**
 * 이 요청이 지금 진행할 수 있는 화인지 가린다.
 *
 * 이어가는 요청은 회차 하나를 들고 온다. 그 회차가 어느 스토리인지부터 찾고,
 * 진행과 기억을 그 회차 안에서만 읽는다. 여러 회차를 번갈아 해도 서로 섞이지
 * 않는 자리가 여기다.
 *
 * 새로 시작하는 요청은 스토리를 들고 온다. 회차는 아직 없고, 진행할 화는 언제나
 * 1화다. 다시 플레이하는 단위가 스토리 전체이므로 중간 화에서 시작하는 길은
 * 없다.
 */
async function resolvePlayableEpisode(
  client: EpisodeClient,
  asked: TurnRequest
): Promise<PlayableEpisode | { error: string }> {
  if (asked.storyPlayId === undefined) {
    const story = await readStoryContentById(client, asked.storyId ?? "").catch(
      () => undefined
    );
    const first = story?.episodes[0];

    if (!(story && first)) {
      return { error: "This story is unavailable." };
    }

    if (asked.episodeId !== undefined && asked.episodeId !== first.id) {
      return { error: "A new conversation starts at the first episode." };
    }

    return { memories: [], script: first, story, storyPlayId: undefined };
  }

  const story = await readStoryOfPlay(client, asked.storyPlayId);

  if (!story) {
    return { error: "This conversation is unavailable." };
  }

  const finished = await readFinishedEpisodes(client, story, asked.storyPlayId);
  const script = currentEpisode(story, finished);

  if (!script) {
    return { error: "The story is already finished." };
  }

  if (asked.episodeId !== undefined && asked.episodeId !== script.id) {
    return { error: "This episode is not the episode to play now." };
  }

  return {
    memories: storyMemoriesOf(finished, story),
    script,
    story,
    storyPlayId: asked.storyPlayId,
  };
}

/** 경로에서 온 회차 id. 없으면 요청이 어느 대화인지 말하지 않은 것이다. */
function storyPlayIdOf(value: string | undefined): string | undefined {
  return value === undefined || value === "" ? undefined : value;
}

export function createEpisodeRoutes(dependencies: EpisodeDependencies = {}) {
  const [requireUser, requireCurrentUser] = createUserGuard(
    dependencies.authMiddleware
  );

  return (
    new Hono<AuthedEnv>()
      // 탐색. 전체 스토리를 콘텐츠 순서로 보여 준다. 진행은 담지 않는다.
      .get("/stories", requireUser, requireCurrentUser, async (c) => {
        const catalog = await readStoryCatalog(c.var.supabaseContext.supabase);

        return c.json(storyListViewOf(catalog));
      })
      // 스토리 탭. 대화한 스토리를 최근순으로 보여 준다.
      .get("/recent", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const catalog = await readStoryCatalog(client);

        return c.json(await readRecentStories(client, catalog));
      })
      .get("/stories/:storyId", requireUser, requireCurrentUser, async (c) => {
        const catalog = await readStoryCatalog(c.var.supabaseContext.supabase);
        const entry = catalog.find(
          (story) => story.id === c.req.param("storyId")
        );

        if (!entry) {
          return c.json({ error: "Story is unavailable." }, 404);
        }

        return c.json(storyDetailViewOf(entry));
      })
      // 대화 기록. 이 스토리의 회차를 시작한 순서의 역순으로 보여 준다.
      .get(
        "/stories/:storyId/plays",
        requireUser,
        requireCurrentUser,
        async (c) => {
          const client = c.var.supabaseContext.supabase;
          const catalog = await readStoryCatalog(client);
          const entry = catalog.find(
            (story) => story.id === c.req.param("storyId")
          );

          if (!entry) {
            return c.json({ error: "Story is unavailable." }, 404);
          }

          return c.json(await readStoryPlays(client, entry));
        }
      )
      .get("/:episodeId", requireUser, requireCurrentUser, async (c) => {
        const client = c.var.supabaseContext.supabase;
        const episodeId = c.req.param("episodeId");
        const storyPlayId = storyPlayIdOf(c.req.query("storyPlayId"));

        if (storyPlayId === undefined) {
          return c.json({ error: "A conversation is required." }, 400);
        }

        const story = await readStoryOfEpisode(client, episodeId);

        if (!story) {
          return c.json({ error: "Episode conversation is unavailable." }, 404);
        }

        const session = await readEpisodeSession(
          client,
          story,
          storyPlayId,
          episodeId
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
      .post("/correction", requireUser, requireCurrentUser, async (c) => {
        const body = (await c.req.json().catch(() => null)) as {
          episodeId?: unknown;
          messageId?: unknown;
          storyPlayId?: unknown;
        } | null;
        if (
          typeof body?.episodeId !== "string" ||
          typeof body.messageId !== "string" ||
          typeof body.storyPlayId !== "string"
        ) {
          return c.json({ error: "Invalid request body." }, 400);
        }
        const client = c.var.supabaseContext.supabase;
        const story = await readStoryOfEpisode(client, body.episodeId);
        const session = story
          ? await readEpisodeSession(
              client,
              story,
              body.storyPlayId,
              body.episodeId
            )
          : undefined;
        if (!session) {
          return c.json({ error: "Message is unavailable." }, 404);
        }
        const at = session.messages.findIndex(
          (candidate) =>
            candidate.id === body.messageId && candidate.role === "user"
        );
        const message = session.messages[at];
        if (!message) {
          return c.json({ error: "Message is unavailable." }, 404);
        }
        const saved = session.corrections.find(
          (correction) => correction.messageId === message.id
        );
        if (saved) {
          return c.json({
            correction: saved,
            messageId: message.id,
            status: "corrected",
          });
        }
        const result = await judgeExpression({
          context: await convertToModelMessages(session.messages.slice(0, at), {
            convertDataPart: (part) =>
              part.type === "data-speaker"
                ? { text: speakerModelText(part.data), type: "text" }
                : undefined,
          }),
          messageId: message.id,
          model: dependencies.model ?? resolveModelId(),
          original: textOfMessage(message),
          signal: AbortSignal.any([
            c.req.raw.signal,
            AbortSignal.timeout(30_000),
          ]),
        });
        if (result.status === "corrected") {
          try {
            await appendEpisodeCorrection(client, result.correction);
          } catch (error) {
            logRequestFailure(c.req.method, c.req.path, error);
          }
        }
        return c.json(result);
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
        const resolved = await resolvePlayableEpisode(client, asked);

        if ("error" in resolved) {
          return c.json({ error: resolved.error }, CONFLICT_STATUS);
        }

        const { memories, script, story } = resolved;
        const tags = episodeTags(script);

        // 아직 회차가 없고 사용자가 말하지도 않았다. 첫 장면만 보여 주고 아무것도
        // 남기지 않는다. 여기서 나가면 기록에 아무 줄도 생기지 않는다.
        if (resolved.storyPlayId === undefined && !asked.message) {
          return sceneResponse({
            onEnd: () => Promise.resolve(),
            originalMessages: [],
            write: (writer) =>
              streamSceneText(authoredScene(script.opening), tags, writer),
          });
        }

        // 사용자가 처음 말했다. 이 순간이 회차가 생기는 순간이다.
        const isNewStoryPlay = resolved.storyPlayId === undefined;
        const storyPlayId =
          resolved.storyPlayId ?? (await startStoryPlay(client, story.id));
        const play = await openEpisodePlay(
          client,
          storyPlayId,
          script.id,
          isNewStoryPlay ? undefined : asked.keepThrough
        );
        const sent = asked.message;
        const saveScene = (message: UIMessage) =>
          saveSceneBestEffort(client, play, message, c.req.method, c.req.path);

        if (isNewStoryPlay) {
          // 앞선 요청이 화면에 흘려보낸 첫 장면을 이 회차의 첫 줄로 남긴다.
          // `keepThrough`가 앱이 보고 있는 그 장면의 id라, 같은 이름으로 남기면
          // 다시 받기가 가리키는 자리와 저장된 자리가 어긋나지 않는다.
          const opening: UIMessage = {
            id: asked.keepThrough ?? crypto.randomUUID(),
            parts: await openingSceneParts(script),
            role: "assistant",
          };

          await saveScene(opening);
          play.messages.push(opening);
        }

        if (sent) {
          // 저장은 최선 노력이라 실패해도 여기서 멈추지 않는다. 모델에는 어느
          // 쪽이든 이 말을 넘긴다. 대화가 한 턴 뒤처지는 편이 플레이를 막는 것보다
          // 낫다.
          await saveScene(sent);
          play.messages.push(sent);
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
          // 지난 대화를 넘기지 않는다. AI SDK는 마지막 원본이 상대의 장면이면 그
          // 메시지를 이어 쓰는데, 그러면 이번 턴의 장면이 지난 행에 덧붙는 꼴이
          // 되어 저장이 기본키에 걸린다. 모델이 읽을 대화는 위 `messages`가
          // 따로 넘기므로, 여기서는 "새 장면 하나를 만든다"만 말한다.
          originalMessages: [],
          responseMessageId: sceneId,
          write: async (writer) => {
            if (isNewStoryPlay) {
              // 앱은 이 회차가 생긴 것을 여기서 처음 안다. 다음 턴부터 이 id로
              // 이어가고, 뒤로 가기도 이 회차의 기록으로 돌아간다.
              writer.write({
                data: { storyPlayId },
                transient: true,
                type: "data-story-play-started",
              });
            }
            // 사용자 메시지가 저장된 뒤 앱이 독립된 표현 확인 요청을 시작한다.
            // 장면 응답은 그 요청의 완료를 기다리지 않는다.
            const target = play.messages.at(-1);
            if (target?.role === "user") {
              writer.write({
                data: { messageId: target.id },
                transient: true,
                type: "data-expression-ready",
              });
            }
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
                await recordEpisodeEnding(
                  client,
                  storyPlayId,
                  script.id,
                  closed
                );
              }
            );

            if (ending) {
              writer.write({
                data: nextUpAfter(story, script.id),
                id: "next-up",
                type: "data-next-up",
              });
            }
          },
        });
      })
  );
}
