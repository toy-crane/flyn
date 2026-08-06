import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import {
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type FinishReason,
  isTextUIPart,
  type LanguageModel,
  type LanguageModelUsage,
  type ModelMessage,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

/**
 * 문장 질문 역할의 모델. 롤플레잉·판정과 같은 모델을 쓰더라도 ID를 따로 적어,
 * 한 역할만 올릴 때 다른 역할이 딸려 오지 않게 한다
 * (docs/decisions/ai-gateway-for-model-calls.md).
 */
export const SENTENCE_QUESTION_MODEL_ID = "openai/gpt-5.6-luna";

const MAX_QUESTION_LENGTH = 4000;
const MAX_MESSAGE_ID_LENGTH = 128;
const MAX_ANSWER_OUTPUT_TOKENS = 900;
const DEFAULT_MODEL_LIMITS = {
  chunkMs: 20_000,
  firstChunkMs: 20_000,
  totalMs: 90_000,
};
const STREAM_HEADERS = {
  "Content-Encoding": "none",
  "Content-Type": "application/octet-stream",
};

export type SentenceQuestionRole = "assistant" | "user";
export type SentenceQuestionStatus = "complete" | "stopped";

/** 문장 질문에서 오간 말 하나. 에피소드 대화와 섞이지 않는 별개의 기록이다. */
export interface SentenceQuestionMessage {
  content: string;
  createdAt: string;
  episodeId: string;
  id: string;
  /** 물어보는 대상 발화. 문장 질문은 이 문장 하나에 딸린다. */
  messageId: string;
  role: SentenceQuestionRole;
  status: SentenceQuestionStatus;
}

/**
 * 물어보는 대상 문장. 첨삭 시트가 보여 준 것을 모델도 그대로 보아야 "왜 이렇게
 * 고치면 좋은지"를 물었을 때 같은 문장을 두고 답한다.
 */
export interface QuestionedSentence {
  delivered: string;
  improvedSentence: string | null;
  reasons: string[];
  sourceText: string;
}

/** 문장이 나온 자리. 목표와 턴은 학습 질문에 필요하지 않다. */
export interface QuestionEpisode {
  id: string;
  partnerRole: string;
  scenarioDescription: string;
  scenarioTitle: string;
  userRole: string;
}

export interface SentenceQuestionRepository {
  deleteStoppedAnswer: (
    episodeId: string,
    messageId: string,
    answerId: string
  ) => Promise<void>;
  findOwnedEpisode: (
    episodeId: string,
    userId: string
  ) => Promise<QuestionEpisode | null>;
  /** 판정이 아직 없어도 문장은 물어볼 수 있다. 그때는 개선문만 비어 있다. */
  findQuestionedSentence: (
    episodeId: string,
    messageId: string
  ) => Promise<QuestionedSentence | null>;
  findQuestionMessage: (
    episodeId: string,
    messageId: string,
    id: string
  ) => Promise<SentenceQuestionMessage | null>;
  insertQuestionMessage: (message: SentenceQuestionMessage) => Promise<void>;
  listQuestionMessages: (
    episodeId: string,
    messageId: string
  ) => Promise<SentenceQuestionMessage[]>;
}

interface SentenceQuestionGenerateOptions {
  answerId: string;
  episode: QuestionEpisode;
  messages: SentenceQuestionMessage[];
  onFinish: (result: { isAborted: boolean; text: string }) => Promise<void>;
  sentence: QuestionedSentence;
  signal: AbortSignal;
}

interface SentenceQuestionReplayOptions {
  answerId: string;
  text: string;
}

export interface SentenceQuestionModel {
  generate: (options: SentenceQuestionGenerateOptions) => Promise<Response>;
  replay: (
    options: SentenceQuestionReplayOptions
  ) => Promise<Response> | Response;
}

export interface SentenceQuestionDependencies {
  createRepository: (
    context: SupabaseContext<Database>
  ) => SentenceQuestionRepository;
  model: SentenceQuestionModel;
}

export class SentenceQuestionHttpError extends Error {
  readonly status: 400 | 404 | 409 | 500;
  readonly retryable: boolean;

  constructor(
    status: 400 | 404 | 409 | 500,
    message: string,
    retryable = false,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "SentenceQuestionHttpError";
    this.status = status;
    this.retryable = retryable;
  }
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

export function parseSentenceQuestionRequest(input: unknown): {
  content: string;
  id: string;
} {
  if (
    typeof input !== "object" ||
    input === null ||
    !("id" in input) ||
    !("content" in input)
  ) {
    throw new SentenceQuestionHttpError(400, "질문 형식이 올바르지 않습니다.");
  }

  const { content, id } = input;

  if (
    typeof id !== "string" ||
    id.trim().length === 0 ||
    codePointLength(id) > MAX_MESSAGE_ID_LENGTH ||
    typeof content !== "string"
  ) {
    throw new SentenceQuestionHttpError(400, "질문 형식이 올바르지 않습니다.");
  }

  const normalizedContent = content.trim();

  if (
    normalizedContent.length === 0 ||
    codePointLength(normalizedContent) > MAX_QUESTION_LENGTH
  ) {
    throw new SentenceQuestionHttpError(400, "질문 본문이 올바르지 않습니다.");
  }

  return { content: normalizedContent, id };
}

/**
 * 같은 질문을 다시 보내면 같은 답 ID가 나온다. 재요청이 답을 두 개 남기지
 * 않도록 ID를 요청에서 유도한다.
 */
async function answerIdFor(
  episodeId: string,
  messageId: string,
  questionId: string
) {
  const bytes = new TextEncoder().encode(
    `${episodeId}:${messageId}:${questionId}`
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `answer-${hex}`;
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
 * 질문은 저장되고 나서 답을 부른다. 같은 ID로 다시 오면 이미 저장된 질문을
 * 그대로 쓴다 — 같은 문장에서 다시 열었을 때 지난 내용이 어긋나면 안 된다.
 */
async function storeQuestion({
  episodeId,
  messageId,
  repository,
  request,
}: {
  episodeId: string;
  messageId: string;
  repository: SentenceQuestionRepository;
  request: { content: string; id: string };
}): Promise<SentenceQuestionMessage> {
  const stored = await repository.findQuestionMessage(
    episodeId,
    messageId,
    request.id
  );

  if (stored) {
    if (stored.role !== "user") {
      throw new SentenceQuestionHttpError(409, "질문 ID가 충돌했습니다.");
    }

    return stored;
  }

  await repository.insertQuestionMessage({
    content: request.content,
    createdAt: new Date().toISOString(),
    episodeId,
    id: request.id,
    messageId,
    role: "user",
    status: "complete",
  });

  const saved = await repository.findQuestionMessage(
    episodeId,
    messageId,
    request.id
  );

  if (saved?.role !== "user") {
    throw new SentenceQuestionHttpError(409, "질문 ID가 충돌했습니다.");
  }

  return saved;
}

export async function answerSentenceQuestion({
  context,
  dependencies,
  episodeId,
  input,
  messageId,
  requestSignal,
  userId,
}: {
  context: SupabaseContext<Database>;
  dependencies: SentenceQuestionDependencies;
  episodeId: string;
  input: unknown;
  messageId: string;
  requestSignal: AbortSignal;
  userId: string;
}) {
  const request = parseSentenceQuestionRequest(input);
  const repository = dependencies.createRepository(context);
  const [episode, sentence] = await Promise.all([
    repository.findOwnedEpisode(episodeId, userId),
    repository.findQuestionedSentence(episodeId, messageId),
  ]);

  // 남의 에피소드, 없는 에피소드, 물어볼 수 없는 발화는 모두 같은 404다.
  if (!(episode && sentence)) {
    throw new SentenceQuestionHttpError(404, "문장을 찾을 수 없습니다.");
  }

  const question = await storeQuestion({
    episodeId,
    messageId,
    repository,
    request,
  });
  let messages = await repository.listQuestionMessages(episodeId, messageId);
  const answerId = await answerIdFor(episodeId, messageId, question.id);
  const existingAnswer = await repository.findQuestionMessage(
    episodeId,
    messageId,
    answerId
  );

  if (existingAnswer) {
    if (existingAnswer.role !== "assistant") {
      throw new SentenceQuestionHttpError(409, "답변 ID가 충돌했습니다.");
    }

    if (existingAnswer.status !== "complete") {
      await repository.deleteStoppedAnswer(episodeId, messageId, answerId);
      messages = messages.filter((message) => message.id !== answerId);
    }
  }

  if (existingAnswer?.status === "complete") {
    return withStreamingHeaders(
      await dependencies.model.replay({
        answerId,
        text: existingAnswer.content,
      })
    );
  }

  try {
    const response = await dependencies.model.generate({
      answerId,
      episode,
      messages,
      onFinish: async ({ isAborted, text }) => {
        if (text.length === 0) {
          return;
        }

        await repository.insertQuestionMessage({
          content: text,
          createdAt: new Date().toISOString(),
          episodeId,
          id: answerId,
          messageId,
          role: "assistant",
          status: isAborted ? "stopped" : "complete",
        });
      },
      sentence,
      signal: requestSignal,
    });

    return withStreamingHeaders(response);
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: SentenceQuestionHttpError의 네 번째 인자가 super의 cause로 전달된다.
    throw new SentenceQuestionHttpError(
      500,
      "답변을 시작하지 못했습니다.",
      true,
      error
    );
  }
}

/**
 * 여기는 **학습 질문**을 주고받는 자리다. 상대역을 계속 연기하면 문장을 두고
 * 물어볼 곳이 없어지므로, 이 프롬프트는 롤플레잉을 하지 않는다.
 */
function sentenceQuestionInstructions({
  episode,
  sentence,
}: {
  episode: QuestionEpisode;
  sentence: QuestionedSentence;
}) {
  return [
    "당신은 영어 회화 앱에서 학습자가 쓴 문장 하나를 두고 묻는 말에 답한다.",
    "",
    "[이 문장]",
    `학습자가 쓴 말: ${sentence.sourceText}`,
    `상대에게 전달된 문장: ${sentence.delivered}`,
    sentence.improvedSentence
      ? `더 자연스러운 문장: ${sentence.improvedSentence}`
      : "더 자연스러운 문장: 없음(그대로 통한 문장이다)",
    sentence.reasons.length > 0
      ? `첨삭에서 알려 준 이유:\n${sentence.reasons.map((reason) => `- ${reason}`).join("\n")}`
      : "첨삭에서 알려 준 이유: 없음",
    "",
    "[문장이 나온 자리]",
    `상황: ${episode.scenarioTitle} — ${episode.scenarioDescription}`,
    `상대 역할: ${episode.partnerRole}`,
    `학습자 역할: ${episode.userRole}`,
    "",
    "규칙:",
    "- 이 문장에 대한 질문에만 답한다. 상대역을 연기하거나 롤플레잉을 이어가지 않는다.",
    "- 학습자가 한국어로 묻든 영어로 묻든 한국어 해요체로 답한다. 예문만 영어로 든다.",
    "- 문법 용어를 앞세우지 않고 실제로 어떻게 들리는지로 설명한다.",
    "- 2문단을 넘기지 않는다. 묻지 않은 것을 덧붙이지 않는다.",
    "- 확실하지 않으면 확실하지 않다고 말한다.",
  ].join("\n");
}

function toModelMessages(messages: SentenceQuestionMessage[]): ModelMessage[] {
  return messages.map(({ content, role }) => ({ content, role }));
}

function toUiMessages(messages: SentenceQuestionMessage[]): UIMessage[] {
  return messages.map(({ content, id, role }) => ({
    id,
    parts: [{ text: content, type: "text" }],
    role,
  }));
}

type SentenceQuestionOutcome =
  | "complete"
  | "error"
  | "timeout"
  | "user_stopped";

export interface SentenceQuestionModelEvent {
  durationMs: number;
  event: "sentence-question.model.completed";
  finishReason: FinishReason | null;
  modelId: string;
  outcome: SentenceQuestionOutcome;
  requestId: string;
  role: "sentence.question";
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

function consoleModelEvent(event: SentenceQuestionModelEvent) {
  console.info(event);
}

interface GatewaySentenceQuestionModelOptions {
  createRequestId?: () => string;
  limits?: typeof DEFAULT_MODEL_LIMITS;
  logger?: (event: SentenceQuestionModelEvent) => void;
  model?: LanguageModel;
  now?: () => number;
}

class GatewaySentenceQuestionModel implements SentenceQuestionModel {
  private readonly configuredModel: LanguageModel | undefined;
  private readonly createRequestId: () => string;
  private readonly limits: typeof DEFAULT_MODEL_LIMITS;
  private readonly logger: (event: SentenceQuestionModelEvent) => void;
  private readonly now: () => number;

  constructor({
    createRequestId = () => crypto.randomUUID(),
    limits = DEFAULT_MODEL_LIMITS,
    logger = consoleModelEvent,
    model,
    now = performance.now.bind(performance),
  }: GatewaySentenceQuestionModelOptions = {}) {
    this.configuredModel = model;
    this.createRequestId = createRequestId;
    this.limits = limits;
    this.logger = logger;
    this.now = now;
  }

  generate({
    answerId,
    episode,
    messages,
    onFinish,
    sentence,
    signal,
  }: SentenceQuestionGenerateOptions) {
    const model = this.configuredModel ?? SENTENCE_QUESTION_MODEL_ID;
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
      outcome: SentenceQuestionOutcome;
      usage?: LanguageModelUsage;
    }) => {
      if (eventRecorded) {
        return;
      }

      eventRecorded = true;
      this.log({ finishReason, modelId, outcome, requestId, startedAt, usage });
    };

    let result: ReturnType<typeof streamText>;
    try {
      result = streamText({
        abortSignal: signal,
        instructions: sentenceQuestionInstructions({ episode, sentence }),
        maxOutputTokens: MAX_ANSWER_OUTPUT_TOKENS,
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
        // 사람이 답을 기다리는 자리라 첫 토큰이 곧 체감 품질이다.
        reasoning: "low",
        timeout: this.limits,
      });
    } catch (error) {
      recordEvent({ finishReason: "error", outcome: "error" });
      throw error;
    }

    // 마지막 사용자 메시지까지가 원본이다. 답변만 새 메시지로 붙는다.
    const history = messages.filter((message) => message.id !== answerId);

    return Promise.resolve(
      createUIMessageStreamResponse({
        consumeSseStream: consumeStream,
        headers: STREAM_HEADERS,
        stream: toUIMessageStream({
          generateMessageId: () => answerId,
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
          onError: () => "답변을 만들지 못했습니다.",
          originalMessages: toUiMessages(history),
          stream: result.stream,
        }),
      })
    );
  }

  replay({ answerId, text }: SentenceQuestionReplayOptions) {
    const textPartId = `${answerId}-text`;
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ messageId: answerId, type: "start" });
        writer.write({ id: textPartId, type: "text-start" });
        writer.write({ delta: text, id: textPartId, type: "text-delta" });
        writer.write({ id: textPartId, type: "text-end" });
        writer.write({ finishReason: "stop", type: "finish" });
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
    startedAt,
    usage,
  }: {
    finishReason: FinishReason | null;
    modelId: string;
    outcome: SentenceQuestionOutcome;
    requestId: string;
    startedAt: number;
    usage?: LanguageModelUsage;
  }) {
    this.logger({
      durationMs: Math.max(0, Math.round(this.now() - startedAt)),
      event: "sentence-question.model.completed",
      finishReason,
      modelId,
      outcome,
      requestId,
      role: "sentence.question",
      usage: {
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
      },
    });
  }
}

