import { useEffect, useState } from "react";
import { View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { ScreenLoading } from "@/shared/ui/screen-loading";
import { StatusLine } from "@/shared/ui/status-line";

const LOAD_PROGRESS_DELAY_MS = 1000;

/**
 * 짧은 조회에는 빈 본문을 지키고, 오래 걸릴 때만 그 자리에 진행 표시를 띄운다.
 *
 * 대화 읽기는 본문 전체가 기다리므로 문구 없이 진행 표시만 세운다. 에피소드를
 * 눌렀으니 그 대화를 여는 중이라는 것은 사용자가 이미 안다. 표현 돌아보기처럼
 * 제목을 위에 두고 한 칸만 기다리는 자리는 `label`을 넘겨 문구를 함께 보인다.
 */
export function EpisodeLoadingScreen({
  label,
}: {
  /** 화면에 함께 보일 문구. 본문 전체가 기다리는 자리에서는 넘기지 않는다. */
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

  if (label === undefined) {
    return (
      <ScreenLoading
        label={episodeLabels.conversationLoading}
        testID="episode-loading"
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <StatusLine
        label={label}
        loading
        sizeRole="screen"
        testID="episode-loading"
      />
    </View>
  );
}
