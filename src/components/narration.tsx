import { Text, View } from "@/tw";

/**
 * Narration (내레이션) — the book's voice. Serif italic behind a hairline rule,
 * deliberately unlike the dialogue bubbles around it (brand exception).
 */
export function Narration({ text }: { text: string }) {
  return (
    <View className="border-l-2 border-separator py-0.5 pl-3">
      <Text className="font-story text-[17px] italic leading-7 text-secondary">
        {text}
      </Text>
    </View>
  );
}
