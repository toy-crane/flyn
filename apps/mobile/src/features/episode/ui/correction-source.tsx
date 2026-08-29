import { Text, View } from "react-native";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { Icon } from "@/shared/ui/icon";
import { correctionLabels } from "./episode-labels";

/**
 * 물어보기 시트가 어디서 왔는지, 시트 맨 위에 읽기 전용으로.
 *
 * 여기서 한 말이 아니라 여기로 오게 만든 것이라, 메시지의 동작을 하나도 갖지
 * 않고 고를 수도 없다. 내가 쓴 말과 고친 문장을 나란히 두어, 질문이 무엇에
 * 대한 것인지 답을 읽는 동안에도 잊지 않게 한다.
 */
export function CorrectionSource({
  correction,
}: {
  correction: EpisodeCorrection;
}) {
  return (
    <View
      className="mb-4 rounded-2xl bg-learn-surface px-3.5 py-3"
      testID="correction-source"
    >
      <View className="mb-1 flex-row items-center gap-1.5">
        <Icon name="learn" size="sm" tone="learn" />
        <Text className="font-semibold text-learn text-xs" selectable={false}>
          {correctionLabels.label}
        </Text>
      </View>
      <Text
        className="mb-0.5 text-muted text-sm leading-5"
        selectable={false}
        testID="correction-source-original"
      >
        {correction.original}
      </Text>
      <Text
        className="font-semibold text-base text-foreground leading-6"
        selectable={false}
        testID="correction-source-fixed"
      >
        {correction.fixed}
      </Text>
    </View>
  );
}
