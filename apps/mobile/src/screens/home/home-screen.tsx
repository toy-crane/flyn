import { ScrollView, Text, View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { Button } from "@/shared/ui/button";

/**
 * Home, which is where an episode starts.
 *
 * One action and nothing to choose: no level test, no picking a scene. The
 * card names the episode and says what already went wrong, so the person knows
 * what they are walking into before the scene opens.
 *
 * Home owns no episode state. The screen only says the person wants to start;
 * the route it belongs to is what opens the episode.
 */
export function HomeScreen({ onStartEpisode }: { onStartEpisode: () => void }) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-6 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
    >
      <View
        className="gap-3 rounded-2xl bg-surface px-5 py-6"
        testID="home-episode"
      >
        <Text
          accessibilityRole="header"
          className="font-bold text-foreground text-xl"
        >
          {episodeLabels.name}
        </Text>
        <Text className="text-base text-muted leading-6">
          {episodeLabels.summary}
        </Text>
        <Button
          accessibilityLabel={episodeLabels.start}
          onPress={onStartEpisode}
        >
          {episodeLabels.start}
        </Button>
      </View>
    </ScrollView>
  );
}
