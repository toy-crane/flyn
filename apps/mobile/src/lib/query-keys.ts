export const queryKeys = {
  episode: (episodeId: string) => ["episode", episodeId] as const,
  // 표시와 첨삭 시트가 함께 읽는 자리다. 시트는 이 캐시만 보고 열린다.
  episodeFeedback: (episodeId: string) =>
    ["episode-feedback", episodeId] as const,
  episodeMessages: (episodeId: string) =>
    ["episode-messages", episodeId] as const,
  episodes: (userId: string) => ["episodes", userId] as const,
  // 로그아웃이 캐시를 통째로 비우지만(use-auth.ts), 사용자별로 키를 나눠 두면
  // 비우기 전에 다른 사용자의 프로필을 잠깐이라도 보여줄 여지가 없다.
  profile: (userId: string) => ["profile", userId] as const,
  // 문장 질문은 문장마다 따로 쌓인다. 키에 발화가 들어가야 다른 문장에서 연
  // 질문과 섞이지 않는다.
  sentenceQuestion: (episodeId: string, messageId: string) =>
    ["sentence-question", episodeId, messageId] as const,
};
