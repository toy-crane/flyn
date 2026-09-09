import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PlayingEpisode } from "@/features/episode/api/episode-session";
import type { EpisodeNextUp } from "./episode-next-up";

export interface EpisodeReviewContext {
  episode: Pick<PlayingEpisode, "episodeId" | "number" | "title">;
  nextUp: EpisodeNextUp | undefined;
  story: { id: string; title: string };
  storyPlayId: string;
}
const ReviewContext = createContext<{
  current: EpisodeReviewContext | undefined;
  openReview: (context: EpisodeReviewContext) => void;
}>({ current: undefined, openReview: () => undefined });

/** 조회 중에도 문맥과 이동을 유지한다. 표현 확인은 아래 대화 화면이 계속 소유한다. */
export function EpisodeReviewProvider({ children }: { children: ReactNode }) {
  const [current, openReview] = useState<EpisodeReviewContext>();
  const value = useMemo(() => ({ current, openReview }), [current]);
  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}
export function useEpisodeReview() {
  return useContext(ReviewContext);
}
