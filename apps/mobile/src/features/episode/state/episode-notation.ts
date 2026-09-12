const SENTENCE_WORD =
  /(^\s*|\n\s*|[.!?]\s+)([\p{L}\p{M}\p{N}_]+(?:['’][\p{L}\p{M}\p{N}_]+)*)/gu;
const MIXED_CASE_OR_NUMBER = /[\p{Lu}\p{N}_]/u;
const LATIN = /\p{Script=Latin}/u;
const STANDALONE_I = /(?<![\p{L}\p{M}\p{N}_])i(?![\p{L}\p{M}\p{N}_])/gu;

/** 보낼 때만 표기를 고친다. 원문과 부호를 더 고치는 후처리는 하지 않는다. */
export function prepareEpisodeMessage(text: string): string {
  return text
    .replace(SENTENCE_WORD, (match, start: string, word: string) => {
      const first = word.charAt(0);
      if (!LATIN.test(first) || MIXED_CASE_OR_NUMBER.test(word)) {
        return match;
      }
      return start + first.toUpperCase() + word.slice(1);
    })
    .replace(STANDALONE_I, "I");
}
