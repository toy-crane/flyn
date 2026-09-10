import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  type LanguageModel,
  type ModelMessage,
  safeValidateUIMessages,
  streamText,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { Hono, type MiddlewareHandler } from "hono";

import { resolveModelId } from "../../shared/model-id.js";
import {
  logRequestAbort,
  logRequestFailure,
} from "../../shared/request-log.js";
import {
  speakerModelText,
  streamSceneText,
} from "../../shared/scene-stream.js";
import { type AuthedEnv, createUserGuard } from "../../shared/user-guard.js";
import { askSystemPrompt, readAskedCorrection } from "./ask.js";
import { storyDetailViewOf, storyListViewOf } from "./catalog.js";
import {
  type EpisodeCorrection,
  isKoreanText,
  judgeExpression,
} from "./correction.js";
import { episodeSystemPrompt, episodeTags } from "./episode.js";
import { saveExpressionResult } from "./expression-results.js";
import {
  appendEpisodeMessage,
  currentEpisode,
  type EpisodePlay,
  eraseSavedExpression,
  nextUpAfter,
  openEpisodePlay,
  readEpisodeSession,
  readFinishedEpisodes,
  readSavedExpressions,
  recordEpisodeEnding,
  type SavedExpressionDraft,
  saveExpression,
  storyMemoriesOf,
} from "./progress.js";
import { sceneUtterances, writeKoreanMeaning } from "./saved-expression.js";
import {
  type EpisodeClient,
  type EpisodeScript,
  readStoryCast,
  readStoryCatalog,
  readStoryContentById,
  readStoryOfEpisode,
  readStoryOfPlay,
  type StoryContent,
} from "./story.js";
import {
  CREATION_TOOLS,
  type CreationUIMessage,
  creationSystemPrompt,
  readStoryOutline,
  scriptProblem,
  scriptPrompt,
  scriptSystemPrompt,
  storyToSave,
  WRITTEN_STORY_SCHEMA,
  type WrittenStory,
} from "./story-creation.js";
import {
  readRecentStories,
  readStoryPlays,
  startStoryPlay,
} from "./story-plays.js";

export interface EpisodeDependencies {
  authMiddleware?: MiddlewareHandler;
  model?: LanguageModel;
}

const CONFLICT_STATUS = 409;

/** 경로 조각으로 오는 id의 모양. 데이터베이스가 받는 것과 같은 형태다. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/**
 * 담아 둘 인물 대사 하나를 저장된 장면에서 만든다.
 *
 * 한국어 뜻을 만들지 못하면 던진다. 뜻이 없는 항목을 남기느니 실패로 돌려보내
 * 다시 누르게 한다.
 */
async function utteranceDraft({
  context,
  episodeId,
  message,
  model,
  signal,
  utteranceAt,
}: {
  context: () => ModelMessage[] | Promise<ModelMessage[]>;
  episodeId: string;
  message: UIMessage;
  model: LanguageModel;
  signal: AbortSignal;
  utteranceAt: number;
}): Promise<SavedExpressionDraft | undefined> {
  if (message.role !== "assistant") {
    return;
  }

  const utterance = sceneUtterances(message.parts).find(
    (candidate) => candidate.at === utteranceAt
  );

  if (!utterance) {
    return;
  }

  return {
    english: utterance.text.trim(),
    entries: null,
    episodeId,
    kind: "utterance",
    meaning: await writeKoreanMeaning({
      context: await context(),
      model,
      signal,
      speaker: utterance.speaker,
      text: utterance.text,
    }),
    messageId: message.id,
    original: null,
    speaker: utterance.speaker,
    utteranceAt,
  };
}

/**
 * 담아 둘 배울 표현 하나를 이미 저장된 교정에서 만든다.
 *
 * 새로 만들 값이 없다. 고친 문장도, 어긋난 자리도, 이유도 판정하던 때에 이미
 * 행으로 남았으므로 그대로 옮긴다. 영어 교정인지 한국어 안내인지는 사용자가 쓴
 * 문장을 보고 가르며, 그 판정은 교정을 만들 때 쓰는 것과 같은 하나다.
 */
