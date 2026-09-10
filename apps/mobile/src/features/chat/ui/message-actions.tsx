import { setStringAsync } from "expo-clipboard";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Icon } from "@/shared/ui/icon";
import { chatLabels } from "./chat-labels";

/**
 * The buttons are `size-7` and sit against each other, so a `size-4` icon
 * leaves the drawn shapes `size-3` apart and the row reads as one group. That
 * is closer than two 44px press targets could sit without overlapping, so the
 * drawn box is the whole target across and `hitSlop` only reaches up and down,
 * where the row has no neighbour to take the touch from. It is the one measure
 * here that cannot be a class, since `hitSlop` takes a number.
 */
const ACTION_VERTICAL_HIT_SLOP = 6;

/** 클립보드에 넣는다. 성공도 알리지 않으므로 실패도 화면을 바꾸지 않는다. */
export function copyToClipboard(text: string) {
  setStringAsync(text).catch(() => {
    // Nothing is announced on success either, so a refused clipboard leaves
    // the same screen behind and the person can try again.
  });
}

/**
 * 메시지 아래 아이콘 줄에 서는 버튼 하나.
 *
 * 안에 담는 표시는 16px 아이콘이나 같은 자리의 진행 표시다. 버튼의 크기는 그
 * 표시와 상관없이 28px로 붙박여 있어서, 아이콘이 바뀌어도 줄이 움직이지 않는다.
 */
export function MessageActionButton({
  children,
  isBusy = false,
  isDisabled = false,
  isSelected,
  label,
  onPress,
  testID,
}: {
  children: ReactNode;
  /** 이 버튼이 시작한 일이 아직 끝나지 않았다. 흐리게 하지 않고 다시 눌리지만 막는다. */
  isBusy?: boolean;
  isDisabled?: boolean;
  /** 켜고 끄는 동작이라면 지금 켜져 있는지. 화면 읽기가 그대로 읽는다. */
  isSelected?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const blocked = isBusy || isDisabled;

  return (
    // The library's own pressable: it answers a touch with a scale, and adds
    // the highlight iOS expects and the ripple Android expects.
    <PressableFeedback
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{
        busy: isBusy,
        disabled: blocked,
        selected: isSelected,
      }}
      className={
        // 진행 표시는 흐리게 두지 않는다. 회색 표시를 40%까지 낮추면 도는지조차
        // 보이지 않아서, 기다리는 중임을 알리려던 표시가 사라진다.
        isDisabled && !isBusy
          ? "size-7 items-center justify-center rounded-full opacity-40"
          : "size-7 items-center justify-center rounded-full"
      }
      hitSlop={{
        bottom: ACTION_VERTICAL_HIT_SLOP,
        top: ACTION_VERTICAL_HIT_SLOP,
      }}
      isDisabled={blocked}
      onPress={onPress}
      testID={testID}
    >
      <PressableFeedback.Highlight />
      <PressableFeedback.Ripple />
      {children}
    </PressableFeedback>
  );
}

/**
 * 메시지 아래에 붙는 아이콘 줄.
 *
 * 어느 쪽에 붙는지는 매달린 메시지의 정렬을 따른다. 음수 여백이 바깥쪽 아이콘의
 * 그려진 모양을, 그 아이콘을 감싼 여백이 아니라, 위 메시지의 가장자리에 맞춘다.
 */
export function MessageActionRow({
  align = "start",
  children,
  isVisible = true,
  testID,
}: {
  align?: "start" | "end";
  children: ReactNode;
  isVisible?: boolean;
  testID?: string;
}) {
  return (
    <View
      accessibilityElementsHidden={!isVisible}
      className={
        align === "end"
          ? "mt-1.5 -mr-1.5 flex-row self-end"
          : "mt-1.5 -ml-1.5 flex-row self-start"
      }
      importantForAccessibility={isVisible ? "auto" : "no-hide-descendants"}
      pointerEvents={isVisible ? "auto" : "none"}
      style={{ opacity: isVisible ? 1 : 0 }}
      testID={testID}
    >
      {children}
    </View>
  );
}

/** What a finished answer offers: take it away, or ask for another one. */
export function MessageActions({
  isDisabled = false,
  isVisible = true,
  onCopy,
  onRegenerate,
}: {
  isDisabled?: boolean;
  isVisible?: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  return (
    <MessageActionRow isVisible={isVisible} testID="chat-message-actions">
      <MessageActionButton
        isDisabled={isDisabled || !isVisible}
        label={chatLabels.copyAnswer}
        onPress={onCopy}
      >
        <Icon name="copy" size="sm" tone="muted" />
      </MessageActionButton>
      <MessageActionButton
        isDisabled={isDisabled || !isVisible}
        label={chatLabels.regenerate}
        onPress={onRegenerate}
      >
        <Icon name="regenerate" size="sm" tone="muted" />
      </MessageActionButton>
    </MessageActionRow>
  );
}