export function createGatewaySentenceQuestionModel(
  options: GatewaySentenceQuestionModelOptions = {}
) {
  return new GatewaySentenceQuestionModel(options);
}

const EPISODE_COLUMNS =
  "id, scenario_title, scenario_description, partner_role, user_role";
const QUESTION_COLUMNS =
  "id, episode_id, message_id, role, content, status, created_at";

class SupabaseSentenceQuestionRepository implements SentenceQuestionRepository {
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
      id: data.id,
      partnerRole: data.partner_role,
      scenarioDescription: data.scenario_description,
      scenarioTitle: data.scenario_title,
      userRole: data.user_role,
    };
  }

  /**
   * 물어볼 수 있는 문장은 **내가 쓴 발화**뿐이다. 판정은 늦게 도착할 수 있으므로
   * 없으면 없는 대로 둔다 — 그 문장을 두고 물어보는 것 자체는 막히지 않는다.
   */
  async findQuestionedSentence(episodeId: string, messageId: string) {
    const [message, feedback] = await Promise.all([
      this.client
        .from("episode_messages")
        .select("content, role, source_text")
        .eq("episode_id", episodeId)
        .eq("id", messageId)
        .maybeSingle(),
      this.client
        .from("message_feedback")
        .select("improved_sentence, reasons")
        .eq("episode_id", episodeId)
        .eq("message_id", messageId)
        .maybeSingle(),
    ]);

    if (message.error) {
      throw message.error;
    }

    if (feedback.error) {
      throw feedback.error;
    }

    if (message.data?.role !== "user") {
      return null;
    }

    return {
      delivered: message.data.content,
      improvedSentence: feedback.data?.improved_sentence ?? null,
      reasons: feedback.data?.reasons ?? [],
      sourceText: message.data.source_text ?? message.data.content,
    };
  }

  async findQuestionMessage(
    episodeId: string,
    messageId: string,
    id: string
  ): Promise<SentenceQuestionMessage | null> {
    const { data, error } = await this.client
      .from("sentence_question_messages")
      .select(QUESTION_COLUMNS)
      .eq("episode_id", episodeId)
      .eq("message_id", messageId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapDatabaseMessage(data) : null;
  }

  async listQuestionMessages(episodeId: string, messageId: string) {
    const { data, error } = await this.client
      .from("sentence_question_messages")
      .select(QUESTION_COLUMNS)
      .eq("episode_id", episodeId)
      .eq("message_id", messageId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapDatabaseMessage);
  }

  async insertQuestionMessage(message: SentenceQuestionMessage) {
    // 같은 ID의 재요청은 같은 말을 다시 보낸 것이다. 먼저 남은 것을 그대로 둔다.
    const { error } = await this.client
      .from("sentence_question_messages")
      .upsert(
        {
          content: message.content,
          created_at: message.createdAt,
          episode_id: message.episodeId,
          id: message.id,
          message_id: message.messageId,
          role: message.role,
          status: message.status,
        },
        { ignoreDuplicates: true, onConflict: "episode_id,message_id,id" }
      );

    if (error) {
      throw error;
    }
  }

  async deleteStoppedAnswer(
    episodeId: string,
    messageId: string,
    answerId: string
  ) {
    const { error } = await this.client
      .from("sentence_question_messages")
      .delete()
      .eq("episode_id", episodeId)
      .eq("message_id", messageId)
      .eq("id", answerId)
      .eq("role", "assistant")
      .eq("status", "stopped");

    if (error) {
      throw error;
    }
  }
}

function mapDatabaseMessage(
  row: Database["public"]["Tables"]["sentence_question_messages"]["Row"]
): SentenceQuestionMessage {
  return {
    content: row.content,
    createdAt: row.created_at,
    episodeId: row.episode_id,
    id: row.id,
    messageId: row.message_id,
    role: row.role as SentenceQuestionRole,
    status: row.status as SentenceQuestionStatus,
  };
}

export function createProductionSentenceQuestionDependencies(): SentenceQuestionDependencies {
  return {
    createRepository: (context) =>
      new SupabaseSentenceQuestionRepository(context.supabaseAdmin),
    model: createGatewaySentenceQuestionModel(),
  };
}
