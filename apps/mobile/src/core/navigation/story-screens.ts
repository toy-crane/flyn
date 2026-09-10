import { getTabStackScreenOptions } from "@/core/navigation/tab-stack";
import { storyLabels } from "@/features/story/ui/story-labels";

/** URL은 유지하고, 네 화면의 이동 이력은 탭 바깥의 Stack이 소유한다. */
export const storyScreens = [
  { name: "story/create", title: storyLabels.createTitle },
  { name: "story/[storyId]/index", title: "" },
  { name: "story/[storyId]/records", title: storyLabels.records },
  { name: "records/[storyId]", title: storyLabels.records },
] as const;

export function getStoryScreenOptions(colors: {
  background: string;
  foreground: string;
}) {
  return {
    ...getTabStackScreenOptions(colors),
    headerBackButtonDisplayMode: "minimal" as const,
    headerBackTitle: "뒤로 가기",
    headerLargeTitleEnabled: false,
    headerShown: true,
  };
}
