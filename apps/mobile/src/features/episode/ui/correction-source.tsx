import { Typography } from "heroui-native/text";
import { View } from "react-native";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { Icon } from "@/shared/ui/icon";
import { correctionPresentation } from "./correction-presentation";

/**
 * 물어보기 시트가 어디서 왔는지, 시트 맨 위에 읽기 전용으로.
 *
 * 여기서 한 말이 아니라 여기로 오게 만든 것이라, 메시지의 동작을 하나도 갖지
 * 않고 고를 수도 없다. 내가 쓴 말과 고친 문장을 나란히 두어, 질문이 무엇에
 * 대한 것인지 답을 읽는 동안에도 잊지 않게 한다.
 *
 * 표현 노트에서 연 질문창도 같은 출처를 쓴다. 그래서 그리는 두 문장만 받는다.
 */
export function CorrectionSource({
  correction,
}: {
  correction: Pick<EpisodeCorrection, "fixed" | "original">;
}) {
  const appearance = correctionPresentation(correction.original);
  return (
    <View
      className={`mb-4 rounded-2xl px-3.5 py-3 ${appearance.surface}`}
      testID="correction-source"
    >
      <View className="mb-1 flex-row items-center gap-1.5">
        <Icon name="learn" size="sm" tone={appearance.tone} />
        <Typography.Paragraph
          className={`shrink ${appearance.text}`}
          selectable={false}
          type="body-xs"
          weight="semibold"
        >
          {appearance.title}
        </Typography.Paragraph>
      </View>
      <Typography.Paragraph
        className="mb-0.5"
        color="muted"
        selectable={false}
        testID="correction-source-original"
        type="body-sm"
      >
        {correction.original}
      </Typography.Paragraph>
      <Typography.Heading
        selectable={false}
        testID="correction-source-fixed"
        type="h6"
      >
        {correction.fixed}
      </Typography.Heading>
    </View>
  );
}
