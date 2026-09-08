import { Stack } from "expo-router";

import {
  getTabStackRouteOptions,
  getTabStackScreenOptions,
} from "@/core/navigation/tab-stack";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { storyLabels } from "@/features/story/ui/story-labels";

/**
 * 대화한 스토리로 돌아가는 탭과 그 안에서 여는 대화 기록.
 *
 * 상세는 여기 없다. 이 탭은 이미 대화한 스토리로 돌아가는 곳이라 콘텐츠 소개를
 * 다시 거치지 않고 기록으로 바로 간다.
 */
export default function StoriesLayout() {
  const { background, foreground } = useAppTheme();

  return (
    <Stack screenOptions={getTabStackScreenOptions({ background, foreground })}>
      <Stack.Screen
        name="stories"
        options={getTabStackRouteOptions(storyLabels.tab)}
      />
      <Stack.Screen
        name="records/[storyId]"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerLargeTitleEnabled: false,
          title: storyLabels.records,
        }}
      />
    </Stack>
  );
}
