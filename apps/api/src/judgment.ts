import {
  type FinishReason,
  generateObject,
  jsonSchema,
  type LanguageModel,
  type LanguageModelUsage,
} from "ai";
import type { EpisodeMessage, RoleplayEpisode } from "./roleplay";

/**
 * 문장 판정 역할의 모델. 롤플레잉·번역과 같은 모델을 쓰더라도 ID를 따로 적어,
 * 한 역할만 올릴 때 다른 역할이 딸려 오지 않게 한다
 * (docs/decisions/ai-gateway-for-model-calls.md).
 */
export const JUDGMENT_MODEL_ID = "openai/gpt-5.6-luna";

/**
 * 판정은 롤플레잉 응답과 같은 스트림을 타므로, 늦어지면 대화가 닫히지 않는다.
 * 사람이 기다리는 시간의 상한을 여기서 끊고 못 채운 발화는 다음 판정에 넘긴다.
 */
const JUDGMENT_TIMEOUT_MS = 25_000;
const MAX_JUDGMENT_OUTPUT_TOKENS = 1600;
/** DB의 message_feedback 제약과 같은 값이다. 넘치면 저장이 통째로 깨진다. */
const MAX_IMPROVED_SENTENCE_LENGTH = 20_000;
const MAX_REASON_COUNT = 10;
const MAX_REASON_LENGTH = 1000;

export type MessageVerdict = "clear" | "improvable";

/** 판정 호출 하나가 내는 한 발화의 판정·개선문·이유. */
export interface MessageJudgment {
  improvedSentence: string | null;
  messageId: string;
  reasons: string[];
  sourceText: string;
  verdict: MessageVerdict;
}

/**
 * 목표가 어느 발화에서 달성됐는지. 대화 흐름에 남는 완료 줄의 자리가 여기서
 * 정해진다 — 시각만으로는 어디에 끼울지 알 수 없다.
 */
export interface GoalAchievement {
  achievedAt: string;
  messageId: string;
  position: number;
}

/**
 * 롤플레잉 스트림에 data part로 얹혀 앱에 도착하는 판정 결과. 개선문과 이유는
 * 저장만 하고 여기 싣지 않는다 — 드러내는 것은 첨삭 시트의 몫이다.
 */
export interface JudgmentUpdate {
  goals: GoalAchievement[];
}

/**
 * 아직 판정이 없는 발화 하나. `sourceText`는 사용자가 실제로 친 말이고,
 * `text`는 상대에게 전달된 문장이다. 한글로 썼으면 둘이 다르다.
 */
export interface PendingUtterance {
  id: string;
  sourceText: string;
  text: string;
}

export interface JudgmentDraft {
  goals: { messageId: string; position: number }[];
  sentences: {
    improvedSentence: string | null;
    messageId: string;
    reasons: string[];
    verdict: MessageVerdict;
  }[];
}

export interface JudgmentModel {
  judge: (options: {
    episode: RoleplayEpisode;
    messages: EpisodeMessage[];
    pending: PendingUtterance[];
    signal: AbortSignal;
  }) => Promise<JudgmentDraft>;
}

