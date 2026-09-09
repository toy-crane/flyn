import type { ReactNode } from "react";
import { Text, useWindowDimensions, View } from "react-native";

import { Button } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";

/** 어느 화면에서나 같은, 다시 부르는 버튼의 이름. */
const RETRY = "다시 시도하기";

/**
 * 본문이 비었을 때 그 자리에 서는 화면.
 *
 * 스토리 목록과 상세, 대화 기록과 대화, 표현 노트가 같은 것을 쓴다. 헤더는
 * 그대로 남고 이 덩어리가 본문만 대신한다. 제목과 아이콘이 무슨 일인지 말하고,
 * 아래에 할 수 있는 일이 하나 붙는다.
 */
function ScreenStatus({
  action,
  icon,
  isCentered,
  testID,
  title,
}: {
  action?: ReactNode;
  icon: IconName;
  isCentered: boolean;
  testID: string;
  title: string;
}) {
  return (
    <View
      className={`items-center gap-3 px-6 ${
        isCentered ? "grow justify-center pb-9" : "py-12"
      }`}
      testID={testID}
    >
      <Icon name={icon} size="lg" tone="muted" />
      <Text
        accessibilityRole="header"
        className="text-center font-bold text-foreground text-lg leading-7"
      >
        {title}
      </Text>
      {action}
    </View>
  );
}

/**
 * 읽어 오지 못했을 때. 다시 시도할 수 있어야 한다.
 *
 * 비어 있는 것과 읽지 못한 것은 다른 일이다. 재시도 버튼이 그 둘을 가르는
 * 표시이기도 하다.
 *
 * 목록 위에 서는 화면은 본문 위쪽에, 목록 하나가 화면 전부인 곳은 정중앙에
 * 세운다. 자리만 다르고 아이콘과 제목, 버튼은 그대로다.
 */
export function ScreenUnavailable({
  isCentered = false,
  isRetrying,
  onRetry,
  testID,
  title,
}: {
  isCentered?: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  testID: string;
  title: string;
}) {
  return (
    <ScreenStatus
      action={
        <Button
          accessibilityLabel={RETRY}
          isPending={isRetrying}
          onPress={onRetry}
          variant="secondary"
        >
          {RETRY}
        </Button>
      }
      icon="offline"
      isCentered={isCentered}
      testID={testID}
      title={title}
    />
  );
}

/**
 * 읽기는 됐는데 보여 줄 것이 없을 때.
 *
 * 재시도를 붙이지 않는다. 다시 물어도 같은 답이 오고, 그 버튼이 이 화면을 실패로
 * 보이게 한다. 대신 여기서 할 수 있는 일로 안내한다. 할 일이 없는 자리는
 * 아이콘과 한 줄로 끝난다.
 */
export function ScreenEmpty({
  action,
  icon = "noConversation",
  testID,
  title,
}: {
  action?: ReactNode;
  icon?: IconName;
  testID: string;
  title: string;
}) {
  const { fontScale } = useWindowDimensions();

  return (
    <View
      className="grow items-center justify-center gap-4 px-6 py-9"
      testID={testID}
    >
      <Icon name={icon} size="lg" tone="muted" />
      <Text
        className="text-center font-normal text-[17px] text-muted leading-[26px]"
        dynamicTypeRamp="body"
      >
        {title}
      </Text>
      {/* 글자 크기가 바뀌면 버튼의 이전 측정값도 버리고 다시 배치한다. */}
      {action ? (
        <View className="mt-2 max-w-full" key={fontScale}>
          {action}
        </View>
      ) : null}
    </View>
  );
}
