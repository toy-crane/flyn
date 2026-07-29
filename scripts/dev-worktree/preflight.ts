import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";

type Environment = Record<string, string | undefined>;

const API_REQUIREMENTS = [
  ["SUPABASE_URL"],
  ["SUPABASE_PUBLISHABLE_KEY"],
  ["SUPABASE_SECRET_KEY"],
  ["SUPABASE_JWKS", "SUPABASE_JWKS_URL"],
  ["AI_GATEWAY_API_KEY"],
] as const;

const MOBILE_REQUIREMENTS = [
  ["EXPO_PUBLIC_SUPABASE_URL"],
  ["EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
] as const;

function hasValue(environment: Environment, name: string) {
  return Boolean(environment[name]?.trim());
}

function missingRequirements(
  environment: Environment,
  requirements: readonly (readonly string[])[]
) {
  return requirements
    .filter((alternatives) =>
      alternatives.every((name) => !hasValue(environment, name))
    )
    .map((alternatives) => alternatives.join(" 또는 "));
}

function normalizeLocalSupabaseOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const localHosts = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

    if (!(localHosts.has(url.hostname) && url.port)) {
      return null;
    }

    return `${url.protocol}//127.0.0.1:${url.port}`;
  } catch {
    return null;
  }
}

export function mergeEnvironment(
  inheritedEnvironment: Environment,
  fileEnvironment: Environment
) {
  return {
    ...fileEnvironment,
    ...inheritedEnvironment,
  };
}

export async function loadServiceEnvironment(
  environmentPath: string,
  inheritedEnvironment: Environment
) {
  let fileEnvironment: Environment = {};

  try {
    fileEnvironment = parseEnv(await readFile(environmentPath, "utf8"));
  } catch (error) {
    if (
      !(
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      )
    ) {
      throw error;
    }
  }

  return mergeEnvironment(inheritedEnvironment, fileEnvironment);
}

export function assertDevelopmentEnvironment({
  apiEnvironment,
  mobileEnvironment,
}: {
  apiEnvironment: Environment;
  mobileEnvironment: Environment;
}) {
  const missing = [
    ...missingRequirements(apiEnvironment, API_REQUIREMENTS).map(
      (name) => `API: ${name}`
    ),
    ...missingRequirements(mobileEnvironment, MOBILE_REQUIREMENTS).map(
      (name) => `Mobile: ${name}`
    ),
  ];

  if (missing.length > 0) {
    throw new Error(
      `개발 환경 변수가 누락되었습니다:\n${missing
        .map((name) => `- ${name}`)
        .join("\n")}`
    );
  }

  const apiOrigin = normalizeLocalSupabaseOrigin(apiEnvironment.SUPABASE_URL);
  const mobileOrigin = normalizeLocalSupabaseOrigin(
    mobileEnvironment.EXPO_PUBLIC_SUPABASE_URL
  );

  if (!(apiOrigin && mobileOrigin && apiOrigin === mobileOrigin)) {
    throw new Error(
      "API와 Mobile은 같은 로컬 Supabase stack을 가리켜야 합니다."
    );
  }
}

export async function assertSupabaseRunning(
  checkStatus: () => Promise<boolean>
) {
  if (!(await checkStatus())) {
    throw new Error(
      "공유 Supabase가 실행 중이 아닙니다. 저장소에서 `bun run db:start`를 한 번 실행하세요."
    );
  }
}
