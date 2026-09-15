import { ListGroup } from "heroui-native/list-group";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import type { ReactNode } from "react";

/**
 * 누르는 목록 행.
 *
 * HeroUI 문서의 패턴대로 `PressableFeedback`이 행을 감싸 누름과 축소 반응을 맡고,
 * 안의 `ListGroup.Item`은 비활성으로 둬 손가락을 가로채지 않게 한다. 화면 읽기에는
 * 감싼 쪽 하나만 버튼으로 읽힌다. 안쪽 행까지 접근성 요소로 두면 Android가 같은
 * 행을 비활성 요소로 한 번 더 읽는다.
 */
export function PressableListRow({
  accessibilityLabel,
  children,
  className,
  onPress,
  testID,
}: {
  /** 행의 제목과 설명을 이은 이름. */
  accessibilityLabel: string;
  /** `ListGroup.ItemPrefix`, `ItemContent`, `ItemSuffix`. */
  children: ReactNode;
  /** 현재 화처럼 의미 있는 상태의 배경만 바꾼다. */
  className?: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <PressableFeedback
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
    >
      <ListGroup.Item accessible={false} className={className} disabled>
        {children}
      </ListGroup.Item>
    </PressableFeedback>
  );
}

/**
 * 누르지 않는 목록 행.
 *
 * `ListGroup.Item`은 `Pressable`이라 그대로 두면 누를 수 있는 자리로 잡힌다.
 * 비활성으로 두되 접근성 요소에서 빼서, 화면 읽기가 비활성 버튼이 아니라 안의
 * 글을 읽게 한다.
 */
export function StaticListRow({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <ListGroup.Item accessible={false} disabled testID={testID}>
      {children}
    </ListGroup.Item>
  );
}
