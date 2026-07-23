import { Text, View } from "@/tw";
import { MAX_TURNS } from "@/types/story";

/**
 * Always-on header for a session: the goal it will end on, and how many turns
 * are left before the story closes itself.
 */
export function GoalBar({
  goal,
  turnCount,
  maxTurns = MAX_TURNS,
}: {
  goal: string;
  turnCount: number;
  maxTurns?: number;
}) {
  return (
    <View className="mb-2 flex-row items-center gap-2 rounded-field bg-fill px-3 py-2.5">
      <Text className="flex-1 text-[13px] text-foreground">
        <Text className="font-bold text-accent">목표</Text>
        {` · ${goal}`}
      </Text>
      <Text className="text-[13px] text-muted">{`${turnCount} / ${maxTurns}턴`}</Text>
    </View>
  );
}

/** The role line under the goal bar. */
export function RolesLine({
  myRole,
  aiRole,
}: {
  myRole: string;
  aiRole: string;
}) {
  return (
    // Who is playing whom is meaningful text, not decoration — Footnote, and
    // the caption gray is reserved for what the spec calls decorative.
    <Text className="mx-0.5 mb-2.5 text-[13px] text-sub2">
      <Text className="font-semibold text-foreground">나</Text>
      {` · ${myRole}  `}
      <Text className="font-semibold text-foreground">AI</Text>
      {` · ${aiRole}(내레이션 포함)`}
    </Text>
  );
}
