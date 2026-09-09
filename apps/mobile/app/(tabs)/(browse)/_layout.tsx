import { TabStack } from "@/core/navigation/tab-stack";
import { storyLabels } from "@/features/story/ui/story-labels";

export default function BrowseLayout() {
  return <TabStack routeName="browse" title={storyLabels.browseTab} />;
}
