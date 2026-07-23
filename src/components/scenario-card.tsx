import { Tag } from "@/components/tag";
import { Pressable, Text } from "@/tw";
import { GENRE_LABEL } from "@/types/learner";
import type { Scenario } from "@/types/story";

/**
 * The home screen's suggestion card. The card is the preview — tapping it
 * starts the session, so there is no separate detail step.
 */
export function ScenarioCard({
  scenario,
  onPress,
}: {
  scenario: Scenario;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-card bg-surface px-4 py-[18px] mb-3"
    >
      <Tag label={GENRE_LABEL[scenario.genre]} />
      <Text className="mt-2.5 mb-1.5 text-[17px] font-bold text-foreground">
        {scenario.title}
      </Text>
      <Text className="mb-2.5 text-sm leading-6 text-sub2">
        {scenario.intro}
      </Text>
      <Text className="text-[13px] text-muted">
        <Text className="font-semibold text-accent">목표</Text>
        {` · ${scenario.goal}`}
      </Text>
      <Text className="mt-0.5 text-[13px] text-muted">
        <Text className="font-semibold text-sub2">나</Text>
        {` · ${scenario.myRole}  `}
        <Text className="font-semibold text-sub2">AI</Text>
        {` · ${scenario.aiRole}`}
      </Text>
    </Pressable>
  );
}
