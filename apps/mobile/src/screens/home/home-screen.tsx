import { ScrollView } from "react-native";

/**
 * 영어 학습이 들어올 자리.
 *
 * 지금은 네이티브 헤더의 큰 제목만 남는다. 무엇을 보여 줄지는 아직 정하지 않았고,
 * 정하기 전에 자리를 채우면 그것이 기준이 된다.
 *
 * 이어 하기 카드는 여기 없다. 진행을 잇는 일은 대화 기록이 회차마다 맡는다.
 */
export function HomeScreen() {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
    />
  );
}
