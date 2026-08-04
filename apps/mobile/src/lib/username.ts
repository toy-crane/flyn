export const USERNAME_MIN = 4;
export const USERNAME_MAX = 20;
const USERNAME_SUFFIX_LENGTH = 4;
const USERNAME_STEM_MAX = USERNAME_MAX - USERNAME_SUFFIX_LENGTH;

export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "flyn",
  "official",
  "root",
  "staff",
  "support",
  "system",
]);

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_.]*[a-z0-9]$/;
const USERNAME_SUFFIX_PATTERN = /^\d{4}$/;

export function normalizeUsername(raw: string): string {
  return raw.toLowerCase();
}

export function isUsernameValid(raw: string): boolean {
  const username = normalizeUsername(raw);

  return (
    username.length >= USERNAME_MIN &&
    username.length <= USERNAME_MAX &&
    USERNAME_PATTERN.test(username) &&
    !username.includes("..") &&
    !RESERVED_USERNAMES.has(username)
  );
}

function cleanUsernameStem(raw: string, maxLength: number): string {
  const cleaned = normalizeUsername(raw)
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, maxLength)
    .replace(/[._]+$/g, "");

  return cleaned || "user";
}

export function deriveUsernameBase(email: string): string {
  const localPart = email.split("@", 1)[0] ?? "";
  const withoutTag = localPart.split("+", 1)[0] ?? "";
  return cleanUsernameStem(withoutTag, USERNAME_MAX);
}

export type UsernameAvailability = (candidate: string) => Promise<boolean>;
export type UsernameSuffix = () => string;

export function randomUsernameSuffix(): string {
  return Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(USERNAME_SUFFIX_LENGTH, "0");
}

function withSuffix(raw: string, suffix: string): string {
  if (!USERNAME_SUFFIX_PATTERN.test(suffix)) {
    throw new Error("아이디 추천 숫자는 4자리여야 한다");
  }

  return `${cleanUsernameStem(raw, USERNAME_STEM_MAX)}${suffix}`;
}

export function createUsernameFallback(
  email: string,
  nextSuffix: UsernameSuffix = randomUsernameSuffix
): string {
  const base = deriveUsernameBase(email);
  return isUsernameValid(base) ? base : withSuffix(base, nextSuffix());
}

const MAX_CANDIDATE_ATTEMPTS = 100;

async function findSuffixedCandidate(
  base: string,
  isAvailable: UsernameAvailability,
  nextSuffix: UsernameSuffix,
  attempt = 0
): Promise<string> {
  if (attempt >= MAX_CANDIDATE_ATTEMPTS) {
    throw new Error("사용 가능한 아이디 후보를 만들지 못했어요");
  }

  const candidate = withSuffix(base, nextSuffix());
  if (isUsernameValid(candidate) && (await isAvailable(candidate))) {
    return candidate;
  }

  return findSuffixedCandidate(base, isAvailable, nextSuffix, attempt + 1);
}

export async function findAvailableUsername(
  email: string,
  isAvailable: UsernameAvailability,
  nextSuffix: UsernameSuffix = randomUsernameSuffix
): Promise<string> {
  const base = deriveUsernameBase(email);

  if (isUsernameValid(base) && (await isAvailable(base))) {
    return base;
  }

  return findSuffixedCandidate(base, isAvailable, nextSuffix);
}

async function appendAvailableSuggestion(
  raw: string,
  isAvailable: UsernameAvailability,
  nextSuffix: UsernameSuffix,
  suggestions: string[],
  seen: Set<string>,
  attempt = 0
): Promise<string[]> {
  if (suggestions.length === 3) {
    return suggestions;
  }

  if (attempt >= MAX_CANDIDATE_ATTEMPTS) {
    throw new Error("아이디 추천을 충분히 만들지 못했어요");
  }

  const candidate = withSuffix(raw, nextSuffix());
  if (seen.has(candidate) || !isUsernameValid(candidate)) {
    return appendAvailableSuggestion(
      raw,
      isAvailable,
      nextSuffix,
      suggestions,
      seen,
      attempt + 1
    );
  }

  seen.add(candidate);
  if (await isAvailable(candidate)) {
    suggestions.push(candidate);
  }

  return appendAvailableSuggestion(
    raw,
    isAvailable,
    nextSuffix,
    suggestions,
    seen,
    attempt + 1
  );
}

export function createUsernameSuggestions(
  raw: string,
  isAvailable: UsernameAvailability,
  nextSuffix: UsernameSuffix = randomUsernameSuffix
): Promise<string[]> {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  return appendAvailableSuggestion(
    raw,
    isAvailable,
    nextSuffix,
    suggestions,
    seen
  );
}