export interface JudgmentRepository {
  insertMessageFeedback: (
    episodeId: string,
    rows: MessageJudgment[]
  ) => Promise<void>;
  /** 행이 있다는 것이 곧 판정이 끝났다는 뜻이다. 빈 행은 만들지 않는다. */
  listJudgedMessageIds: (episodeId: string) => Promise<string[]>;
  markGoalAchieved: (
    input: GoalAchievement & { episodeId: string }
  ) => Promise<void>;
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

/**
 * 한 턴의 판정. 이번 발화만이 아니라 **판정이 빠진 발화 전부**를 함께 판정해,
 * 지난 턴에 실패한 자리를 조용히 메운다. 아직 이루지 못한 목표도 매번 다시
 * 보는데, 목표는 상대의 대답까지 있어야 이뤄지므로 대개 다음 턴에 채워진다.
 */
export async function judgeEpisodeTurn({
  episode,
  messages,
  model,
  now = () => new Date().toISOString(),
  repository,
  signal,
  sourceTexts,
}: {
  episode: RoleplayEpisode;
  messages: EpisodeMessage[];
  model: JudgmentModel;
  now?: () => string;
  repository: JudgmentRepository;
  signal: AbortSignal;
  sourceTexts: Record<string, string>;
}): Promise<JudgmentUpdate | null> {
  const judged = new Set(await repository.listJudgedMessageIds(episode.id));
  const userMessages = messages.filter((message) => message.role === "user");
  const pending: PendingUtterance[] = userMessages
    .filter((message) => !judged.has(message.id))
    .map((message) => ({
      id: message.id,
      // 지난 턴의 원문은 어디에도 남아 있지 않다. 그때는 전달된 문장이 곧
      // 사용자가 쓴 말이었던 것으로 본다.
      sourceText: sourceTexts[message.id] ?? message.content,
      text: message.content,
    }));
  const openGoals = episode.goals.filter((goal) => goal.achievedAt === null);

  // 판정할 발화도 남은 목표도 없으면 부를 이유가 없다.
  if (pending.length === 0 && openGoals.length === 0) {
    return null;
  }

  const draft = await model.judge({ episode, messages, pending, signal });
  const pendingById = new Map(pending.map((item) => [item.id, item]));
  const seenSentences = new Set<string>();
  const feedback: MessageJudgment[] = [];

  for (const sentence of draft.sentences) {
    const utterance = pendingById.get(sentence.messageId);

    // 이미 판정이 있는 발화나 있지도 않은 ID는 조용히 버린다.
    if (!utterance || seenSentences.has(sentence.messageId)) {
      continue;
    }

    seenSentences.add(sentence.messageId);
    feedback.push({
      improvedSentence: sentence.improvedSentence,
      messageId: sentence.messageId,
      reasons: sentence.reasons,
      sourceText: utterance.sourceText,
      verdict: sentence.verdict,
    });
  }

  if (feedback.length > 0) {
    await repository.insertMessageFeedback(episode.id, feedback);
  }

  const userMessageIds = new Set(userMessages.map((message) => message.id));
  const openPositions = new Set(openGoals.map((goal) => goal.position));
  const achievedAt = now();
  const achievements: GoalAchievement[] = [];

  for (const goal of draft.goals) {
    if (
      !(openPositions.has(goal.position) && userMessageIds.has(goal.messageId))
    ) {
      continue;
    }

    openPositions.delete(goal.position);
    achievements.push({
      achievedAt,
      messageId: goal.messageId,
      position: goal.position,
    });
  }

  await Promise.all(
    achievements.map((achievement) =>
      repository.markGoalAchieved({ ...achievement, episodeId: episode.id })
    )
  );

  return { goals: achievements };
}

const JUDGMENT_SCHEMA = jsonSchema<{
  goals: { messageId: string; position: number }[];
  sentences: {
    improvedSentence: string;
    messageId: string;
    reasons: string[];
    verdict: string;
  }[];
}>({
  additionalProperties: false,
  properties: {
    goals: {
      items: {
        additionalProperties: false,
        properties: {
          messageId: { type: "string" },
          position: { type: "integer" },
        },
        required: ["position", "messageId"],
        type: "object",
      },
      type: "array",
    },
    sentences: {
      items: {
        additionalProperties: false,
        properties: {
          improvedSentence: { type: "string" },
          messageId: { type: "string" },
          reasons: { items: { type: "string" }, type: "array" },
          verdict: { enum: ["clear", "improvable"], type: "string" },
        },
        required: ["messageId", "verdict", "improvedSentence", "reasons"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["sentences", "goals"],
  type: "object",
});

/**
 * 이 프롬프트는 **판정 하나만** 한다. 롤플레잉 프롬프트에 섞지 않는 이유는
 * 상대역이 문법을 화제로 삼는 순간 "내 영어가 실제로 통하는가"라는 질문이
 * 무너지기 때문이다.
 */
function judgmentInstructions() {
  return [
    "당신은 영어 회화 롤플레잉에서 학습자가 쓴 영어를 판정한다.",
    "",
    "판정할 것은 두 가지다.",
    "1) 아직 판정하지 않은 발화마다 판정을 하나씩 낸다.",
    "   - 상황에 맞게 뜻이 그대로 통했고 어색하지 않으면 verdict는 clear다.",
    "   - 통하기는 하지만 더 자연스럽게 쓸 여지가 있으면 improvable이다.",
    "   - improvable이면 improvedSentence에 학습자의 뜻과 정보를 그대로 둔",
    "     자연스러운 문장을 쓰고, reasons에 무엇을 왜 바꿨는지 항목별로 적는다.",
    "   - clear면 improvedSentence는 빈 문자열이고 reasons는 빈 배열이다.",
    "   - 실력보다 나은 문장으로 다시 쓰지 않는다. 한 곳만 고쳐도 통하면 한 곳만 고친다.",
    "2) 아직 이루지 못한 목표 중 대화에서 이미 이룬 것만 goals에 담는다.",
    "   - position과, 그 목표를 이룬 학습자 발화의 messageId를 함께 적는다.",
    "   - 상대의 대답까지 나와야 이룬 것이다. 아직이면 넣지 않는다.",
    "   - 확실하지 않으면 넣지 않는다. 다음 턴에 다시 본다.",
    "",
    "규칙:",
    "- improvedSentence는 영어, reasons는 한국어 해요체 한 줄씩이다.",
    "- 학습자를 '당신'이라고 부르지 않는다.",
    "- 판정하지 않은 발화로 주어진 messageId만 sentences에 넣는다.",
  ].join("\n");
}

function conversationLines(messages: EpisodeMessage[]) {
  return messages
    .map((message) =>
      message.role === "user"
        ? `학습자(${message.id}): ${message.content}`
        : `상대: ${message.content}`
    )
    .join("\n");
}

function judgmentPrompt({
  episode,
  messages,
  pending,
}: {
  episode: RoleplayEpisode;
  messages: EpisodeMessage[];
  pending: PendingUtterance[];
}) {
  const openGoals = episode.goals.filter((goal) => goal.achievedAt === null);

  return [
    `상황: ${episode.scenarioTitle} — ${episode.scenarioDescription}`,
    `상대 역할: ${episode.partnerRole}`,
    `학습자 역할: ${episode.userRole}`,
    "",
    "[대화]",
    conversationLines(messages),
    "",
    "[아직 판정하지 않은 발화]",
    pending.length > 0
      ? pending.map((item) => `- ${item.id}: ${item.text}`).join("\n")
      : "없음",
    "",
    "[아직 이루지 못한 목표]",
    openGoals.length > 0
      ? openGoals
          .map((goal) => `- ${goal.position}: ${goal.sentence}`)
          .join("\n")
      : "없음",
  ].join("\n");
}

export interface JudgmentModelEvent {
  durationMs: number;
  event: "judgment.model.completed";
  finishReason: FinishReason | null;
  modelId: string;
  outcome: "complete" | "error";
  requestId: string;
  role: "roleplay.judgment";
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

function consoleModelEvent(event: JudgmentModelEvent) {
  console.info(event);
}

interface GatewayJudgmentModelOptions {
  createRequestId?: () => string;
  logger?: (event: JudgmentModelEvent) => void;
  model?: LanguageModel;
  now?: () => number;
  timeoutMs?: number;
}

class GatewayJudgmentModel implements JudgmentModel {
  private readonly configuredModel: LanguageModel | undefined;
  private readonly createRequestId: () => string;
  private readonly logger: (event: JudgmentModelEvent) => void;
  private readonly now: () => number;
  private readonly timeoutMs: number;

  constructor({
    createRequestId = () => crypto.randomUUID(),
    logger = consoleModelEvent,
    model,
    now = performance.now.bind(performance),
    timeoutMs = JUDGMENT_TIMEOUT_MS,
  }: GatewayJudgmentModelOptions = {}) {
    this.configuredModel = model;
    this.createRequestId = createRequestId;
    this.logger = logger;
    this.now = now;
    this.timeoutMs = timeoutMs;
  }

  async judge({
    episode,
    messages,
    pending,
    signal,
  }: {
    episode: RoleplayEpisode;
    messages: EpisodeMessage[];
    pending: PendingUtterance[];
    signal: AbortSignal;
  }): Promise<JudgmentDraft> {
    const model = this.configuredModel ?? JUDGMENT_MODEL_ID;
    const modelId = typeof model === "string" ? model : model.modelId;
    const requestId = this.createRequestId();
    const startedAt = this.now();

    try {
      const result = await generateObject({
        abortSignal: AbortSignal.any([
          signal,
          AbortSignal.timeout(this.timeoutMs),
        ]),
        instructions: judgmentInstructions(),
        maxOutputTokens: MAX_JUDGMENT_OUTPUT_TOKENS,
        model,
        prompt: judgmentPrompt({ episode, messages, pending }),
        schema: JUDGMENT_SCHEMA,
      });

      this.log({
        finishReason: result.finishReason,
        modelId,
        outcome: "complete",
        requestId,
        startedAt,
        usage: result.usage,
      });

      return normalizeDraft(result.object, pending);
    } catch (error) {
      this.log({
        finishReason: null,
        modelId,
        outcome: "error",
        requestId,
        startedAt,
      });

      throw error;
    }
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
    outcome: "complete" | "error";
    requestId: string;
    startedAt: number;
    usage?: LanguageModelUsage;
  }) {
    this.logger({
      durationMs: Math.max(0, Math.round(this.now() - startedAt)),
      event: "judgment.model.completed",
      finishReason,
      modelId,
      outcome,
      requestId,
      role: "roleplay.judgment",
      usage: {
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
      },
    });
  }
}

function normalizeReasons(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(
      (value) => value.length > 0 && codePointLength(value) <= MAX_REASON_LENGTH
    )
    .slice(0, MAX_REASON_COUNT);
}

function normalizeSentence(
  sentence: {
    improvedSentence?: unknown;
    messageId?: unknown;
    reasons?: unknown;
    verdict?: unknown;
  },
  deliveredById: Map<string, string>
): JudgmentDraft["sentences"][number] | null {
  const messageId =
    typeof sentence.messageId === "string" ? sentence.messageId.trim() : "";

  if (messageId.length === 0) {
    return null;
  }

  const improved =
    typeof sentence.improvedSentence === "string"
      ? sentence.improvedSentence.trim()
      : "";
  // 고친 데가 없는 개선문은 판정이 clear라는 말과 같다.
  const usable =
    sentence.verdict === "improvable" &&
    improved.length > 0 &&
    improved !== deliveredById.get(messageId) &&
    codePointLength(improved) <= MAX_IMPROVED_SENTENCE_LENGTH;

  return {
    improvedSentence: usable ? improved : null,
    messageId,
    reasons: usable ? normalizeReasons(sentence.reasons) : [],
    verdict: usable ? "improvable" : "clear",
  };
}

function normalizeSentences(
  sentences: {
    improvedSentence?: unknown;
    messageId?: unknown;
    reasons?: unknown;
    verdict?: unknown;
  }[],
  pending: PendingUtterance[]
): JudgmentDraft["sentences"] {
  const deliveredById = new Map(pending.map((item) => [item.id, item.text]));

  return sentences
    .map((sentence) => normalizeSentence(sentence ?? {}, deliveredById))
    .filter((sentence) => sentence !== null);
}

function normalizeGoals(
  goals: { messageId?: unknown; position?: unknown }[]
): JudgmentDraft["goals"] {
  return goals.flatMap((goal) => {
    const messageId =
      typeof goal?.messageId === "string" ? goal.messageId.trim() : "";

    if (typeof goal?.position !== "number" || messageId.length === 0) {
      return [];
    }

    return [{ messageId, position: goal.position }];
  });
}

/**
 * 저장할 수 있는 모양으로 깎는다. 그대로 통한 문장에 개선문이 붙거나, 고칠
 * 여지가 있다면서 개선문이 비면 표시가 무엇을 뜻하는지 갈리므로 DB가 막는다.
 * 여기서 미리 맞춰야 판정 하나가 어긋나 한 턴 전체를 잃지 않는다.
 */
export function normalizeDraft(
  draft: {
    goals?: { messageId?: unknown; position?: unknown }[];
    sentences?: {
      improvedSentence?: unknown;
      messageId?: unknown;
      reasons?: unknown;
      verdict?: unknown;
    }[];
  },
  pending: PendingUtterance[]
): JudgmentDraft {
  return {
    goals: normalizeGoals(draft.goals ?? []),
    sentences: normalizeSentences(draft.sentences ?? [], pending),
  };
}

export function createGatewayJudgmentModel(
  options: GatewayJudgmentModelOptions = {}
) {
  return new GatewayJudgmentModel(options);
}
