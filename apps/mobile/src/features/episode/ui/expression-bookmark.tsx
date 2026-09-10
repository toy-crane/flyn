import { type ReactNode, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

import type { SavedExpressionSpot } from "@/features/episode/api/saved-expression";
import { spotKey } from "@/features/episode/api/saved-expression";
import { useSavedExpressions } from "@/features/episode/state/saved-expressions";
import { Icon } from "@/shared/ui/icon";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { useProgressMetrics } from "@/shared/ui/progress-metrics";
import { StatusLine } from "@/shared/ui/status-line";
import { savedExpressionLabels } from "./episode-labels";

/**
 * 아이콘과 진행 표시가 함께 서는 자리. 둘이 바뀌어도 기준점이 움직이지 않는다.
 *
 * 기본 글자에서는 16이고, 글자가 커지면 진행 표시를 따라 함께 커진다. 시스템
 * 진행 표시는 글자 크기를 따라 자라는데 자리만 붙박아 두면 큰 접근성 글자에서
 * 표시가 자리를 뚫고 나온다. 아이콘도 같은 비율로 키워 두 상태의 표시 영역이
 * 언제나 같게 둔다. 보조 문구 옆의 표시가 쓰는 방식과 같다.
 */
const MARK_SIZE = 16;
/**
 * 보이는 아이콘은 작게 두고 누를 수 있는 영역은 44를 지킨다.
 *
 * 음수 여백이 그 차이를 도로 걷어내, 좁은 화면에서 말풍선이 아이콘의 터치
 * 영역만큼 좁아지지 않게 한다.
 */
const TOUCH_SIZE = 44;
/** 아이콘 옆에 남기는 가로와 세로 여백. 음수 여백에서 그만큼 덜 걷어낸다. */
const SIDE_GAP = 3;
const BOTTOM_GAP = 5;
/** 아직 담을 수 없는 자리. 앱의 다른 비활성 컨트롤과 같은 흐리기를 쓴다. */
const WAITING_OPACITY = 0.4;

/**
 * 말풍선과 한 줄 옆에 서는 책갈피.
 *
 * 탭하면 담기고 다시 탭하면 도로 놓인다. 담기 전에는 회색 외곽선, 담은 뒤에는
 * 채워진 강조색이다. 담는 동안에는 같은 자리에 진행 표시를 두고 다시 눌리지
 * 않게 한다. 인물 대사는 서버가 한국어 뜻을 만드느라 곧바로 끝나지 않는다.
 *
 * 자기 자리의 상태만 읽는다. 그래서 책갈피 하나를 눌러도 흐르는 장면과 지나간
 * 말풍선이 함께 다시 그려지지 않는다.
 */
export function ExpressionBookmark({
  isWaitingForMessage = false,
  side,
  spot,
}: {
  /**
   * 매달린 메시지가 아직 계정에 없다. 자리는 지키되 누를 수는 없다.
   *
   * 장면이 흐르는 동안이 그렇다. 말풍선은 다 그려져 있는데 서버는 장면이 끝나야
   * 그 메시지를 저장하므로, 이때 누르면 없는 자리를 가리켜 실패한다. 자리까지
   * 비우면 책갈피가 나타났다 사라지는 것처럼 보여서, 흐릿하게 두고 기다린다.
   */
  isWaitingForMessage?: boolean;
  /** 말풍선의 어느 쪽에 서는지. 바깥 여백을 그 반대쪽으로 접는다. */
  side: "left" | "right";
  spot: SavedExpressionSpot;
}) {
  const { states, toggle } = useSavedExpressions();
  const state = states[spotKey(spot)];
  const press = useCallback(() => toggle(spot), [spot, toggle]);
  const isSaved = state?.status === "saved" || state?.status === "erasing";
  const isBusy = state?.status === "saving" || state?.status === "erasing";
  const { indicator } = useProgressMetrics("supporting");
  const mark = Math.max(MARK_SIZE, indicator);
  const touch = Math.max(TOUCH_SIZE, mark);
  const folded = (touch - mark) / 2;

  return (
    <Pressable
      accessibilityLabel={
        isSaved ? savedExpressionLabels.unsave : savedExpressionLabels.save
      }
      accessibilityRole="button"
      accessibilityState={{
        busy: isBusy,
        disabled: isBusy || isWaitingForMessage,
        selected: isSaved,
      }}
      disabled={isBusy || isWaitingForMessage}
      onPress={press}
      style={{
        alignItems: "center",
        height: touch,
        justifyContent: "center",
        marginBottom: -(folded - BOTTOM_GAP),
        marginLeft: side === "right" ? -(folded - SIDE_GAP) : -folded,
        marginRight: side === "right" ? -folded : -(folded - SIDE_GAP),
        marginTop: -folded,
        opacity: isWaitingForMessage ? WAITING_OPACITY : 1,
        width: touch,
        /*
          음수 여백이 걷어낸 만큼은 옆 컨트롤의 자리와 겹친다. 나중에 그려지는
          쪽이 그 겹침을 가져가므로, 접힌 한 줄에서는 오른쪽 11pt를 눌러도 담기지
          않고 카드가 펼쳐졌다. 이 자리를 위로 올려 책갈피가 자기 44pt를 온전히
          받는다.
        */
        zIndex: 1,
      }}
      testID="expression-bookmark"
    >
      <View
        style={{
          alignItems: "center",
          height: mark,
          justifyContent: "center",
          width: mark,
        }}
      >
        {isBusy ? (
          <LoadingSpinner sizeRole="supporting" />
        ) : (
          <View style={{ transform: [{ scale: mark / MARK_SIZE }] }}>
            <Icon
              filled={isSaved}
              name="bookmark"
              size="sm"
              tone={isSaved ? "accent" : "muted"}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

/**
 * 담지 못했을 때 그 자리에 남는 한 줄.
 *
 * 사라지는 알림 대신 실패한 자리에 남는다. 새로고침을 누르면 그 표현만 다시
 * 담는다. 이 줄이 어느 쪽으로 붙는지는 매달린 말풍선이 정하므로, 정렬은 이
 * 자리를 놓는 쪽이 소유한다.
 */
export function ExpressionSaveFailure({
  align,
  spot,
}: {
  /** 매달린 말풍선이나 한 줄이 붙는 쪽. 이 줄도 그 정렬을 따라간다. */
  align: "start" | "end";
  spot: SavedExpressionSpot;
}) {
  const { states, toggle } = useSavedExpressions();
  const state = states[spotKey(spot)];
  const retry = useCallback(() => toggle(spot), [spot, toggle]);

  if (state?.status !== "error") {
    return null;
  }

  return (
    <View
      className={`mt-1 max-w-[85%] ${align === "end" ? "self-end" : "self-start"}`}
    >
      <StatusLine
        icon="regenerate"
        label={savedExpressionLabels.saveFailed}
        retry={{
          label: savedExpressionLabels.saveRetry,
          onPress: retry,
          testID: "expression-save-retry",
        }}
        testID="expression-save-failed"
        tone="danger"
      />
    </View>
  );
}

/**
 * 인물 말풍선 하나를 감싸 책갈피와 실패 줄을 붙이는 자리.
 *
 * 책갈피는 말풍선 오른쪽 옆, 곧 화면 가운데를 향한 쪽에 서고 세로는 말풍선 아래
 * 끝에 맞는다. 실패 줄은 말풍선의 정렬을 따라 그 아래 왼쪽에 붙는다. 기존 교정
 * 실패 줄이 사용자 말풍선 아래 오른쪽에 붙는 것과 같은 규칙이다.
 */
export function UtteranceExpressionSlot({
  at,
  children,
  isArriving,
  messageId,
}: {
  at: number;
  children: ReactNode;
  isArriving: boolean;
  messageId: string;
}) {
  const spot = useMemo(
    () => ({ kind: "utterance" as const, messageId, utteranceAt: at }),
    [at, messageId]
  );

  return (
    <View className="w-full items-start">
      <View className="w-full flex-row items-end">
        {children}
        <ExpressionBookmark
          isWaitingForMessage={isArriving}
          side="right"
          spot={spot}
        />
      </View>
      <ExpressionSaveFailure align="start" spot={spot} />
    </View>
  );
}
