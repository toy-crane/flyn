import { Text, View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { Button } from "@/shared/ui/button";

/** 에피소드 대화를 읽지 못했을 때 같은 화면에서 다시 읽는 상태. */
export function EpisodeUnavailableScreen({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <View
      className="flex-1 justify-center bg-background px-6"
      testID="episode-unavailable"
    >
      <View className="gap-3 rounded-2xl bg-surface px-5 py-6">
        <Text className="text-base text-muted leading-6">
          {episodeLabels.conversationUnavailable}
        </Text>
        <Button
          accessibilityLabel={episodeLabels.retry}
          isPending={isRetrying}
          onPress={onRetry}
        >
          {episodeLabels.retry}
        </Button>
      </View>
    </View>
  );
}
