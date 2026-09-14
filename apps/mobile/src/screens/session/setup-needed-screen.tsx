import { Typography } from "heroui-native/text";
import { ScrollView, View } from "react-native";

/**
 * What the app shows when Supabase was never configured.
 *
 * Kept apart from the signed-out state on purpose: the sign-in screen would
 * invite someone to type credentials that cannot reach anything. This screen is
 * for whoever set the project up, so it shows the raw message rather than
 * softening it into product copy.
 */
export function SetupNeededScreen({ problem }: { problem: string }) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-1 justify-center gap-3 px-6"
      testID="setup-needed"
    >
      <View className="gap-3">
        <Typography.Heading type="h3">
          앱 설정이 끝나지 않았어요
        </Typography.Heading>
        <Typography.Paragraph color="muted" selectable>
          {problem}
        </Typography.Paragraph>
      </View>
    </ScrollView>
  );
}
