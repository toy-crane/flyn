import { Pressable, Text, View } from "@/tw";
import type { Correction } from "@/types/correction";
import { splitBySpans } from "@/utils/text-spans";

/**
 * Step two of the three-step path: the corrected sentence with only the changed
 * words in accent bold, one line of why, and the way into the thread.
 */
export function CorrectionPanel({
  correction,
  onAskMore,
}: {
  correction: Correction;
  onAskMore?: () => void;
}) {
  return (
    <View className="mt-1.5 w-full rounded-cta bg-surface px-3.5 py-2.5">
      <Text className="mb-1 text-[15px] font-bold text-foreground">
        {splitBySpans(correction.correctedText, correction.changedSpans).map(
          (segment, index) =>
            segment.flagged ? (
              <Text key={index} className="font-bold text-accent">
                {segment.text}
              </Text>
            ) : (
              <Text key={index}>{segment.text}</Text>
            ),
        )}
      </Text>
      <Text className="mb-1.5 text-[13px] leading-5 text-sub2">
        {correction.reason}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAskMore}
        className="min-h-11 justify-center self-end"
      >
        <Text className="text-sm font-semibold text-accent">더 물어보기 →</Text>
      </Pressable>
    </View>
  );
}
