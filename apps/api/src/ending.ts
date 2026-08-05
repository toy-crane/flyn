import {
  type FinishReason,
  generateText,
  type LanguageModel,
  type LanguageModelUsage,
} from "ai";
import type { GoalAchievement, MessageJudgment } from "./judgment";
import type { EpisodeMessage, RoleplayEpisode } from "./roleplay";

/**
 * 결과 총평 역할의 모델. 롤플레잉·판정·번역·생성과 같은 모델을 쓰더라도 ID를
 * 따로 적어, 한 역할만 올릴 때 다른 역할이 딸려 오지 않게 한다
 * (docs/decisions/ai-gateway-for-model-calls.md).
 */
export const SUMMARY_MODEL_ID = "openai/gpt-5.6-luna";

/**
 * 총평은 대화가 끝나는 순간에 한 번 부른다. 사람이 그 자리에서 기다리지만
 * 다음 발화가 막히는 자리는 아니라, reasoning은 여기만 조금 올린다.
 */
const SUMMARY_REASONING = "medium";
const SUMMARY_TIMEOUT_MS = 40_000;
const MAX_SUMMARY_OUTPUT_TOKENS = 700;
/** DB의 episodes_summary_length 제약과 같은 값이다. 넘치면 저장이 깨진다. */
const MAX_SUMMARY_LENGTH = 4000;

/**
 * 에피소드가 끝난 이유. 저장된 상태가 곧 이유라서, 코드의 턴 상한을 바꿔도 이미
 * 끝난 에피소드의 종료 사유는 흔들리지 않는다.
 */
export type EpisodeEndReason = "goals_met" | "turns_exhausted";

/** 롤플레잉 스트림에 data part로 얹혀 앱에 도착하는 종료. */
export interface EpisodeEnding {
  reason: EpisodeEndReason;
}

export interface EndingRepository {
  /** 종료 상태와 총평을 한 번에 남긴다. 이미 끝난 에피소드는 다시 만지지 않는다. */
  finishEpisode: (input: {
    episodeId: string;
    reason: EpisodeEndReason;
    summary: string | null;
  }) => Promise<void>;
  listMessageFeedback: (episodeId: string) => Promise<MessageJudgment[]>;
}

