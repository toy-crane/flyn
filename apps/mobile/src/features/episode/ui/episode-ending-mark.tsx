import { Text, View } from "react-native";

import { episodeLabels } from "./episode-labels";

/**
 * 끝난 대화 기록의 마지막.
 *
 * 구분선 하나와 그 화에서 얻어낸 결과 한 줄로 닫는다. 결말의 종류는 쓰지
 * 않는다. 읽기 전용이라는 안내도 두지 않는다. 입력창이 없다는 것으로 충분하다.
 */
export function EpisodeEndingMark({ outcome }: { outcome?: string }) {
  return (
    <View className="items-center gap-2 py-2" testID="episode-ending-mark">
      <View className="w-full flex-row items-center gap-2.5">
        <View className="h-px flex-1 bg-border" />
        <Text className="font-semibold text-muted text-sm">
          {episodeLabels.endMark}
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      {outcome ? (
        <Text
          className="px-3 text-center text-muted text-sm leading-6"
          testID="episode-ending-outcome"
        >
          {outcome}
        </Text>
      ) : null}
    </View>
  );
}
