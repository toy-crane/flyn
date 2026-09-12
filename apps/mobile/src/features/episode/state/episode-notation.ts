const SENTENCE_WORD =
  /(^\s*|\n[^\S\n]*|[.!?]\s+)([\p{L}\p{M}\p{N}_]+(?:['’][\p{L}\p{M}\p{N}_]+)*)/gu;
const MIXED_CASE_OR_NUMBER = /[\p{Lu}\p{N}_]/u;
const LATIN = /\p{Script=Latin}/u;
const STANDALONE_I = /(?<![\p{L}\p{M}\p{N}_])i(?![\p{L}\p{M}\p{N}_])/gu;
const TOKEN = /\S+/gu;
const ADDRESS_PREFIX = /^(?:www\.|mailto:)/i;
const LEADING_WRAPPER = /^[^\p{L}\p{N}]+/u;
const TRAILING_WRAPPER = /[^\p{L}\p{N}]+$/u;
const QUERY_OR_FRAGMENT = /[?#]/;
const PORT = /:\d+$/;
const HOST = /^[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+$/u;

function isAddress(token: string): boolean {
  if (token.includes("/") || token.includes("@")) {
    return true;
  }
  const unwrapped = token.replace(LEADING_WRAPPER, "");
  if (ADDRESS_PREFIX.test(unwrapped)) {
    return true;
  }
  const host = (unwrapped.split(QUERY_OR_FRAGMENT, 1)[0] ?? "")
    .replace(TRAILING_WRAPPER, "")
    .replace(PORT, "");
  return host.toLowerCase() === "localhost" || HOST.test(host);
}

function addressAt(text: string): (index: number) => boolean {
  const ranges = Array.from(text.matchAll(TOKEN))
    .filter((match) => isAddress(match[0]))
    .map((match) => [match.index, match.index + match[0].length] as const);
  let cursor = 0;
  // replace 콜백의 위치는 증가하므로 주소 목록도 한 번만 순회한다.
  return (index) => {
    while ((ranges[cursor]?.[1] ?? Number.POSITIVE_INFINITY) <= index) {
      cursor += 1;
    }
    return (ranges[cursor]?.[0] ?? Number.POSITIVE_INFINITY) <= index;
  };
}

/** 보낼 때만 표기를 고친다. 원문과 부호를 더 고치는 후처리는 하지 않는다. */
export function prepareEpisodeMessage(text: string): string {
  const inAddress = addressAt(text);
  const capitalized = text.replace(
    SENTENCE_WORD,
    (match, start: string, word: string, offset: number) => {
      const first = word.charAt(0);
      if (
        inAddress(offset + start.length) ||
        !LATIN.test(first) ||
        MIXED_CASE_OR_NUMBER.test(word)
      ) {
        return match;
      }
      return start + first.toUpperCase() + word.slice(1);
    }
  );
  const inCapitalizedAddress = addressAt(capitalized);
  return capitalized.replace(STANDALONE_I, (match, offset: number) =>
    inCapitalizedAddress(offset) ? match : "I"
  );
}
