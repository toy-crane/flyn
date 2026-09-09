import { StoryRecordsRoute } from "@/screens/stories/story-records-route";

/**
 * 이 탭 스택의 대화 기록.
 *
 * 두 탭이 각자 자기 경로를 가져야 뒤로 가기가 들어온 화면으로 돌아간다. 하는
 * 일은 같으므로 본체는 한 곳에 두고 여기서는 그것을 그린다.
 */
export default function StoryRecordsScreenRoute() {
  return <StoryRecordsRoute />;
}
