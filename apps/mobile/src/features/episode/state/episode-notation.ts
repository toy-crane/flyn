const SENTENCE_WORD =
  /(^\s*|\n\s*|[.!?]\s+)([\p{L}\p{M}\p{N}_]+(?:['’][\p{L}\p{M}\p{N}_]+)*)/gu;
const MIXED_CASE_OR_NUMBER = /[\p{Lu}\p{N}_]/u;
const LATIN = /\p{Script=Latin}/u;
const STANDALONE_I = /(?<![\p{L}\p{M}\p{N}_])i(?![\p{L}\p{M}\p{N}_])/gu;
const ADDRESS =
  /[^\s]*\/[^\s]*|(?:www\.|mailto:)[^\s]+|[^\s]+@[^\s]+|(?:localhost|(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]+)(?::\d+)?(?:[?#][^\s]*)?/giu;

function addressAt(text: string): (index: number) => boolean {
  const ranges = Array.from(
    text.matchAll(ADDRESS),
    (match) => [match.index, match.index + match[0].length] as const
  );
  return (index) =>
    ranges.some(([start, end]) => start <= index && index < end);
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
