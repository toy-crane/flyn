import { useMemo } from "react";
import { Text } from "react-native";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { ExpressionCard } from "@/shared/ui/expression-card";
import { Icon } from "@/shared/ui/icon";
import { correctionPresentation } from "./correction-presentation";
import { fixedMarks } from "./correction-text";
import { LearningExpressionActions } from "./expression-bookmark";

/**
 * 한 화가 끝나고 돌아보는 표현 하나.
 *
 * 표현 노트와 같은 카드다. 다른 것은 첫 줄과 아이콘 줄의 둘째 아이콘뿐이다.
 * 첫 줄은 출처 대신 이 표현을 쓰는 상황이고, 채널 색과 반짝임 아이콘이 붙는다.
 * 책갈피는 대화에서 같은 메시지의 배울 표현을 담는 것과 같은 자리를 가리킨다.
 */
export function ExpressionReviewCard({
  correction,
}: {
  correction: EpisodeCorrection;
}) {
  const presentation = correctionPresentation(correction.original);
  const spot = useMemo(
    () => ({ kind: "learning" as const, messageId: correction.messageId }),
    [correction.messageId]
  );

  return (
    <ExpressionCard
      actions={
        <LearningExpressionActions spot={spot} text={correction.fixed} />
      }
      detail={{
        original: correction.original,
        originalMarks: correction.entries.map((entry) => entry.original),
        whys: correction.entries.map((entry) => entry.why),
      }}
      english={correction.fixed}
      header={
        <>
          <Icon name="learn" size="xs" tone={presentation.tone} />
          <Text
            className={`flex-1 text-xs leading-[18px] ${presentation.text}`}
            selectable={false}
          >
            {correction.review.situation}
          </Text>
        </>
      }
      headerLabel={correction.review.situation}
      markClassName={`${presentation.text} ${presentation.surface}`}
      marks={fixedMarks(correction)}
      meaning={correction.review.meaning}
      testID={`expression-card-${correction.messageId}`}
    />
  );
}
