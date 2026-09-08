import { Stack } from "expo-router";
import { Platform } from "react-native";

import {
  getTabStackRouteOptions,
  getTabStackScreenOptions,
} from "@/core/navigation/tab-stack";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { storyLabels } from "@/features/story/ui/story-labels";

/**
 * 플레이할 스토리를 찾는 탭과 그 안에서 여는 상세, 대화 기록.
 *
 * 셋을 한 스택에 두면 탭 바가 그대로 남고, 상세와 기록의 뒤로 가기가 들어온
 * 화면으로 돌아간다. 스토리 탭에도 같은 기록 화면이 있지만 그쪽 스택의 것이라,
 * 어느 쪽으로 들어왔는지에 따라 돌아가는 자리가 갈린다.
 */
export default function BrowseLayout() {
  const { background, foreground } = useAppTheme();

  return (
    <Stack screenOptions={getTabStackScreenOptions({ background, foreground })}>
      <Stack.Screen
        name="browse"
        options={getTabStackRouteOptions(storyLabels.browseTab)}
      />
      <Stack.Screen
        name="story/[storyId]/index"
        options={{
          // 쉐브론만 남기는 UIKit의 모드. 스토리 제목은 본문에 크게 있어
          // 이전 화면 이름을 라벨로 붙이면 같은 말이 두 번 보인다.
          headerBackButtonDisplayMode: "minimal",
          headerLargeTitleEnabled: false,
          title: "",
          ...(Platform.OS === "ios" && {
            headerShadowVisible: false,
            headerTransparent: true,
            scrollEdgeEffects: { top: "soft" },
          }),
        }}
      />
      <Stack.Screen
        name="story/[storyId]/records"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerLargeTitleEnabled: false,
          title: storyLabels.records,
        }}
      />
    </Stack>
  );
}
