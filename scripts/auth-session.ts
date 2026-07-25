/**
 * 로컬 스택에서 이메일 OTP로 실제 세션을 발급한다. 소셜 로그인은 사람 손 없이
 * 자동화가 불가능해서(docs/auth-verification.md), 인증이 필요한 검증은 이 경로로 한다.
 *
 *   bun run auth:session                  # 임의 주소로 새 유저
 *   bun run auth:session me@example.test  # 주소 지정 — 다시 부르면 같은 유저
 *   bun run auth:session --json           # 리프레시 토큰까지 전부
 *
 * 기본 출력은 access_token 한 줄이라 그대로 파이프할 수 있다. 메일은 Mailpit에만
 * 쌓이므로 로컬 스택에서만 동작하고, 원격 URL이면 거부한다.
 */

import { execFileSync } from "node:child_process";

const API = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

const LOCAL_HOST = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/;
const SIX_DIGITS = /\b(\d{6})\b/;
const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

interface Session {
  access_token: string;
  refresh_token: string;
  user: { id: string };
}

interface MailpitMessage {
  ID: string;
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function publishableKey(): string {
  const fromEnv = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (fromEnv) {
    return fromEnv;
  }

  try {
    const out = execFileSync("bunx", ["supabase", "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const key = JSON.parse(out).PUBLISHABLE_KEY;

    if (typeof key === "string") {
      return key;
    }
  } catch {
    // 스택이 안 떠 있거나 출력 형식이 바뀐 경우 — 공통 안내로 떨어뜨린다.
  }

  return fail(
    "publishable 키를 찾지 못했다 — 로컬 스택이 떠 있는지 확인하라(bun run db:start)."
  );
}

function post(path: string, key: string, body: unknown): Promise<Response> {
  return fetch(`${API}${path}`, {
    body: JSON.stringify(body),
    headers: { apikey: key, "Content-Type": "application/json" },
    method: "POST",
  });
}

/** 메일은 발송 직후 바로 보이지 않을 수 있어 짧게 폴링한다. */
async function waitForCode(address: string): Promise<string> {
  const query = encodeURIComponent(`to:${address}`);

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    // 폴링이라 순차 실행이 본질이다.
    // biome-ignore lint/performance/noAwaitInLoops: 도착할 때까지 기다리는 게 목적
    const found = await fetch(`${MAILPIT}/api/v1/search?query=${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (body) =>
          (body as { messages?: MailpitMessage[] } | null)?.messages?.[0]
      )
      .catch(() => null);

    if (found) {
      const detail = await fetch(`${MAILPIT}/api/v1/message/${found.ID}`)
        .then((res) => res.json() as Promise<{ Text?: string }>)
        .catch(() => null);
      const code = detail?.Text?.match(SIX_DIGITS)?.[1];

      if (code) {
        return code;
      }
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return fail(
    `코드가 담긴 메일이 오지 않았다. Mailpit(${MAILPIT})이 떠 있는지, config.toml의 ` +
      "이메일 템플릿이 {{ .Token }}을 내보내는지 확인하라."
  );
}

async function main(): Promise<void> {
  if (!LOCAL_HOST.test(API)) {
    fail(`로컬 스택 전용이다 — SUPABASE_URL이 ${API}로 설정돼 있다.`);
  }

  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const address =
    args.find((arg) => arg.includes("@")) ?? `agent-${Date.now()}@example.test`;
  const key = publishableKey();

  const sent = await post("/auth/v1/otp", key, {
    create_user: true,
    email: address,
  });

  if (!sent.ok) {
    fail(`코드 발송 실패 (${sent.status}): ${await sent.text()}`);
  }

  const code = await waitForCode(address);

  const verified = await post("/auth/v1/verify", key, {
    email: address,
    token: code,
    type: "email",
  });

  if (!verified.ok) {
    fail(`코드 검증 실패 (${verified.status}): ${await verified.text()}`);
  }

  const session = (await verified.json()) as Session;

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify({ email: address, ...session }, null, 2)}\n`
    );
    return;
  }

  // 사람이 읽을 정보는 stderr로 — stdout은 토큰만 남겨 파이프할 수 있게 둔다.
  process.stderr.write(`${address} · ${session.user.id}\n`);
  process.stdout.write(`${session.access_token}\n`);
}

await main();
