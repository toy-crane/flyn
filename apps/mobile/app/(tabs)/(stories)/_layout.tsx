import { TabStack } from "@/core/navigation/tab-stack";
import { storyLabels } from "@/features/story/ui/story-labels";

export default function StoriesLayout() {
  return <TabStack routeName="stories" title={storyLabels.tab} />;
}
