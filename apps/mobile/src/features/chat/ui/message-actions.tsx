import { Icon } from "@/shared/ui/icon";
import {
  IconRow,
  IconRowButton,
  IconRowCopyButton,
} from "@/shared/ui/icon-row";
import { chatLabels } from "./chat-labels";

/** What a finished answer offers: take it away, or ask for another one. */
export function MessageActions({
  isDisabled = false,
  isVisible = true,
  onRegenerate,
  text,
}: {
  isDisabled?: boolean;
  isVisible?: boolean;
  onRegenerate: () => void;
  /** 복사가 클립보드에 넣을 글. 복사는 아이콘 줄의 버튼이 스스로 맡는다. */
  text: string;
}) {
  return (
    <IconRow isVisible={isVisible} testID="chat-message-actions">
      <IconRowCopyButton
        isDisabled={isDisabled || !isVisible}
        label={chatLabels.copyAnswer}
        text={text}
      />
      <IconRowButton
        isDisabled={isDisabled || !isVisible}
        label={chatLabels.regenerate}
        onPress={onRegenerate}
      >
        <Icon name="regenerate" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );
}
