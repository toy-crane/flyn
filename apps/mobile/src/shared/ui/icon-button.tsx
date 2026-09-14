import {
  PressableFeedback,
  type PressableFeedbackProps,
} from "heroui-native/pressable-feedback";
import { cn } from "heroui-native/utils";
import type { ReactNode } from "react";

/**
 * 원 크기. HeroUI `Button`의 가장 작은 크기가 40pt 고정이라 채팅 컨트롤의
 * 두 크기를 만들 수 없어 이 컴포넌트가 둘을 더한다. `sm`은 수정 그만두기의
 * 28pt, `lg`는 입력창의 보내기·중지와 최신 메시지의 44pt다.
 */
const SIZE_CLASS_NAME = {
  lg: "size-11",
  sm: "size-7",
} as const;

export type IconButtonProps = Omit<
  PressableFeedbackProps,
  "accessibilityLabel" | "children" | "isDisabled"
> & {
  accessibilityLabel: string;
  children: ReactNode;
  isDisabled?: boolean;
  size: keyof typeof SIZE_CLASS_NAME;
};

/**
 * 아이콘만 담은 버튼.
 *
 * 누르는 반응은 HeroUI `PressableFeedback`의 축소 하나다. 하이라이트와 물결은
 * 자식으로 따로 넣어야 생기므로 여기서는 넣지 않는다. `PressableFeedback`에는
 * 비활성 표현이 없어서 HeroUI의 `element-disabled` 유틸리티로 흐리게 한다.
 * 모양(원, 배경색)은 버튼을 두는 자리가 `className`으로 정한다.
 */
export function IconButton({
  accessibilityLabel,
  accessibilityState,
  children,
  className,
  isDisabled = false,
  size,
  ...props
}: IconButtonProps) {
  return (
    <PressableFeedback
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      className={cn(
        SIZE_CLASS_NAME[size],
        "items-center justify-center",
        isDisabled && "element-disabled",
        className
      )}
      isDisabled={isDisabled}
    >
      {children}
    </PressableFeedback>
  );
}
