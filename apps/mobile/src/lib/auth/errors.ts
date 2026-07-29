/**
 * 벤더가 주는 원문은 영문·기술 문구이고 그대로 노출하면 사용자가 할 일을 알 수 없다.
 * 여기서 알려진 실패만 한국어 문장으로 갈아끼우고, 원문은 UI가 아니라 콘솔로 보낸다.
 */

export type AuthErrorKind =
  | "invalidCode"
  | "network"
  | "rateLimited"
  | "unknown";

export interface AuthErrorInfo {
  kind: AuthErrorKind;
  /** 무슨 일이 났고 무엇을 하면 되는지. 원문을 섞지 않는다. */
  message: string;
  /** rateLimited일 때만 채워진다. 서버가 알려준 재시도까지 남은 초. */
  retryAfterSeconds?: number;
  /** 얼럿 제목. 인라인 각주로 쓸 때는 무시한다. */
  title: string;
}

// "For security purposes, you can only request this after 47 seconds."
const RETRY_AFTER = /after (\d+) seconds?/i;

const NETWORK = /network request failed|failed to fetch|timeout|offline/i;
const RATE_LIMIT = /rate limit|for security purposes|too many requests/i;
const INVALID_CODE = /token has expired|invalid.*(token|otp|code)|expired/i;

export function classifyAuthError(raw: string): AuthErrorKind {
  // 순서가 의미를 가진다 — 레이트리밋 문구에 "expired"가 섞여 오는 경우가 있어
  // 코드 오류보다 먼저 본다.
  if (NETWORK.test(raw)) {
    return "network";
  }

  if (RATE_LIMIT.test(raw)) {
    return "rateLimited";
  }

  if (INVALID_CODE.test(raw)) {
    return "invalidCode";
  }

  return "unknown";
}

export function describeAuthError(raw: string): AuthErrorInfo {
  const kind = classifyAuthError(raw);

  if (kind === "network") {
    return {
      kind,
      message: "인터넷에 연결되어 있는지 확인한 뒤 다시 시도해 주세요.",
      title: "로그인하지 못했어요",
    };
  }

  if (kind === "rateLimited") {
    const seconds = Number(RETRY_AFTER.exec(raw)?.[1]);
    const wait = Number.isFinite(seconds) ? seconds : undefined;

    return {
      kind,
      message: wait
        ? `요청이 너무 잦아요. ${wait}초 후에 다시 시도할 수 있어요.`
        : "요청이 너무 잦아요. 잠시 후에 다시 시도해 주세요.",
      retryAfterSeconds: wait,
      title: "잠시 후에 다시 시도해 주세요",
    };
  }

  if (kind === "invalidCode") {
    return {
      kind,
      message: "코드가 올바르지 않거나 만료됐어요. 다시 확인해 주세요.",
      title: "코드를 확인해 주세요",
    };
  }

  return {
    kind,
    message: "잠시 후에 다시 시도해 주세요.",
    title: "로그인하지 못했어요",
  };
}

/**
 * 진단 가치는 원문에 있다. 화면에서 걷어내는 대신 여기로 보낸다.
 * PostHog가 붙으면 이 함수 한 곳만 바꾸면 된다.
 */
export function reportAuthFailure(context: string, raw: string): void {
  console.warn(`[auth] ${context}: ${raw}`);
}
