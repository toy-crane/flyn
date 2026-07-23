import type { ReactNode } from "react";

import { Pressable, Text, View } from "@/tw";
import type { TextSpan } from "@/types/correction";
import { splitBySpans } from "@/utils/text-spans";

/**
 * Alignment and tail carry the speaker — bubbles never wear a name label.
 * The AI sits left in gray, the learner right in accent blue.
 */
export function AiBubble({ text }: { text: string }) {
  return (
    <View className="max-w-[80%] self-start rounded-bubble rounded-bl-[4px] bg-fill px-3.5 py-2.5">
      <Text className="text-[15px] leading-6 text-foreground">{text}</Text>
    </View>
  );
}

type LearnerBubbleProps = {
  text: string;
  /** Ranges of `text` the AI flagged — wavy underline only, to stay immersive. */
  errorSpans?: TextSpan[];
  onPress?: () => void;
  /** The correction panel, rendered under the bubble when expanded. */
  children?: ReactNode;
};

export function LearnerBubble({
  text,
  errorSpans = [],
  onPress,
  children,
}: LearnerBubbleProps) {
  return (
    <View className="max-w-[80%] self-end items-end">
      <Pressable
        accessibilityRole={errorSpans.length > 0 ? "button" : "text"}
        onPress={errorSpans.length > 0 ? onPress : undefined}
        className="self-end rounded-bubble rounded-br-[4px] bg-accent px-3.5 py-2.5"
      >
        <Text className="text-[15px] leading-6 text-white">
          {splitBySpans(text, errorSpans).map((segment, index) =>
            segment.flagged ? (
              <Text
                key={index}
                className="text-white"
                style={{
                  textDecorationLine: "underline",
                  textDecorationStyle: "dotted",
                }}
              >
                {segment.text}
              </Text>
            ) : (
              <Text key={index}>{segment.text}</Text>
            ),
          )}
        </Text>
      </Pressable>
      {children}
    </View>
  );
}
