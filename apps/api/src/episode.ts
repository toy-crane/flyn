import type { Database } from "@flyn/supabase";
import type { SupabaseContext } from "@supabase/server";
import {
  type FinishReason,
  generateObject,
  jsonSchema,
  type LanguageModel,
  type LanguageModelUsage,
  type Schema,
} from "ai";

/**
 * 에피소드 생성 역할의 모델. 역할마다 ID를 따로 적어 한 역할만 올릴 때 다른
 * 역할이 딸려 오지 않게 한다(docs/decisions/ai-gateway-for-model-calls.md).
 */
export const EPISODE_CREATION_MODEL_ID = "openai/gpt-5.6-luna";

/**
 * 턴 상한은 **코드가 소유하는 시스템 상수**다. 에피소드 필드로 노출해 사용자가
 * 정하게 만들지 않는다. 저장할 때 이 값을 복사해 두므로, 여기를 고쳐도 이미
 * 만들어진 에피소드의 종료 사유는 흔들리지 않는다. 턴은 사용자 메시지 하나다.
 */
export const EPISODE_TURN_LIMIT = 20;

/** 한 에피소드의 목표 수. 화면과 DB 제약이 같은 숫자를 본다. */
export const EPISODE_GOAL_COUNT = 3;

/** 상황 후보 수. 한 번에 이만큼 만들고 `다른 상황 보기`가 전부 교체한다. */
export const EPISODE_SCENARIO_COUNT = 3;

const MAX_SCENARIO_TITLE_LENGTH = 200;
const MAX_SCENARIO_DESCRIPTION_LENGTH = 2000;
const MAX_ROLE_LENGTH = 200;
const MAX_GOAL_LENGTH = 500;
const MAX_MODEL_OUTPUT_TOKENS = 1200;
const MODEL_TIMEOUT_MS = 60_000;

export type EpisodeStatus = "active" | "goals_met" | "turns_exhausted";
export type EpisodeRoleTarget = "partner" | "user";

export interface EpisodeScenario {
  description: string;
  title: string;
}

export interface EpisodeRoles {
  partnerRole: string;
  userRole: string;
}

export interface EpisodeDraft extends EpisodeRoles {
  goals: string[];
}

export interface EpisodeGoal {
  achievedAt: string | null;
  position: number;
  sentence: string;
}

export interface Episode {
  createdAt: string;
  goals: EpisodeGoal[];
  id: string;
  partnerRole: string;
  scenarioDescription: string;
  scenarioTitle: string;
  status: EpisodeStatus;
  turnLimit: number;
  updatedAt: string;
  userRole: string;
}

export interface EpisodeModel {
  generateDraft: (options: {
    scenario: EpisodeScenario;
    signal: AbortSignal;
  }) => Promise<EpisodeDraft>;
  generateGoals: (options: {
    excluded: string[];
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    signal: AbortSignal;
  }) => Promise<string[]>;
  generateRole: (options: {
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    signal: AbortSignal;
    target: EpisodeRoleTarget;
  }) => Promise<string>;
  generateScenarios: (options: {
    excluded: string[];
    signal: AbortSignal;
  }) => Promise<EpisodeScenario[]>;
}

export interface EpisodeRepository {
  insertEpisode: (input: {
    goals: string[];
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    turnLimit: number;
    userId: string;
  }) => Promise<Episode>;
}

export interface EpisodeDependencies {
  createRepository: (context: SupabaseContext<Database>) => EpisodeRepository;
  model: EpisodeModel;
}

export class EpisodeHttpError extends Error {
  readonly status: 400 | 500;
  readonly retryable: boolean;

  constructor(
    status: 400 | 500,
    message: string,
    retryable = false,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "EpisodeHttpError";
    this.status = status;
    this.retryable = retryable;
  }
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

function requireText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || codePointLength(trimmed) > maxLength) {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  return trimmed;
}

function requireObject(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  return input as Record<string, unknown>;
}

function optionalTitles(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 12);
}

export function parseScenariosRequest(input: unknown): { excluded: string[] } {
  const body = requireObject(input);

  return { excluded: optionalTitles(body.excluded) };
}

function parseScenario(value: unknown): EpisodeScenario {
  const scenario = requireObject(value);

  return {
    description: requireText(
      scenario.description,
      MAX_SCENARIO_DESCRIPTION_LENGTH
    ),
    title: requireText(scenario.title, MAX_SCENARIO_TITLE_LENGTH),
  };
}

