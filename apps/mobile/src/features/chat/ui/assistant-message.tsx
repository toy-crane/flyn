import { View } from "react-native";

import { MarkdownAnswer } from "./markdown-answer";
import { MessageActions } from "./message-actions";

/**
 * An answer, and the row of things to do with it once it is finished.
 *
 * The body is Markdown from the first character on, so what arrives half
 * written still reads as an answer rather than as its own source. No menu is
 * attached here: selection belongs to the renderer, which is also what leaves
 * a long press to the system.
 */
export function AssistantMessage({
  areActionsDisabled,
  areActionsVisible = true,
  hasActions,
  onRegenerate,
  text,
}: {
  areActionsDisabled: boolean;
  areActionsVisible?: boolean;
  hasActions: boolean;
  onRegenerate: () => void;
  text: string;
}) {
  return (
    <View className="w-full">
      <MarkdownAnswer markdown={text} testID="chat-message-assistant" />
      {hasActions ? (
        <MessageActions
          isDisabled={areActionsDisabled}
          isVisible={areActionsVisible}
          onRegenerate={onRegenerate}
          text={text}
        />
      ) : null}
    </View>
  );
}
