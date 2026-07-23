import { Pressable, Text, View } from "@/tw";
import type { Correction } from "@/types/correction";
import { splitBySpans } from "@/utils/text-spans";

/**
 * Step two of the three-step path: the corrected sentence with only the changed
 * words in tint bold, one line of why, and the way into the thread.
 */
export function CorrectionPanel({
  correction,
  onAskMore,
}: {
  correction: Correction;
  onAskMore?: () => void;
}) {
  return (
    <View
      className="mt-1.5 w-full rounded-card bg-card px-3.5 py-2.5"
      style={{ borderCurve: "continuous" }}
    >
      {/* The corrected sentence is the thing the learner is here to absorb —
          it reads at Body, like the bubble it corrects. */}
      <Text className="mb-1 text-[17px] font-bold leading-7 text-label">
        {splitBySpans(correction.correctedText, correction.changedSpans).map(
          (segment, index) =>
            segment.flagged ? (
              <Text key={index} className="font-bold text-tint">
                {segment.text}
              </Text>
            ) : (
              <Text key={index}>{segment.text}</Text>
            ),
        )}
      </Text>
      <Text className="mb-1.5 text-[15px] leading-6 text-secondary">
        {correction.reason}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAskMore}
        className="min-h-11 justify-center self-end active:opacity-40"
      >
        <Text className="text-sm font-semibold text-tint">더 물어보기</Text>
      </Pressable>
    </View>
  );
}
