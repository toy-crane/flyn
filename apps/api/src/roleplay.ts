import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import {
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type FinishReason,
  generateText,
  isTextUIPart,
  type LanguageModel,
  type LanguageModelUsage,
  type ModelMessage,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  createGatewaySummaryModel,
  type EndingRepository,
  type EpisodeEndReason,
  finishEpisode,
  type SummaryModel,
} from "./ending";
import type { EpisodeStatus } from "./episode";
import {
  createGatewayJudgmentModel,
  type GoalAchievement,
  type JudgmentModel,
  type JudgmentRepository,
  type JudgmentUpdate,
  judgeEpisodeTurn,
  type MessageJudgment,
} from "./judgment";

/**
 * 롤플레잉 응답과 한글 번역은 역할이 다른 두 호출이다. 같은 모델을 쓰더라도 ID를
 * 따로 적어, 한 역할만 올릴 때 다른 역할이 딸려 오지 않게 한다
 * (docs/decisions/ai-gateway-for-model-calls.md).
 */
export const ROLEPLAY_MODEL_ID = "openai/gpt-5.6-luna";
export const TRANSLATION_MODEL_ID = "openai/gpt-5.6-luna";

const MAX_USER_MESSAGE_LENGTH = 4000;
const MAX_MESSAGE_ID_LENGTH = 128;
const MAX_ROLEPLAY_OUTPUT_TOKENS = 600;
const MAX_TRANSLATION_OUTPUT_TOKENS = 600;
const TRANSLATION_TIMEOUT_MS = 20_000;
const DEFAULT_MODEL_LIMITS = {
  chunkMs: 20_000,
  firstChunkMs: 20_000,
  totalMs: 90_000,
};
const STREAM_HEADERS = {
  "Content-Encoding": "none",
  "Content-Type": "application/octet-stream",
};
const SURROUNDING_QUOTES = /^["'“”'']+|["'“”'']+$/gu;
/** 한글 자모·음절. 하나라도 있으면 번역을 거쳐 영어로 전달한다. */
const HANGUL = /[ᄀ-ᇿ㄰-㆏ꥠ-꥿가-힣]/u;

export type EpisodeMessageRole = "assistant" | "user";
export type EpisodeMessageStatus = "complete" | "stopped";

export interface EpisodeMessage {
  /** 상대에게 실제로 전달된 문장. 모델이 보는 것은 언제나 이것뿐이다. */
  content: string;
  createdAt: string;
  episodeId: string;
  id: string;
  role: EpisodeMessageRole;
  /**
   * 사용자가 실제로 친 말. 비어 있으면 번역하지 않았다는 뜻이다. 판정이 언제
   * 도는지와 무관하게 남아야 해서 판정 행이 아니라 메시지가 든다.
   */
  sourceText: string | null;
  status: EpisodeMessageStatus;
}

/** 판정이 채우기 전에는 `achievedAt`이 비어 있다. 비어 있는 것이 곧 미달성이다. */
export interface RoleplayGoal {
  achievedAt: string | null;
  position: number;
  sentence: string;
}

export interface RoleplayEpisode {
  goals: RoleplayGoal[];
  id: string;
  partnerRole: string;
  scenarioDescription: string;
  scenarioTitle: string;
  status: EpisodeStatus;
  turnLimit: number;
  userRole: string;
}

/**
 * 실제로 상대에게 전달된 문장. 말풍선에는 언제나 이 문장이 남아야 하므로,
 * 한글을 번역해 보낸 경우에도 앱이 무엇이 갔는지 바로 알아야 한다.
 */
export interface DeliveredSentence {
  messageId: string;
  text: string;
}

export interface RoleplayRepository
  extends JudgmentRepository,
    EndingRepository {
  deleteStoppedAssistantMessage: (
    episodeId: string,
    messageId: string
  ) => Promise<void>;
  findMessage: (
    episodeId: string,
    messageId: string
  ) => Promise<EpisodeMessage | null>;
  findOwnedEpisode: (
    episodeId: string,
    userId: string
  ) => Promise<RoleplayEpisode | null>;
  insertAssistantMessage: (message: EpisodeMessage) => Promise<void>;
  insertUserMessage: (message: EpisodeMessage) => Promise<void>;
  listMessages: (episodeId: string) => Promise<EpisodeMessage[]>;
}

interface RoleplayGenerateOptions {
  assistantMessageId: string;
  delivered: DeliveredSentence;
  /**
   * 이 턴이 대화를 끝냈는지. 판정이 나와야 정해지므로 판정 뒤에 이어 붙고,
   * 스트림은 종료가 저장된 다음에 닫힌다.
   */
  ending: Promise<EpisodeEndReason | null>;
  episode: RoleplayEpisode;
  /** 롤플레잉과 병렬로 도는 판정. 늦게 도착하면 대화가 먼저 흐른다. */
  judgment: Promise<JudgmentUpdate | null>;
  messages: EpisodeMessage[];
  onFinish: (result: { isAborted: boolean; text: string }) => Promise<void>;
  signal: AbortSignal;
}

interface RoleplayReplayOptions {
  assistantMessageId: string;
  delivered: DeliveredSentence;
  ending: Promise<EpisodeEndReason | null>;
  judgment: Promise<JudgmentUpdate | null>;
  status: EpisodeMessageStatus;
  text: string;
}

interface RoleplayTranslateOptions {
  episode: RoleplayEpisode;
  signal: AbortSignal;
  text: string;
}

export interface RoleplayModel {
  generate: (options: RoleplayGenerateOptions) => Promise<Response>;
  replay: (options: RoleplayReplayOptions) => Promise<Response> | Response;
  translate: (options: RoleplayTranslateOptions) => Promise<string>;
}

export interface RoleplayDependencies {
  createRepository: (context: SupabaseContext<Database>) => RoleplayRepository;
  /**
   * 판정은 롤플레잉과 나뉜 두 번째 호출이다. 프롬프트가 각자 한 가지만 해야
   * 하고, 판정이 실패해도 대화는 계속되어야 하기 때문이다.
   */
  judgment: JudgmentModel;
  model: RoleplayModel;
  /** 결과 총평. 대화가 끝나는 턴에만 한 번 돈다. */
  summary: SummaryModel;
}

export class RoleplayHttpError extends Error {
  readonly status: 400 | 404 | 409 | 500;
  readonly retryable: boolean;

  constructor(
    status: 400 | 404 | 409 | 500,
    message: string,
    retryable = false,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "RoleplayHttpError";
    this.status = status;
    this.retryable = retryable;
  }
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

/** 한글이 섞여 있으면 비상구를 쓴 것이다 — 번역해서 전달한다. */
export function needsTranslation(value: string) {
  return HANGUL.test(value);
}

export function parseRoleplayRequest(input: unknown): {
  content: string;
  id: string;
} {
  if (
    typeof input !== "object" ||
    input === null ||
    !("id" in input) ||
    !("content" in input)
  ) {
    throw new RoleplayHttpError(400, "메시지 형식이 올바르지 않습니다.");
  }

  const { content, id } = input;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    codePointLength(id) > MAX_MESSAGE_ID_LENGTH ||
    typeof content !== "string"
  ) {
    throw new RoleplayHttpError(400, "메시지 형식이 올바르지 않습니다.");
  }

  const normalizedContent = content.trim();

  if (
    normalizedContent.length === 0 ||
    codePointLength(normalizedContent) > MAX_USER_MESSAGE_LENGTH
  ) {
    throw new RoleplayHttpError(400, "메시지 본문이 올바르지 않습니다.");
  }

  return { content: normalizedContent, id };
}

async function assistantMessageIdFor(episodeId: string, userMessageId: string) {
  const bytes = new TextEncoder().encode(`${episodeId}:${userMessageId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `assistant-${hex}`;
}

function withStreamingHeaders(response: Response) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(STREAM_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * 번역은 롤플레잉·판정과 별개 호출이고 **전달 전에** 끝나야 한다. 그래서 저장
 * 직전 이 자리에 있다. 실패하면 아무것도 남기지 않고 재시도 가능한 오류로
 * 답한다 — 한글을 그대로 보내면 말풍선과 상대가 본 문장이 어긋난다.
 */
async function deliverUserMessage({
  dependencies,
  episode,
  repository,
  request,
  signal,
}: {
  dependencies: RoleplayDependencies;
  episode: RoleplayEpisode;
  repository: RoleplayRepository;
  request: { content: string; id: string };
  signal: AbortSignal;
}): Promise<EpisodeMessage> {
  const stored = await repository.findMessage(episode.id, request.id);

  // 이미 전달한 문장은 다시 번역하지 않는다. 같은 ID의 재요청은 언제나 같은
  // 문장을 다시 보낸 것이고, 번역을 다시 돌리면 말풍선에 남은 문장과 어긋난다.
  if (stored) {
    if (stored.role !== "user") {
      throw new RoleplayHttpError(409, "메시지 ID가 충돌했습니다.");
    }

    return stored;
  }

  const translated = needsTranslation(request.content)
    ? await dependencies.model.translate({
        episode,
        signal,
        text: request.content,
      })
    : null;

  await repository.insertUserMessage({
    content: translated ?? request.content,
    createdAt: new Date().toISOString(),
    episodeId: episode.id,
    id: request.id,
    role: "user",
    // 번역했을 때만 원문을 남긴다. 영어로 썼으면 전달된 문장이 곧 원문이라
    // 같은 값을 두 자리에 둘 이유가 없다.
    sourceText: translated === null ? null : request.content,
    status: "complete",
  });

  // 동시에 들어온 같은 요청 중 하나가 먼저 insert했을 수 있다. 저장된 값을 다시
  // 읽어 그 문장을 전달본으로 삼는다.
  const saved = await repository.findMessage(episode.id, request.id);

  if (saved?.role !== "user") {
    throw new RoleplayHttpError(409, "메시지 ID가 충돌했습니다.");
  }

  return saved;
}

export async function respondToEpisodeMessage({
  context,
  dependencies,
  episodeId,
  input,
  requestSignal,
  userId,
}: {
  context: SupabaseContext<Database>;
  dependencies: RoleplayDependencies;
  episodeId: string;
  input: unknown;
  requestSignal: AbortSignal;
  userId: string;
}) {
  const request = parseRoleplayRequest(input);
  const repository = dependencies.createRepository(context);
  const episode = await repository.findOwnedEpisode(episodeId, userId);

  if (!episode) {
    throw new RoleplayHttpError(404, "에피소드를 찾을 수 없습니다.");
  }

  const userMessage = await deliverUserMessage({
    dependencies,
    episode,
    repository,
    request,
    signal: requestSignal,
  });
  const delivered: DeliveredSentence = {
    messageId: userMessage.id,
    text: userMessage.content,
  };

  let messages = await repository.listMessages(episodeId);
  const assistantMessageId = await assistantMessageIdFor(
    episodeId,
    userMessage.id
  );
  const existingAssistant = await repository.findMessage(
    episodeId,
    assistantMessageId
  );

  if (existingAssistant) {
    if (existingAssistant.role !== "assistant") {
      throw new RoleplayHttpError(409, "응답 메시지 ID가 충돌했습니다.");
    }

    if (existingAssistant.status !== "complete") {
      await repository.deleteStoppedAssistantMessage(
        episodeId,
        assistantMessageId
      );
      messages = messages.filter(
        (message) => message.id !== assistantMessageId
      );
    }
  }

  /**
   * 판정은 여기서 출발해 롤플레잉과 **병렬로** 돈다. 실패해도 대화 중에는
   * 아무것도 알리지 않는다 — 못 채운 발화는 다음 판정 호출이 함께 판정해
   * 조용히 메운다.
   */
  const judgment = judgeEpisodeTurn({
    episode,
    messages,
    model: dependencies.judgment,
    repository,
    signal: requestSignal,
  }).catch((error) => {
    console.error("[roleplay] judgment failed", {
      episodeId,
      message: error instanceof Error ? error.message : String(error),
    });

    return null;
  });

  /**
   * 종료는 판정이 나와야 정해진다 — 마지막 목표를 이룬 턴에서 곧바로 끝나야
   * 하기 때문이다. 판정이 실패해도 턴 상한은 그대로 걸리므로 이 판단은 언제나
   * 돈다.
   */
  const ending = judgment
    .then((update) =>
      finishEpisode({
        achievements: update?.goals ?? [],
        episode,
        messages,
        model: dependencies.summary,
        repository,
        signal: requestSignal,
      })
    )
    .catch((error) => {
      console.error("[roleplay] ending failed", {
        episodeId,
        message: error instanceof Error ? error.message : String(error),
      });

      return null;
    });

  if (existingAssistant?.status === "complete") {
    return withStreamingHeaders(
      await dependencies.model.replay({
        assistantMessageId,
        delivered,
        ending,
        judgment,
        status: existingAssistant.status,
        text: existingAssistant.content,
      })
    );
  }

  try {
    const response = await dependencies.model.generate({
      assistantMessageId,
      delivered,
      ending,
      episode,
      judgment,
      messages,
      onFinish: async ({ isAborted, text }) => {
        if (text.length === 0) {
          return;
        }

        await repository.insertAssistantMessage({
          content: text,
          createdAt: new Date().toISOString(),
          episodeId,
          id: assistantMessageId,
          role: "assistant",
          sourceText: null,
          status: isAborted ? "stopped" : "complete",
        });
      },
      signal: requestSignal,
    });

    return withStreamingHeaders(response);
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: RoleplayHttpError의 네 번째 인자가 super의 cause로 전달된다.
    throw new RoleplayHttpError(
      500,
      "AI 응답을 시작하지 못했습니다.",
      true,
      error
    );
  }
}

/**
 * 결과 화면의 `다시 확인`. 대화가 끝난 뒤에는 다음 판정 호출이 없어 자동으로
 * 메워질 기회가 사라지므로, 여기서 못 채운 발화를 한 번 더 판정한다. 한 턴의
 * 판정과 **같은 호출**이라 판정·개선문·이유가 함께 온다.
 */
export async function refillEpisodeJudgment({
  context,
  dependencies,
  episodeId,
  requestSignal,
  userId,
}: {
  context: SupabaseContext<Database>;
  dependencies: RoleplayDependencies;
  episodeId: string;
  requestSignal: AbortSignal;
  userId: string;
}): Promise<JudgmentUpdate> {
  const repository = dependencies.createRepository(context);
  const episode = await repository.findOwnedEpisode(episodeId, userId);

  if (!episode) {
    throw new RoleplayHttpError(404, "에피소드를 찾을 수 없습니다.");
  }

  const messages = await repository.listMessages(episodeId);

  try {
    const update = await judgeEpisodeTurn({
      episode,
      messages,
      model: dependencies.judgment,
      repository,
      signal: requestSignal,
    });

    return update ?? { goals: [], sentences: [] };
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: RoleplayHttpError의 네 번째 인자가 super의 cause로 전달된다.
    throw new RoleplayHttpError(500, "판정을 받지 못했어요.", true, error);
  }
}

function goalLines(goals: RoleplayGoal[]) {
  return goals.map((goal) => `- ${goal.sentence}`).join("\n");
}

/**
 * 상대는 **의도를 선해한다.** 어색한 영어를 되묻거나 고쳐 주면 대화가 끊기고,
 * 이 앱이 파는 "내 영어가 실제로 통하는가"가 성립하지 않는다. 첨삭은 판정
 * 호출의 몫이라 이 프롬프트는 롤플레잉 하나만 한다.
 */
function roleplayInstructions(episode: RoleplayEpisode) {
  return [
    "당신은 영어 회화 롤플레잉의 상대역이다.",
    `상황: ${episode.scenarioTitle} — ${episode.scenarioDescription}`,
    `당신이 연기할 역할: ${episode.partnerRole}`,
    `상대(학습자)가 맡은 역할: ${episode.userRole}`,
    "학습자가 이번 대화에서 하려는 일:",
    goalLines(episode.goals),
    "",
    "규칙:",
    "- 언제나 영어로, 맡은 역할의 사람으로서 말한다. 역할을 벗어나거나 AI라고 밝히지 않는다.",
    "- 학습자의 영어가 어색하거나 틀려도 의도를 선해해 자연스럽게 반응한다.",
    "- 문법이나 표현을 고쳐 주지 않고, 영어 실력을 화제로 삼지 않는다.",
    "- 여러 뜻으로 읽혀 정말 알아들을 수 없을 때만 짧게 되묻는다.",
    "- 1문장에서 3문장으로 짧게 말하고 대화를 이어갈 여지를 남긴다.",
    "- 학습자가 위 목표를 말할 자리를 자연스럽게 열어 주되, 학습자가 할 말을 대신 하지 않는다.",
  ].join("\n");
}

/**
 * 한글 입력은 막힐 때 쓰는 비상구다. 옮긴 문장이 곧 전달된 문장이므로 뜻을
 * 더하거나 다듬어 실력보다 나은 영어를 만들지 않는다.
 */
function translationInstructions(episode: RoleplayEpisode) {
  return [
    "당신은 영어 회화 롤플레잉에서 학습자가 한국어로 쓴 말을 영어로 옮긴다.",
    `상황: ${episode.scenarioTitle} — ${episode.scenarioDescription}`,
    `학습자가 맡은 역할: ${episode.userRole}`,
    `말을 건네는 상대: ${episode.partnerRole}`,
    "",
    "규칙:",
    "- 출력은 옮긴 영어 한 덩어리뿐이다. 설명·따옴표·다른 후보를 붙이지 않는다.",
    "- 학습자가 쓴 뜻과 말투를 그대로 옮긴다. 내용을 더하거나 빼지 않는다.",
    "- 이 상황에서 실제로 쓰는 자연스러운 구어체로 옮긴다.",
    "- 이미 영어로 쓴 부분은 그대로 둔다.",
  ].join("\n");
}

/**
 * **`content`만 넘긴다.** 상대역이 학습자의 한국어 원문을 보면 "내 영어가 실제로
 * 통하는가"라는 이 앱의 전제가 깨진다. 펼쳐 쓰지 않고 필요한 두 값만 뽑는 것이
 * 그 경계다 — 메시지에 칼럼이 늘어도 문맥은 넓어지지 않는다.
 */
function toModelMessages(messages: EpisodeMessage[]): ModelMessage[] {
  return messages.map(({ content, role }) => ({ content, role }));
}

function toUiMessages(messages: EpisodeMessage[]): UIMessage[] {
  return messages.map(({ content, id, role }) => ({
    id,
    parts: [{ text: content, type: "text" }],
    role,
  }));
}

type RoleplayModelRole = "roleplay.reply" | "roleplay.translation";
type RoleplayModelOutcome = "complete" | "error" | "timeout" | "user_stopped";

export interface RoleplayModelEvent {
  durationMs: number;
  event: "roleplay.model.completed";
  finishReason: FinishReason | null;
  modelId: string;
  outcome: RoleplayModelOutcome;
  requestId: string;
  role: RoleplayModelRole;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

function consoleModelEvent(event: RoleplayModelEvent) {
  console.info(event);
}

interface GatewayRoleplayModelOptions {
  createRequestId?: () => string;
  limits?: NonNullable<typeof DEFAULT_MODEL_LIMITS>;
  logger?: (event: RoleplayModelEvent) => void;
  model?: LanguageModel;
  now?: () => number;
  translationModel?: LanguageModel;
  translationTimeoutMs?: number;
}

class GatewayRoleplayModel implements RoleplayModel {
  private readonly configuredModel: LanguageModel | undefined;
  private readonly createRequestId: () => string;
  private readonly limits: typeof DEFAULT_MODEL_LIMITS;
  private readonly logger: (event: RoleplayModelEvent) => void;
  private readonly now: () => number;
  private readonly translationModel: LanguageModel | undefined;
  private readonly translationTimeoutMs: number;

  constructor({
    createRequestId = () => crypto.randomUUID(),
    limits = DEFAULT_MODEL_LIMITS,
    logger = consoleModelEvent,
    model,
    now = performance.now.bind(performance),
    translationModel,
    translationTimeoutMs = TRANSLATION_TIMEOUT_MS,
  }: GatewayRoleplayModelOptions = {}) {
    this.configuredModel = model;
    this.createRequestId = createRequestId;
    this.limits = limits;
    this.logger = logger;
    this.now = now;
    this.translationModel = translationModel;
    this.translationTimeoutMs = translationTimeoutMs;
  }

  async translate({ episode, signal, text }: RoleplayTranslateOptions) {
    const model = this.translationModel ?? TRANSLATION_MODEL_ID;
    const modelId = typeof model === "string" ? model : model.modelId;
    const requestId = this.createRequestId();
    const startedAt = this.now();

    try {
      const result = await generateText({
        abortSignal: AbortSignal.any([
          signal,
          AbortSignal.timeout(this.translationTimeoutMs),
        ]),
        instructions: translationInstructions(episode),
        maxOutputTokens: MAX_TRANSLATION_OUTPUT_TOKENS,
        model,
        prompt: text,
        // 사람이 전달을 기다리는 호출이다. 첫 토큰이 곧 체감 품질이라 가장 낮게 둔다.
        reasoning: "low",
      });
      const delivered = result.text.trim().replace(SURROUNDING_QUOTES, "");

      this.log({
        finishReason: result.finishReason,
        modelId,
        outcome: "complete",
        requestId,
        role: "roleplay.translation",
        startedAt,
        usage: result.usage,
      });

      if (
        delivered.length === 0 ||
        codePointLength(delivered) > MAX_USER_MESSAGE_LENGTH
      ) {
        throw new RoleplayHttpError(500, "영어로 옮기지 못했어요.", true);
      }

      return delivered;
    } catch (error) {
      if (error instanceof RoleplayHttpError) {
        throw error;
      }

      this.log({
        finishReason: null,
        modelId,
        outcome: "error",
        requestId,
        role: "roleplay.translation",
        startedAt,
      });

      // biome-ignore lint/style/useErrorCause: RoleplayHttpError의 네 번째 인자가 super의 cause로 전달된다.
      throw new RoleplayHttpError(500, "영어로 옮기지 못했어요.", true, error);
    }
  }

  generate({
    assistantMessageId,
    delivered,
    ending,
    episode,
    judgment,
    messages,
    onFinish,
    signal,
  }: RoleplayGenerateOptions) {
    const model = this.configuredModel ?? ROLEPLAY_MODEL_ID;
    const startedAt = this.now();
    const requestId = this.createRequestId();
    const modelId = typeof model === "string" ? model : model.modelId;
    let eventRecorded = false;
    const recordEvent = ({
      finishReason,
      outcome,
      usage,
    }: {
      finishReason: FinishReason | null;
      outcome: RoleplayModelOutcome;
      usage?: LanguageModelUsage;
    }) => {
      if (eventRecorded) {
        return;
      }

      eventRecorded = true;
      this.log({
        finishReason,
        modelId,
        outcome,
        requestId,
        role: "roleplay.reply",
        startedAt,
        usage,
      });
    };

    let result: ReturnType<typeof streamText>;
    try {
      result = streamText({
        abortSignal: signal,
        instructions: roleplayInstructions(episode),
        maxOutputTokens: MAX_ROLEPLAY_OUTPUT_TOKENS,
        messages: toModelMessages(messages),
        model,
        onAbort: () => {
          recordEvent({
            finishReason: null,
            outcome: signal.aborted ? "user_stopped" : "timeout",
          });
        },
        onEnd: ({ finishReason, usage }) => {
          recordEvent({
            finishReason,
            outcome: finishReason === "error" ? "error" : "complete",
            usage,
          });
        },
        onError: () => {
          recordEvent({ finishReason: "error", outcome: "error" });
        },
        // 첫 토큰이 곧 체감 품질인 자리라 가장 낮게 둔다.
        reasoning: "low",
        timeout: this.limits,
      });
    } catch (error) {
      recordEvent({ finishReason: "error", outcome: "error" });
      throw error;
    }

    const replyStream = toUIMessageStream({
      generateMessageId: () => assistantMessageId,
      onEnd: async ({ finishReason, isAborted, responseMessage }) => {
        const text = responseMessage.parts
          .filter(isTextUIPart)
          .map((part) => part.text)
          .join("");

        await onFinish({
          isAborted: isAborted || finishReason === "error",
          text,
        });
      },
      onError: () => "AI 응답을 생성하지 못했습니다.",
      originalMessages: toUiMessages(messages),
      stream: result.stream,
    });

    return Promise.resolve(
      createUIMessageStreamResponse({
        consumeSseStream: consumeStream,
        headers: STREAM_HEADERS,
        stream: createUIMessageStream({
          execute: async ({ writer }) => {
            writeDeliveredSentence(writer, delivered);
            writer.merge(replyStream);
            await writeJudgment(writer, judgment);
            await writeEnding(writer, ending);
          },
          onError: () => "AI 응답을 생성하지 못했습니다.",
        }),
      })
    );
  }

  replay({
    assistantMessageId,
    delivered,
    ending,
    judgment,
    text,
  }: RoleplayReplayOptions) {
    const textPartId = `${assistantMessageId}-text`;
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writeDeliveredSentence(writer, delivered);
        writer.write({ messageId: assistantMessageId, type: "start" });
        writer.write({ id: textPartId, type: "text-start" });
        writer.write({ delta: text, id: textPartId, type: "text-delta" });
        writer.write({ id: textPartId, type: "text-end" });
        writer.write({ finishReason: "stop", type: "finish" });
        await writeJudgment(writer, judgment);
        await writeEnding(writer, ending);
      },
    });

    return createUIMessageStreamResponse({
      consumeSseStream: consumeStream,
      headers: STREAM_HEADERS,
      stream,
    });
  }

  private log({
    finishReason,
    modelId,
    outcome,
    requestId,
    role,
    startedAt,
    usage,
  }: {
    finishReason: FinishReason | null;
    modelId: string;
    outcome: RoleplayModelOutcome;
    requestId: string;
    role: RoleplayModelRole;
    startedAt: number;
    usage?: LanguageModelUsage;
  }) {
    this.logger({
      durationMs: Math.max(0, Math.round(this.now() - startedAt)),
      event: "roleplay.model.completed",
      finishReason,
      modelId,
      outcome,
      requestId,
      role,
      usage: {
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
      },
    });
  }
}

type DeliveredWriter = Parameters<
  NonNullable<Parameters<typeof createUIMessageStream>[0]["execute"]>
>[0]["writer"];

/**
 * 전달본은 대화 기록이 아니라 방금 보낸 말풍선을 고치는 값이라 transient로
 * 얹는다. 앱은 `onData`에서 받아 말풍선의 문장을 전달된 영어로 바꾼다.
 */
function writeDeliveredSentence(
  writer: DeliveredWriter,
  delivered: DeliveredSentence
) {
  writer.write({
    data: delivered,
    transient: true,
    type: "data-delivered",
  });
}

/**
 * 판정은 롤플레잉 응답보다 늦게 도착할 수 있다. 응답을 merge한 **뒤에** 기다리
 * 므로 대화는 그대로 먼저 흐르고, 판정은 같은 스트림에 나중에 얹힌다. 판정이
 * 없거나 채운 것이 하나도 없으면 아무것도 쓰지 않는다 — 대화 화면에 알릴 것이
 * 없다.
 */
async function writeJudgment(
  writer: DeliveredWriter,
  judgment: Promise<JudgmentUpdate | null>
) {
  const update = await judgment;

  if (!update || (update.goals.length === 0 && update.sentences.length === 0)) {
    return;
  }

  writer.write({ data: update, transient: true, type: "data-judgment" });
}

/**
 * 대화가 끝났다는 사실. 저장이 이 스트림보다 먼저 끝나므로 앱은 다시 읽어도
 * 같은 값을 본다. 그래도 스트림에 실어 보내는 이유는 판정이 목표 바를 넘기는
 * 것과 같다 — 다시 읽기를 기다리지 않고 그 자리에서 composer가 사라진다.
 */
async function writeEnding(
  writer: DeliveredWriter,
  ending: Promise<EpisodeEndReason | null>
) {
  const reason = await ending;

  if (!reason) {
    return;
  }

  writer.write({ data: { reason }, transient: true, type: "data-ending" });
}

export function createGatewayRoleplayModel(
  options: GatewayRoleplayModelOptions = {}
) {
  return new GatewayRoleplayModel(options);
}

const EPISODE_COLUMNS =
  "id, scenario_title, scenario_description, partner_role, user_role, status, turn_limit, episode_goals(position, sentence, achieved_at)";
const MESSAGE_COLUMNS =
  "id, episode_id, role, content, source_text, status, created_at";

class SupabaseRoleplayRepository implements RoleplayRepository {
  private readonly client: SupabaseContext<Database>["supabaseAdmin"];

  constructor(client: SupabaseContext<Database>["supabaseAdmin"]) {
    this.client = client;
  }

  async findOwnedEpisode(episodeId: string, userId: string) {
    const { data, error } = await this.client
      .from("episodes")
      .select(EPISODE_COLUMNS)
      .eq("id", episodeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      goals: [...data.episode_goals]
        .sort((left, right) => left.position - right.position)
        .map((goal) => ({
          achievedAt: goal.achieved_at,
          position: goal.position,
          sentence: goal.sentence,
        })),
      id: data.id,
      partnerRole: data.partner_role,
      scenarioDescription: data.scenario_description,
      scenarioTitle: data.scenario_title,
      status: data.status as EpisodeStatus,
      turnLimit: data.turn_limit,
      userRole: data.user_role,
    };
  }

  async findMessage(episodeId: string, messageId: string) {
    const { data, error } = await this.client
      .from("episode_messages")
      .select(MESSAGE_COLUMNS)
      .eq("episode_id", episodeId)
      .eq("id", messageId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapDatabaseMessage(data) : null;
  }

  async listMessages(episodeId: string) {
    const { data, error } = await this.client
      .from("episode_messages")
      .select(MESSAGE_COLUMNS)
      .eq("episode_id", episodeId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapDatabaseMessage);
  }

  async insertUserMessage(message: EpisodeMessage) {
    await this.insertMessage(message);
  }

  async insertAssistantMessage(message: EpisodeMessage) {
    await this.insertMessage(message);
  }

  async listJudgedMessageIds(episodeId: string) {
    const { data, error } = await this.client
      .from("message_feedback")
      .select("message_id")
      .eq("episode_id", episodeId);

    if (error) {
      throw error;
    }

    return data.map((row) => row.message_id);
  }

  async insertMessageFeedback(episodeId: string, rows: MessageJudgment[]) {
    // 같은 발화를 두 요청이 함께 판정했으면 먼저 남긴 판정을 그대로 둔다.
    const { error } = await this.client.from("message_feedback").upsert(
      rows.map((row) => ({
        episode_id: episodeId,
        improved_sentence: row.improvedSentence,
        message_id: row.messageId,
        reasons: row.reasons,
        verdict: row.verdict,
      })),
      { ignoreDuplicates: true, onConflict: "episode_id,message_id" }
    );

    if (error) {
      throw error;
    }
  }

  async markGoalAchieved({
    achievedAt,
    episodeId,
    messageId,
    position,
  }: GoalAchievement & { episodeId: string }) {
    // 달성 시각과 달성한 발화는 함께 채운다. 이미 달성한 목표는 건드리지 않아,
    // 늦게 도착한 판정이 완료 줄의 자리를 뒤로 옮기지 못한다.
    const { error } = await this.client
      .from("episode_goals")
      .update({ achieved_at: achievedAt, achieved_message_id: messageId })
      .eq("episode_id", episodeId)
      .eq("position", position)
      .is("achieved_at", null);

    if (error) {
      throw error;
    }
  }

  async listMessageFeedback(episodeId: string) {
    const { data, error } = await this.client
      .from("message_feedback")
      .select("message_id, verdict, improved_sentence, reasons")
      .eq("episode_id", episodeId);

    if (error) {
      throw error;
    }

    return data.map((row) => ({
      improvedSentence: row.improved_sentence,
      messageId: row.message_id,
      reasons: row.reasons,
      verdict: row.verdict === "improvable" ? "improvable" : "clear",
    })) satisfies MessageJudgment[];
  }

  async finishEpisode({
    episodeId,
    reason,
    summary,
  }: {
    episodeId: string;
    reason: EpisodeEndReason;
    summary: string | null;
  }) {
    // `active`인 동안에만 끝난다. 같은 턴이 두 번 들어와도 먼저 정해진 종료
    // 사유와 총평이 그대로 남는다.
    const { error } = await this.client
      .from("episodes")
      .update({ status: reason, summary })
      .eq("id", episodeId)
      .eq("status", "active");

    if (error) {
      throw error;
    }
  }

  async deleteStoppedAssistantMessage(episodeId: string, messageId: string) {
    const { error } = await this.client
      .from("episode_messages")
      .delete()
      .eq("episode_id", episodeId)
      .eq("id", messageId)
      .eq("role", "assistant")
      .eq("status", "stopped");

    if (error) {
      throw error;
    }
  }

  private async insertMessage(message: EpisodeMessage) {
    const { error } = await this.client.from("episode_messages").upsert(
      {
        content: message.content,
        created_at: message.createdAt,
        episode_id: message.episodeId,
        id: message.id,
        role: message.role,
        source_text: message.sourceText,
        status: message.status,
      },
      { ignoreDuplicates: true, onConflict: "episode_id,id" }
    );

    if (error) {
      throw error;
    }
  }
}

function mapDatabaseMessage(
  row: Database["public"]["Tables"]["episode_messages"]["Row"]
): EpisodeMessage {
  return {
    content: row.content,
    createdAt: row.created_at,
    episodeId: row.episode_id,
    id: row.id,
    role: row.role as EpisodeMessageRole,
    sourceText: row.source_text,
    status: row.status as EpisodeMessageStatus,
  };
}

export function createProductionRoleplayDependencies(): RoleplayDependencies {
  return {
    createRepository: (context) =>
      new SupabaseRoleplayRepository(context.supabaseAdmin),
    judgment: createGatewayJudgmentModel(),
    model: createGatewayRoleplayModel(),
    summary: createGatewaySummaryModel(),
  };
}