function learningDraft({
  corrections,
  episodeId,
  message,
}: {
  corrections: readonly EpisodeCorrection[];
  episodeId: string;
  message: UIMessage;
}): SavedExpressionDraft | undefined {
  const correction = corrections.find(
    (candidate) => candidate.messageId === message.id
  );

  if (message.role !== "user" || !correction) {
    return;
  }

  const original = correction.original || textOfMessage(message);

  return {
    english: correction.fixed,
    entries: correction.entries.map((entry) => ({
      fixed: entry.fixed,
      original: entry.original,
      why: entry.why,
    })),
    episodeId,
    kind: isKoreanText(original) ? "guidance" : "correction",
    meaning: null,
    messageId: message.id,
    original,
    speaker: null,
    utteranceAt: null,
  };
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
      // 탐색. 내가 만든 스토리를 위에, 공식 스토리를 아래에 보여 준다.
      // 진행은 담지 않는다.
      .get("/stories", requireUser, requireCurrentUser, async (c) => {
        const catalog = await readStoryCatalog(c.var.supabaseContext.supabase);

        return c.json(storyListViewOf(catalog));
      })
      /*
      스토리를 같이 만드는 대화.

      `/ask`와 같은 자리다. 서버는 아무것도 저장하지 않고 이 대화의 수명은 앱이
      소유한다. 화면을 나가면 대화와 카드가 사라진다는 약속이 그래서 지켜진다.

      장면 파서를 지나지 않으므로 답은 말풍선이 아니라 평범한 Markdown이다.
      카드는 `proposeStory` 조각으로 흐르고 앱이 그것을 그린다.

      카드 뒤에 붙는 말은 앱이 가지고 있어 모델이 쓰지 않는다. 그래서 한 턴은
      조각 하나로 끝나고 기다림이 한 번으로 줄어든다.
    */
      .post("/create", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const validatedMessages =
          await safeValidateUIMessages<CreationUIMessage>({
            messages: (body as { messages?: unknown } | null)?.messages,
            tools: CREATION_TOOLS,
          });

        if (!validatedMessages.success || validatedMessages.data.length === 0) {
          return c.json({ error: "Invalid request body." }, 400);
        }

        const result = streamText({
          abortSignal: c.req.raw.signal,
          messages: await convertToModelMessages(validatedMessages.data),
          model: dependencies.model ?? resolveModelId(),
          onAbort: () => {
            logRequestAbort(c.req.method, c.req.path);
          },
          onError: ({ error }) => {
            logRequestFailure(c.req.method, c.req.path, error);
          },
          system: creationSystemPrompt(),
          tools: CREATION_TOOLS,
        });

        return result.toUIMessageStreamResponse();
      })
      /*
      `대화 시작하기`. 확정한 개요로 각본을 만들고 저장한 뒤 1화를 가리킨다.

      저장이 이 시점에 처음 일어난다. 카드가 몇 번 바뀌어도 여기까지 오지
      않으면 어디에도 스토리가 생기지 않는다.

      네 테이블에 행이 함께 들어가야 하므로 저장은 `create_story` 한 번으로
      한다. 중간에 실패하면 아무것도 남지 않는다.
    */
      .post("/stories", requireUser, requireCurrentUser, async (c) => {
        const body: unknown = await c.req.json().catch(() => null);
        const read = readStoryOutline(body);

        if ("problem" in read) {
          return c.json({ error: read.problem }, 400);
        }

        const { outline } = read;
        let written: WrittenStory;

        try {
          const generated = await generateObject({
            abortSignal: c.req.raw.signal,
            model: dependencies.model ?? resolveModelId(),
            prompt: scriptPrompt(outline),
            schema: WRITTEN_STORY_SCHEMA,
            system: scriptSystemPrompt(),
          });

          written = generated.object;
        } catch (failure) {
          logRequestFailure(c.req.method, c.req.path, failure);

          return c.json({ error: "Writing the story failed." }, 502);
        }

        const problem = scriptProblem(written);

        if (problem) {
          logRequestFailure(c.req.method, c.req.path, new Error(problem));

          return c.json({ error: "Writing the story failed." }, 502);
        }

        const { data, error } = await c.var.supabaseContext.supabase.rpc(
          "create_story",
          { story: storyToSave(outline, written) }
        );

        const made = data?.at(0);

        if (error || !made) {
          logRequestFailure(
            c.req.method,
            c.req.path,
            error ?? new Error("Saving the story returned nothing.")
          );

          return c.json({ error: "Saving the story failed." }, 502);
        }

        return c.json({
          episodeId: made.first_episode_id,
          storyId: made.story_id,
        });
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

        // 새 회차의 1화는 저장된 대화가 없어 세션을 읽지 못한다. 그 화면이
        // 이름표 색을 고르는 데 쓸 인물을 상세가 실어 보낸다.
        const cast = await readStoryCast(
          c.var.supabaseContext.supabase,
          entry.id,
          entry.slug
        );

        return c.json(storyDetailViewOf(entry, cast));
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
      /*
      표현 노트가 읽는 자리. 계정에 담긴 것이 최근순으로 온다.

      회차도 메시지도 묻지 않는다. 다시 받기로 원본을 잃은 항목까지 여기 남아야
      하고, 그것이 담기를 대화와 따로 두는 까닭이다.
      `/:episodeId`보다 먼저 선다. 뒤에 두면 `saved-expressions`가 에피소드
      id로 읽힌다.
    */
      .get("/saved-expressions", requireUser, requireCurrentUser, async (c) =>
        c.json(await readSavedExpressions(c.var.supabaseContext.supabase))
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
        const saved = session.expressionResults.find(
          (candidate) => candidate.messageId === message.id
        );
        if (saved) {
          return c.json(saved);
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
        return c.json(
          await saveExpressionResult(client, result, textOfMessage(message))
        );
      })
      /*
      대화에서 마음에 드는 영어 문장을 담아 두는 자리.

      앱은 어느 메시지의 어느 자리인지만 보낸다. 화면에 보이는 영어와 화자, 내가
      쓴 원문은 저장된 행에서 서버가 다시 읽는다. 표현 노트의 출처 표시를 앱이
      실어 보낸 글로 채우면 그 표시가 대화와 어긋날 수 있다.

      인물 대사는 여기서 한국어 뜻을 한 번 만든다. 영어 교정과 한국어 안내는 그
      한 줄이 이미 데이터베이스에 있으므로 모델을 부르지 않는다.
    */
      .post(
        "/saved-expressions",
        requireUser,
        requireCurrentUser,
        async (c) => {
          const body = (await c.req.json().catch(() => null)) as {
            episodeId?: unknown;
            kind?: unknown;
            messageId?: unknown;
            storyPlayId?: unknown;
            utteranceAt?: unknown;
          } | null;
          const wantsUtterance = body?.kind === "utterance";
          if (
            typeof body?.episodeId !== "string" ||
            typeof body.messageId !== "string" ||
            typeof body.storyPlayId !== "string" ||
            (body.kind !== "utterance" && body.kind !== "learning") ||
            (wantsUtterance &&
              (typeof body.utteranceAt !== "number" ||
                !Number.isInteger(body.utteranceAt) ||
                body.utteranceAt < 0))
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
            (candidate) => candidate.id === body.messageId
          );
          const message = session.messages[at];
          if (!message) {
            return c.json({ error: "Message is unavailable." }, 404);
          }
          const draft = wantsUtterance
            ? await utteranceDraft({
                context: () =>
                  convertToModelMessages(session.messages.slice(0, at + 1), {
                    convertDataPart: (part) =>
                      part.type === "data-speaker"
                        ? { text: speakerModelText(part.data), type: "text" }
                        : undefined,
                  }),
                episodeId: body.episodeId,
                message,
                model: dependencies.model ?? resolveModelId(),
                signal: AbortSignal.any([
                  c.req.raw.signal,
                  AbortSignal.timeout(30_000),
                ]),
                utteranceAt: body.utteranceAt as number,
              })
            : learningDraft({
                corrections: session.corrections,
                episodeId: body.episodeId,
                message,
              });
          if (!draft) {
            return c.json({ error: "Expression is unavailable." }, 404);
          }
          return c.json(await saveExpression(client, draft));
        }
      )
      /*
      담아 둔 것을 도로 놓는 자리. 책갈피를 다시 누르는 취소가 여기로 온다.

      남의 항목을 가리키는 정상 id에도 204를 돌려준다. 정책이 그 행에 닿지 못해
      아무것도 지워지지 않고, 없다고 알리면 남의 id가 있는지를 확인해 줄 수 있다.
      모양이 어긋난 id는 다른 이야기라, 데이터베이스까지 내려보내 500으로 만드는
      대신 여기서 400으로 돌려준다.
    */
      .delete(
        "/saved-expressions/:id",
        requireUser,
        requireCurrentUser,
        async (c) => {
          const id = c.req.param("id");

          if (!UUID.test(id)) {
            return c.json({ error: "Invalid saved expression id." }, 400);
          }

          await eraseSavedExpression(c.var.supabaseContext.supabase, id);

          return c.body(null, 204);
        }
      )
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
            await streamSceneText(
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
                // 종료 버튼을 누르는 순간 예고도 준비되어 있어야 한다.
                // 결말 확정 뒤, data-ending보다 먼저 다음 화 정보를 보낸다.
                writer.write({
                  data: nextUpAfter(story, script.id),
                  id: "next-up",
                  type: "data-next-up",
                });
              }
            );
          },
        });
      })
  );
}
