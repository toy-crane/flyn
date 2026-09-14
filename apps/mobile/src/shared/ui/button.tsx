import {
  type ButtonRootProps,
  type ButtonVariant,
  Button as HeroButton,
} from "heroui-native/button";
import type { ThemeColor } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import { type ReactNode, useCallback, useRef } from "react";
import {
  type LayoutChangeEvent,
  type PressableStateCallbackType,
  View,
} from "react-native";

import { LoadingSpinner } from "./loading-spinner";

type OmitButtonState<T> = T extends ButtonRootProps
  ? Omit<T, "children" | "isDisabled" | "onLayout">
  : never;

export type ButtonProps = OmitButtonState<ButtonRootProps> & {
  children: ReactNode;
  isDisabled?: boolean;
  isPending?: boolean;
  labelClassName?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  startContent?: ReactNode;
};

const SPINNER_COLOR: Record<ButtonVariant, ThemeColor> = {
  danger: "danger-foreground",
  "danger-soft": "danger-soft-foreground",
  ghost: "default-foreground",
  outline: "default-foreground",
  primary: "accent-foreground",
  secondary: "accent-soft-foreground",
  tertiary: "default-foreground",
};

/**
 * The app's general React Native button.
 *
 * Pending is a state of the same action: the label and box stay in place while
 * the leading content becomes a spinner. Width remains a layout decision for
 * the parent or call site.
 *
 * Size, padding and the gap between the leading content and the label are
 * HeroUI's. The one change to them, a minimum height instead of a fixed one so
 * the label can grow with the system text size, lives once in `global.css`.
 */
export function Button({
  accessibilityState,
  children,
  className,
  isDisabled = false,
  isPending = false,
  labelClassName,
  onLayout,
  size = "md",
  startContent,
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  const effectiveDisabled = isDisabled || isPending;
  const idleSize = useRef<
    { height: number; width: number; label: ReactNode } | undefined
  >(undefined);
  const idleLabelWidth = useRef<
    { label: ReactNode; width: number } | undefined
  >(undefined);
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!isPending) {
        const { height, width } = event.nativeEvent.layout;

        idleSize.current = { height, label: children, width };
      }
      onLayout?.(event);
    },
    [children, isPending, onLayout]
  );
  const handleLabelLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!isPending) {
        idleLabelWidth.current = {
          label: children,
          width: event.nativeEvent.layout.width,
        };
      }
    },
    [children, isPending]
  );
  // 단계별 문구가 바뀌는 스토리 만들기는 새 문구에 맞춰 높이를 다시 잰다.
  const measured = idleSize.current;
  const pendingSize =
    isPending && measured && measured.label === children
      ? { height: measured.height, width: measured.width }
      : undefined;
  /*
    진행 표시가 줄에 들어오면 같은 폭 안에서 문구가 그만큼 좁아진다. 내용 너비
    버튼(화면 상태의 다시 시도하기)은 그대로 두면 문구가 두 줄로 꺾이고 고정한
    높이에 잘린다. 문구를 원래 폭에 두면 줄이 버튼의 좌우 여백 쪽으로 고르게
    넘치므로 버튼 크기와 문구가 함께 유지된다.
  */
  const measuredLabel = idleLabelWidth.current;
  const pendingLabelStyle =
    pendingSize !== undefined &&
    measuredLabel !== undefined &&
    measuredLabel.label === children
      ? { flexShrink: 0, width: measuredLabel.width }
      : undefined;
  const resolvedStyle =
    typeof style === "function"
      ? (state: PressableStateCallbackType) => [style(state), pendingSize]
      : [style, pendingSize];
  const leadingContent = isPending ? (
    <LoadingSpinner color={SPINNER_COLOR[variant]} />
  ) : (
    startContent
  );

  return (
    <HeroButton
      {...props}
      accessibilityState={{
        ...accessibilityState,
        busy: isPending,
        disabled: effectiveDisabled,
      }}
      className={className}
      isDisabled={effectiveDisabled}
      onLayout={handleLayout}
      size={size}
      style={resolvedStyle}
      variant={variant}
    >
      {/*
        The root is already a centred row with a size-specific gap, so the
        leading content is simply the item before the label. It is left out
        entirely when there is nothing to show: an empty item still takes the
        gap and pushes the label off centre.
      */}
      {leadingContent ? (
        <View
          accessibilityElementsHidden
          className="items-center justify-center"
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          testID="button-leading-content"
        >
          {leadingContent}
        </View>
      ) : null}
      <HeroButton.Label
        className={cn("shrink text-center", labelClassName)}
        onLayout={handleLabelLayout}
        style={pendingLabelStyle}
      >
        {children}
      </HeroButton.Label>
    </HeroButton>
  );
}
