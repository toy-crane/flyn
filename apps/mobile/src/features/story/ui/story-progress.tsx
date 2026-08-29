import { View } from "react-native";

/**
 * 스토리의 진행을 말하는 유일한 표기.
 *
 * 화 수만큼 칸을 나눠 끝낸 만큼 채운다. 빈 바는 시작 전, 가득 찬 바는 완주다.
 * 옆에 화 번호도, 체크도, 상태 낱말도 붙이지 않는다. 화면에 글자를 두지 않는
 * 대신 값 자체를 읽어 주도록 progressbar로 알린다.
 */
export function StoryProgress({
  finished,
  total,
}: {
  finished: number;
  total: number;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ max: total, min: 0, now: finished }}
      accessible
      className="w-24 flex-row gap-[3px]"
      testID="story-progress"
    >
      {Array.from({ length: total }, (_, index) => index + 1).map((episode) => (
        <View
          className={`h-1 flex-1 rounded-sm ${
            episode <= finished ? "bg-accent" : "bg-border"
          }`}
          key={episode}
        />
      ))}
    </View>
  );
}