function parseRoles(body: Record<string, unknown>): EpisodeRoles {
  return {
    partnerRole: requireText(body.partnerRole, MAX_ROLE_LENGTH),
    userRole: requireText(body.userRole, MAX_ROLE_LENGTH),
  };
}

export function parseDraftRequest(input: unknown): {
  scenario: EpisodeScenario;
} {
  const body = requireObject(input);

  return { scenario: parseScenario(body.scenario) };
}

export function parseRoleRequest(input: unknown): {
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
  target: EpisodeRoleTarget;
} {
  const body = requireObject(input);

  if (body.target !== "partner" && body.target !== "user") {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  return {
    roles: parseRoles(body),
    scenario: parseScenario(body.scenario),
    target: body.target,
  };
}

export function parseGoalsRequest(input: unknown): {
  excluded: string[];
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
} {
  const body = requireObject(input);

  return {
    excluded: optionalTitles(body.excluded),
    roles: parseRoles(body),
    scenario: parseScenario(body.scenario),
  };
}

export function parseEpisodeRequest(input: unknown): {
  goals: string[];
  roles: EpisodeRoles;
  scenario: EpisodeScenario;
} {
  const body = requireObject(input);

  if (!Array.isArray(body.goals) || body.goals.length !== EPISODE_GOAL_COUNT) {
    throw new EpisodeHttpError(400, "에피소드 정보가 올바르지 않습니다.");
  }

  return {
    goals: body.goals.map((goal) => requireText(goal, MAX_GOAL_LENGTH)),
    roles: parseRoles(body),
    scenario: parseScenario(body.scenario),
  };
}

export async function listEpisodeScenarios({
  dependencies,
  input,
  signal,
}: {
  dependencies: EpisodeDependencies;
  input: unknown;
  signal: AbortSignal;
}) {
  const { excluded } = parseScenariosRequest(input);
  const scenarios = await dependencies.model.generateScenarios({
    excluded,
    signal,
  });

  return { scenarios };
}

export async function createEpisodeDraft({
  dependencies,
  input,
  signal,
}: {
  dependencies: EpisodeDependencies;
  input: unknown;
  signal: AbortSignal;
}) {
  const { scenario } = parseDraftRequest(input);

  return await dependencies.model.generateDraft({ scenario, signal });
}

export async function regenerateEpisodeRole({
  dependencies,
  input,
  signal,
}: {
  dependencies: EpisodeDependencies;
  input: unknown;
  signal: AbortSignal;
}) {
  const { roles, scenario, target } = parseRoleRequest(input);
  const role = await dependencies.model.generateRole({
    roles,
    scenario,
    signal,
    target,
  });

  return { role };
}

export async function regenerateEpisodeGoals({
  dependencies,
  input,
  signal,
}: {
  dependencies: EpisodeDependencies;
  input: unknown;
  signal: AbortSignal;
}) {
  const { excluded, roles, scenario } = parseGoalsRequest(input);
  const goals = await dependencies.model.generateGoals({
    excluded,
    roles,
    scenario,
    signal,
  });

  return { goals };
}

/**
 * 저장은 AI 호출 없이 진행 중 에피소드 한 벌을 만든다. 앱에는 insert 권한이
 * 없으므로 이 경계가 유일한 생성 경로다.
 */
export async function createEpisode({
  context,
  dependencies,
  input,
  userId,
}: {
  context: SupabaseContext<Database>;
  dependencies: EpisodeDependencies;
  input: unknown;
  userId: string;
}) {
  const { goals, roles, scenario } = parseEpisodeRequest(input);
  const repository = dependencies.createRepository(context);

  return await repository.insertEpisode({
    goals,
    roles,
    scenario,
    turnLimit: EPISODE_TURN_LIMIT,
    userId,
  });
}

const SCENARIO_SCHEMA = jsonSchema<{
  scenarios: { description: string; title: string }[];
}>({
  additionalProperties: false,
  properties: {
    scenarios: {
      items: {
        additionalProperties: false,
        properties: {
          description: { type: "string" },
          title: { type: "string" },
        },
        required: ["title", "description"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["scenarios"],
  type: "object",
});

const DRAFT_SCHEMA = jsonSchema<{
  goals: string[];
  partnerRole: string;
  userRole: string;
}>({
  additionalProperties: false,
  properties: {
    goals: { items: { type: "string" }, type: "array" },
    partnerRole: { type: "string" },
    userRole: { type: "string" },
  },
  required: ["partnerRole", "userRole", "goals"],
  type: "object",
});

const ROLE_SCHEMA = jsonSchema<{ role: string }>({
  additionalProperties: false,
  properties: { role: { type: "string" } },
  required: ["role"],
  type: "object",
});

const GOALS_SCHEMA = jsonSchema<{ goals: string[] }>({
  additionalProperties: false,
  properties: { goals: { items: { type: "string" }, type: "array" } },
  required: ["goals"],
  type: "object",
});

/**
 * 학습자 정보는 아직 프로필에 취향·영어 수준 자리가 없어 기본값으로 둔다.
 * 자리가 생기면 이 문단만 사용자 값으로 바꾼다.
 */
const LEARNER_CONTEXT =
  "학습자는 한국어를 쓰는 초중급 영어 학습자다. 여행과 일상에서 실제로 겪는 장면을 연습하고 싶어 한다.";

const COPY_RULES = [
  "모든 출력은 한국어다. 해요체를 쓰고 마침표 없는 제목을 만든다.",
  "학습자를 '당신'이라고 부르지 않는다.",
].join("\n");

const SCENARIO_INSTRUCTIONS = [
  "당신은 영어 작문 연습용 롤플레잉 상황을 만드는 작가다.",
  LEARNER_CONTEXT,
  `상황 ${EPISODE_SCENARIO_COUNT}개를 서로 다른 장소와 목적으로 만든다.`,
  "title은 20자 이내의 짧은 장면 이름이다.",
  "description은 2문장 이내로 지금 어디에서 무엇을 해야 하는지 적는다.",
  COPY_RULES,
].join("\n");

const ROLE_INSTRUCTIONS = [
  "당신은 롤플레잉 상황의 등장인물을 정한다.",
  LEARNER_CONTEXT,
  "partnerRole은 AI가 연기할 상대다. 하는 일과 이름을 함께 적는다. 예: 바리스타 Maya",
  "userRole은 학습자가 맡을 처지다. 예: 처음 방문한 여행객",
  "두 역할 모두 20자 이내다.",
  COPY_RULES,
].join("\n");

const GOAL_INSTRUCTIONS = [
  "당신은 롤플레잉 대화의 목표를 정한다.",
  LEARNER_CONTEXT,
  `학습자가 영어로 말해서 달성할 수 있는 일 ${EPISODE_GOAL_COUNT}개를 만든다.`,
  "각 목표는 20자 안팎의 동사형 한 줄이고 대화 순서대로 둔다.",
  "상대의 대답이 있어야 달성되는 것으로 만든다.",
  COPY_RULES,
].join("\n");

const DRAFT_INSTRUCTIONS = [ROLE_INSTRUCTIONS, GOAL_INSTRUCTIONS].join("\n");

function scenarioPrompt(scenario: EpisodeScenario) {
  return `상황 제목: ${scenario.title}\n상황 설명: ${scenario.description}`;
}

function excludedPrompt(label: string, excluded: string[]) {
  if (excluded.length === 0) {
    return "";
  }

  return `\n이미 보여준 ${label}이므로 겹치지 않게 완전히 새로 만든다:\n${excluded
    .map((item) => `- ${item}`)
    .join("\n")}`;
}

export type EpisodeModelRole =
  | "episode.draft"
  | "episode.goals"
  | "episode.role"
  | "episode.scenarios";

export interface EpisodeModelEvent {
  durationMs: number;
  event: "episode.model.completed";
  finishReason: FinishReason | null;
  modelId: string;
  outcome: "complete" | "error";
  requestId: string;
  role: EpisodeModelRole;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

function consoleModelEvent(event: EpisodeModelEvent) {
  console.info(event);
}

interface GatewayEpisodeModelOptions {
  createRequestId?: () => string;
  logger?: (event: EpisodeModelEvent) => void;
  model?: LanguageModel;
  now?: () => number;
  timeoutMs?: number;
}

function trimmedLines(values: unknown, maxLength: number) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && codePointLength(value) <= maxLength);
}

class GatewayEpisodeModel implements EpisodeModel {
  private readonly configuredModel: LanguageModel | undefined;
  private readonly createRequestId: () => string;
  private readonly logger: (event: EpisodeModelEvent) => void;
  private readonly now: () => number;
  private readonly timeoutMs: number;

  constructor({
    createRequestId = () => crypto.randomUUID(),
    logger = consoleModelEvent,
    model,
    now = performance.now.bind(performance),
    timeoutMs = MODEL_TIMEOUT_MS,
  }: GatewayEpisodeModelOptions = {}) {
    this.configuredModel = model;
    this.createRequestId = createRequestId;
    this.logger = logger;
    this.now = now;
    this.timeoutMs = timeoutMs;
  }

  async generateScenarios({
    excluded,
    signal,
  }: {
    excluded: string[];
    signal: AbortSignal;
  }) {
    const { scenarios } = await this.generate({
      instructions: SCENARIO_INSTRUCTIONS,
      prompt: `상황 ${EPISODE_SCENARIO_COUNT}개를 만든다.${excludedPrompt(
        "상황",
        excluded
      )}`,
      role: "episode.scenarios",
      schema: SCENARIO_SCHEMA,
      signal,
    });

    const candidates = (Array.isArray(scenarios) ? scenarios : [])
      .map((scenario) => ({
        description: String(scenario?.description ?? "").trim(),
        title: String(scenario?.title ?? "").trim(),
      }))
      .filter(
        (scenario) =>
          scenario.title.length > 0 &&
          scenario.description.length > 0 &&
          codePointLength(scenario.title) <= MAX_SCENARIO_TITLE_LENGTH &&
          codePointLength(scenario.description) <=
            MAX_SCENARIO_DESCRIPTION_LENGTH
      )
      .slice(0, EPISODE_SCENARIO_COUNT);

    if (candidates.length < EPISODE_SCENARIO_COUNT) {
      throw new EpisodeHttpError(500, "상황을 만들지 못했어요.", true);
    }

    return candidates;
  }

  async generateDraft({
    scenario,
    signal,
  }: {
    scenario: EpisodeScenario;
    signal: AbortSignal;
  }) {
    const draft = await this.generate({
      instructions: DRAFT_INSTRUCTIONS,
      prompt: `${scenarioPrompt(scenario)}\n\n이 상황의 역할 둘과 목표 ${EPISODE_GOAL_COUNT}개를 만든다.`,
      role: "episode.draft",
      schema: DRAFT_SCHEMA,
      signal,
    });

    return {
      goals: this.requireGoals(draft.goals),
      partnerRole: this.requireRole(draft.partnerRole),
      userRole: this.requireRole(draft.userRole),
    };
  }

  async generateRole({
    roles,
    scenario,
    signal,
    target,
  }: {
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    signal: AbortSignal;
    target: EpisodeRoleTarget;
  }) {
    const kept =
      target === "partner"
        ? `내 역할: ${roles.userRole}`
        : `상대 역할: ${roles.partnerRole}`;
    const previous = target === "partner" ? roles.partnerRole : roles.userRole;
    const label = target === "partner" ? "상대 역할" : "내 역할";
    const { role } = await this.generate({
      instructions: ROLE_INSTRUCTIONS,
      prompt: `${scenarioPrompt(scenario)}\n${kept}\n\n${label}만 새로 만든다. 나머지 역할은 그대로 둔다.${excludedPrompt(
        label,
        [previous]
      )}`,
      role: "episode.role",
      schema: ROLE_SCHEMA,
      signal,
    });

    return this.requireRole(role);
  }

  async generateGoals({
    excluded,
    roles,
    scenario,
    signal,
  }: {
    excluded: string[];
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    signal: AbortSignal;
  }) {
    const { goals } = await this.generate({
      instructions: GOAL_INSTRUCTIONS,
      prompt: `${scenarioPrompt(scenario)}\n상대 역할: ${roles.partnerRole}\n내 역할: ${roles.userRole}\n\n목표 ${EPISODE_GOAL_COUNT}개를 만든다.${excludedPrompt(
        "목표",
        excluded
      )}`,
      role: "episode.goals",
      schema: GOALS_SCHEMA,
      signal,
    });

    return this.requireGoals(goals);
  }

  private requireRole(value: unknown) {
    const [role] = trimmedLines([value], MAX_ROLE_LENGTH);

    if (!role) {
      throw new EpisodeHttpError(500, "역할을 만들지 못했어요.", true);
    }

    return role;
  }

  private requireGoals(values: unknown) {
    const goals = trimmedLines(values, MAX_GOAL_LENGTH).slice(
      0,
      EPISODE_GOAL_COUNT
    );

    if (goals.length < EPISODE_GOAL_COUNT) {
      throw new EpisodeHttpError(500, "목표를 만들지 못했어요.", true);
    }

    return goals;
  }

  private async generate<T>({
    instructions,
    prompt,
    role,
    schema,
    signal,
  }: {
    instructions: string;
    prompt: string;
    role: EpisodeModelRole;
    schema: Schema<T>;
    signal: AbortSignal;
  }): Promise<T> {
    const model = this.configuredModel ?? EPISODE_CREATION_MODEL_ID;
    const modelId = typeof model === "string" ? model : model.modelId;
    const requestId = this.createRequestId();
    const startedAt = this.now();

    try {
      const result = await generateObject({
        abortSignal: AbortSignal.any([
          signal,
          AbortSignal.timeout(this.timeoutMs),
        ]),
        instructions,
        maxOutputTokens: MAX_MODEL_OUTPUT_TOKENS,
        model,
        prompt,
        schema,
      });

      this.log({
        finishReason: result.finishReason,
        modelId,
        outcome: "complete",
        requestId,
        role,
        startedAt,
        usage: result.usage,
      });

      return result.object;
    } catch (error) {
      this.log({
        finishReason: null,
        modelId,
        outcome: "error",
        requestId,
        role,
        startedAt,
      });

      // biome-ignore lint/style/useErrorCause: EpisodeHttpError의 네 번째 인자가 super의 cause로 전달된다.
      throw new EpisodeHttpError(500, "지금은 만들지 못했어요.", true, error);
    }
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
    outcome: "complete" | "error";
    requestId: string;
    role: EpisodeModelRole;
    startedAt: number;
    usage?: LanguageModelUsage;
  }) {
    this.logger({
      durationMs: Math.max(0, Math.round(this.now() - startedAt)),
      event: "episode.model.completed",
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

export function createGatewayEpisodeModel(
  options: GatewayEpisodeModelOptions = {}
) {
  return new GatewayEpisodeModel(options);
}

class SupabaseEpisodeRepository implements EpisodeRepository {
  private readonly client: SupabaseContext<Database>["supabaseAdmin"];

  constructor(client: SupabaseContext<Database>["supabaseAdmin"]) {
    this.client = client;
  }

  async insertEpisode({
    goals,
    roles,
    scenario,
    turnLimit,
    userId,
  }: {
    goals: string[];
    roles: EpisodeRoles;
    scenario: EpisodeScenario;
    turnLimit: number;
    userId: string;
  }): Promise<Episode> {
    const { data: episode, error } = await this.client
      .from("episodes")
      .insert({
        partner_role: roles.partnerRole,
        scenario_description: scenario.description,
        scenario_title: scenario.title,
        turn_limit: turnLimit,
        user_id: userId,
        user_role: roles.userRole,
      })
      .select(
        "id, scenario_title, scenario_description, partner_role, user_role, status, turn_limit, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    const { data: storedGoals, error: goalsError } = await this.client
      .from("episode_goals")
      .insert(
        goals.map((sentence, index) => ({
          episode_id: episode.id,
          position: index + 1,
          sentence,
        }))
      )
      .select("position, sentence, achieved_at");

    // 목표 없는 에피소드는 대화를 시작할 수 없다. 반쪽 행을 남기지 않는다.
    if (goalsError) {
      await this.client.from("episodes").delete().eq("id", episode.id);
      throw goalsError;
    }

    return {
      createdAt: episode.created_at,
      goals: storedGoals
        .map((goal) => ({
          achievedAt: goal.achieved_at,
          position: goal.position,
          sentence: goal.sentence,
        }))
        .sort((left, right) => left.position - right.position),
      id: episode.id,
      partnerRole: episode.partner_role,
      scenarioDescription: episode.scenario_description,
      scenarioTitle: episode.scenario_title,
      status: episode.status as EpisodeStatus,
      turnLimit: episode.turn_limit,
      updatedAt: episode.updated_at,
      userRole: episode.user_role,
    };
  }
}

export function createProductionEpisodeDependencies(): EpisodeDependencies {
  return {
    createRepository: (context) =>
      new SupabaseEpisodeRepository(context.supabaseAdmin),
    model: createGatewayEpisodeModel(),
  };
}
