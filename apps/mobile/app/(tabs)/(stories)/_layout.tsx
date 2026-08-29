import { Stack } from "expo-router";

import {
  getTabStackRouteOptions,
  getTabStackScreenOptions,
} from "@/core/navigation/tab-stack";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { storyLabels } from "@/features/story/ui/story-labels";

/**
 * 고르는 탭과 그 안에서 여는 스토리 상세.
 *
 * 상세를 이 스택 안에 두면 탭 바가 그대로 남아, 스토리를 하나 열어 본 뒤에도
 * 고르던 자리로 바로 돌아온다.
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
        name="story/[storyId]"
        options={{ headerLargeTitleEnabled: false, title: "" }}
      />
    </Stack>
  );
}
