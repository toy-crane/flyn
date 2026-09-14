import { useEffect, useState } from "react";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { ScreenLoading } from "@/shared/ui/screen-loading";

const LOAD_PROGRESS_DELAY_MS = 1000;

/**
 * 짧은 조회에는 빈 본문을 지키고, 오래 걸릴 때만 그 자리에 진행 표시를 띄운다.
 *
 * 대화 읽기는 본문 전체가 기다리므로 문구 없이 진행 표시만 세운다. 에피소드를
 * 눌렀으니 그 대화를 여는 중이라는 것은 사용자가 이미 안다. 표현 돌아보기는
 * `label`로 화면 읽기에 전할 이름만 바꾼다.
 */
export function EpisodeLoadingScreen({
  label,
}: {
  /** 화면 읽기에 전할 이름. 대화 읽기는 기본 이름을 쓴다. */
  label?: string;
} = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, LOAD_PROGRESS_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <ScreenLoading
      label={label ?? episodeLabels.conversationLoading}
      testID="episode-loading"
    />
  );
}