export interface SummaryModel {
  summarize: (options: {
    episode: RoleplayEpisode;
    feedback: MessageJudgment[];
    messages: EpisodeMessage[];
    signal: AbortSignal;
  }) => Promise<string>;
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

/** 턴은 사용자 메시지 하나다. AI 발화는 세지 않는다. */
export function usedTurns(messages: EpisodeMessage[]) {
  return messages.filter((message) => message.role === "user").length;
}

/**
 * 끝났는지, 끝났다면 왜인지. **상한은 에피소드가 들고 있는 생성 시점 값**이고
 * 코드 상수를 여기서 읽지 않는다. 목표를 다 이룬 것과 턴이 다 된 것이 같은
 * 턴에 겹치면 이룬 쪽을 남긴다 — 그날 실제로 일어난 일이 그것이다.
 */
export function endingReason({
  openGoals,
  turnLimit,
  turnsUsed,
}: {
  openGoals: number;
  turnLimit: number;
  turnsUsed: number;
}): EpisodeEndReason | null {
  if (openGoals === 0) {
    return "goals_met";
  }

  if (turnsUsed >= turnLimit) {
    return "turns_exhausted";
  }

  return null;
}

/**
 * 한 턴이 끝난 뒤의 종료 판단. 방금 도착한 판정까지 얹어 봐야 마지막 목표를
 * 이룬 턴에서 곧바로 끝난다. 총평은 **여기서 한 번만** 만들어 저장하고, 결과
 * 화면은 그것을 읽기만 한다.
 *
 * 총평을 만들지 못해도 에피소드는 끝난다. 대화가 이어질 수 없는데 상태만
 * `active`로 남으면 사용자는 끝난 대화 앞에서 composer만 보게 된다.
 */
export async function finishEpisode({
  achievements,
  episode,
  messages,
  model,
  repository,
  signal,
}: {
  achievements: GoalAchievement[];
  episode: RoleplayEpisode;
  messages: EpisodeMessage[];
  model: SummaryModel;
  repository: EndingRepository;
  signal: AbortSignal;
}): Promise<EpisodeEndReason | null> {
  // 이미 끝난 에피소드의 종료 사유는 다시 정해지지 않는다.
  if (episode.status !== "active") {
    return null;
  }

  const achieved = new Set(achievements.map((goal) => goal.position));
  const openGoals = episode.goals.filter(
    (goal) => goal.achievedAt === null && !achieved.has(goal.position)
  );
  const reason = endingReason({
    openGoals: openGoals.length,
    turnLimit: episode.turnLimit,
    turnsUsed: usedTurns(messages),
  });

  if (!reason) {
    return null;
  }

  let summary: string | null = null;

  try {
    const feedback = await repository.listMessageFeedback(episode.id);

    summary = await model.summarize({ episode, feedback, messages, signal });
  } catch (error) {
    console.error("[ending] summary failed", {
      episodeId: episode.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  await repository.finishEpisode({ episodeId: episode.id, reason, summary });

  return reason;
}

/**
 * 총평은 **개별 실수 목록이 아니다.** 한 문장씩의 첨삭은 이미 문장마다 붙어
 * 있으므로, 여기서 값을 하는 것은 여러 문장에 걸쳐 되풀이된 약점 하나와 다음에
 * 챙길 것뿐이다.
 */
function summaryInstructions() {
  return [
    "당신은 영어 회화 롤플레잉을 마친 학습자에게 이번 글쓰기를 되짚어 준다.",
    "",
    "규칙:",
    "- 한국어 해요체로 문단 하나만 쓴다. 3문장에서 5문장이다.",
    "- 개별 실수를 나열하지 않는다. 여러 문장에 되풀이된 약점 하나를 짚는다.",
    "- 잘 통한 것을 먼저 한 문장으로 짚고, 그다음 약점과 다음에 챙길 것을 말한다.",
    "- 되풀이라 부를 만한 것이 없으면 없다고 말하고 다음에 해 볼 것 하나를 준다.",
    "- 문장 수도 턴 수도 세지 않는다. 목표를 몇 개 이뤘는지도 말하지 않는다.",
    "- 영어 예시는 학습자가 실제로 쓴 문장에서만 든다.",
    "- 학습자를 '당신'이라고 부르지 않는다.",
    "- 제목·머리말·목록·마크다운을 쓰지 않는다.",
  ].join("\n");
}

function utteranceLines({
  feedback,
  messages,
}: {
  feedback: MessageJudgment[];
  messages: EpisodeMessage[];
}) {
  const judged = new Map(feedback.map((row) => [row.messageId, row]));
  const lines = messages
    .filter((message) => message.role === "user")
    .map((message, index) => {
      const row = judged.get(message.id);

      return [
        `${index + 1}. ${message.content}`,
        row && row.sourceText !== message.content
          ? `   한글로 씀: ${row.sourceText}`
          : null,
        row ? `   판정: ${row.verdict}` : "   판정: 아직 없음",
        row?.improvedSentence
          ? `   더 자연스러운 문장: ${row.improvedSentence}`
          : null,
        row && row.reasons.length > 0
          ? `   이유: ${row.reasons.join(" / ")}`
          : null,
      ]
        .filter((line) => line !== null)
        .join("\n");
    });

  return lines.length > 0 ? lines.join("\n") : "없음";
}

function summaryPrompt({
  episode,
  feedback,
  messages,
}: {
  episode: RoleplayEpisode;
  feedback: MessageJudgment[];
  messages: EpisodeMessage[];
}) {
  return [
    `상황: ${episode.scenarioTitle} — ${episode.scenarioDescription}`,
    `상대 역할: ${episode.partnerRole}`,
    `학습자 역할: ${episode.userRole}`,
    "",
    "[학습자가 쓴 문장]",
    utteranceLines({ feedback, messages }),
  ].join("\n");
}

export interface SummaryModelEvent {
  durationMs: number;
  event: "ending.model.completed";
  finishReason: FinishReason | null;
  modelId: string;
  outcome: "complete" | "error";
  requestId: string;
  role: "episode.summary";
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

function consoleModelEvent(event: SummaryModelEvent) {
  console.info(event);
}

interface GatewaySummaryModelOptions {
  createRequestId?: () => string;
  logger?: (event: SummaryModelEvent) => void;
  model?: LanguageModel;
  now?: () => number;
  timeoutMs?: number;
}

class GatewaySummaryModel implements SummaryModel {
  private readonly configuredModel: LanguageModel | undefined;
  private readonly createRequestId: () => string;
  private readonly logger: (event: SummaryModelEvent) => void;
  private readonly now: () => number;
  private readonly timeoutMs: number;

  constructor({
    createRequestId = () => crypto.randomUUID(),
    logger = consoleModelEvent,
    model,
    now = performance.now.bind(performance),
    timeoutMs = SUMMARY_TIMEOUT_MS,
  }: GatewaySummaryModelOptions = {}) {
    this.configuredModel = model;
    this.createRequestId = createRequestId;
    this.logger = logger;
    this.now = now;
    this.timeoutMs = timeoutMs;
  }

  async summarize({
    episode,
    feedback,
    messages,
    signal,
  }: {
    episode: RoleplayEpisode;
    feedback: MessageJudgment[];
    messages: EpisodeMessage[];
    signal: AbortSignal;
  }) {
    const model = this.configuredModel ?? SUMMARY_MODEL_ID;
    const modelId = typeof model === "string" ? model : model.modelId;
    const requestId = this.createRequestId();
    const startedAt = this.now();

    try {
      const result = await generateText({
        abortSignal: AbortSignal.any([
          signal,
          AbortSignal.timeout(this.timeoutMs),
        ]),
        instructions: summaryInstructions(),
        maxOutputTokens: MAX_SUMMARY_OUTPUT_TOKENS,
        model,
        prompt: summaryPrompt({ episode, feedback, messages }),
        reasoning: SUMMARY_REASONING,
      });

      this.log({
        finishReason: result.finishReason,
        modelId,
        outcome: "complete",
        requestId,
        startedAt,
        usage: result.usage,
      });

      const summary = result.text.trim();

      if (
        summary.length === 0 ||
        codePointLength(summary) > MAX_SUMMARY_LENGTH
      ) {
        throw new Error("총평을 쓸 수 없는 길이입니다.");
      }

      return summary;
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
      event: "ending.model.completed",
      finishReason,
      modelId,
      outcome,
      requestId,
      role: "episode.summary",
      usage: {
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
      },
    });
  }
}

export function createGatewaySummaryModel(
  options: GatewaySummaryModelOptions = {}
) {
  return new GatewaySummaryModel(options);
}
