import { View } from "react-native";

function progressStepClassName(
  episode: number,
  finished: number,
  current: number | undefined
): string {
  if (episode <= finished) {
    return "bg-accent";
  }
  if (episode === current) {
    return "border border-accent bg-accent-soft";
  }
  return "bg-border";
}

/**
 * 스토리의 진행을 말하는 유일한 표기.
 *
 * 화 수만큼 칸을 나눠 끝낸 화는 채우고, 현재 화는 테두리로 짚는다. 나머지는
 * 회색으로 남긴다. 정확한 위치와 화 제목은 카드의 글이 맡는다.
 */
export function StoryProgress({
  finished,
  current,
  total,
}: {
  finished: number;
  current?: number;
  total: number;
}) {
  const accessibilityText = current
    ? `${total}화 중 ${current}화 진행 중`
    : `${total}화 중 ${finished}화 완료`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: total,
        min: 0,
        now: finished,
        text: accessibilityText,
      }}
      accessible
      className="w-24 flex-row gap-[3px]"
      testID="story-progress"
    >
      {Array.from({ length: total }, (_, index) => index + 1).map((episode) => (
        <View
          className={`h-1 flex-1 rounded-sm ${progressStepClassName(
            episode,
            finished,
            current
          )}`}
          key={episode}
          testID={`story-progress-step-${episode}`}
        />
      ))}
    </View>
  );
}
