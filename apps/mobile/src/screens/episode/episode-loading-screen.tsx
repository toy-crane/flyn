import { useEffect, useState } from "react";
import { View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { StatusLine } from "@/shared/ui/status-line";

const LOAD_PROGRESS_DELAY_MS = 1000;

/** 짧은 조회에는 빈 본문을 지키고, 오래 걸릴 때만 그 자리에 상태를 알린다. */
export function EpisodeLoadingScreen({
  label = episodeLabels.conversationLoading,
}: {
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
