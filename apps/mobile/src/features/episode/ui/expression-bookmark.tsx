import { type ReactNode, useCallback, useMemo } from "react";
import { View } from "react-native";

import {
  copyToClipboard,
  MessageActionButton,
  MessageActionRow,
} from "@/features/chat/ui/message-actions";
import type { SavedExpressionSpot } from "@/features/episode/api/saved-expression";
import { spotKey } from "@/features/episode/api/saved-expression";
import { useSavedExpressions } from "@/features/episode/state/saved-expressions";
import { Icon } from "@/shared/ui/icon";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { StatusLine } from "@/shared/ui/status-line";
import { episodeLabels, savedExpressionLabels } from "./episode-labels";

/**
 * 메시지 아래 아이콘 줄에 서는 책갈피.
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
  spot: SavedExpressionSpot;
}) {
  const { states, toggle } = useSavedExpressions();
  const state = states[spotKey(spot)];
  const press = useCallback(() => toggle(spot), [spot, toggle]);
  const isSaved = state?.status === "saved" || state?.status === "erasing";
  const isBusy = state?.status === "saving" || state?.status === "erasing";

  return (
    <MessageActionButton
      isBusy={isBusy}
      isDisabled={isWaitingForMessage}
      isSelected={isSaved}
      label={
        isSaved ? savedExpressionLabels.unsave : savedExpressionLabels.save
      }
      onPress={press}
      testID="expression-bookmark"
    >
      {isBusy ? (
        // 이 줄의 아이콘과 같은 16px로 돈다. 버튼이 28px로 붙박여 있어서 글자
        // 크기를 따라 자라지 않고, 아이콘이 있던 자리에 그대로 들어선다.
        <LoadingSpinner sizeRole="compactControl" />
      ) : (
        <Icon
          filled={isSaved}
          name="bookmark"
          size="sm"
          tone={isSaved ? "accent" : "muted"}
        />
      )}
    </MessageActionButton>
  );
}

/** 아이콘 줄에서 그 메시지의 글을 그대로 클립보드에 넣는 버튼. */
function ExpressionCopy({
  isDisabled = false,
  label,
  text,
}: {
  isDisabled?: boolean;
  label: string;
  text: string;
}) {
  const copy = useCallback(() => copyToClipboard(text), [text]);

  return (
    <MessageActionButton isDisabled={isDisabled} label={label} onPress={copy}>
      <Icon name="copy" size="sm" tone="muted" />
    </MessageActionButton>
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
 * 인물 말풍선 하나를 감싸 아이콘 줄과 실패 줄을 붙이는 자리.
 *
 * 줄은 말풍선 아래 왼쪽, 곧 말풍선이 붙은 쪽에 선다. 채팅 앱이 메시지에 걸리는
 * 동작을 두는 자리이고, `AI에게 물어보기`의 답변 아래 줄과 같은 모양이다.
 * 실패 줄은 그 아래에 같은 정렬로 붙는다.
 */
export function UtteranceExpressionSlot({
  at,
  children,
  isArriving,
  messageId,
  text,
}: {
  at: number;
  children: ReactNode;
  isArriving: boolean;
  messageId: string;
  text: string;
}) {
  const spot = useMemo(
    () => ({ kind: "utterance" as const, messageId, utteranceAt: at }),
    [at, messageId]
  );

  return (
    <View className="w-full items-start">
      {children}
      <MessageActionRow testID="utterance-actions">
        {/*
          흐르는 동안은 복사도 함께 기다린다. 넘어온 글이 아직 자라는 중이라
          지금 누르면 문장의 앞부분만 담긴다.
        */}
        <ExpressionCopy
          isDisabled={isArriving}
          label={episodeLabels.copyUtterance}
          text={text}
        />
        <ExpressionBookmark isWaitingForMessage={isArriving} spot={spot} />
      </MessageActionRow>
      <ExpressionSaveFailure align="start" spot={spot} />
    </View>
  );
}

/**
 * 배울 표현 아래에 서는 아이콘 줄.
 *
 * 접힌 한 줄이든 펼친 카드든 그 아래 같은 자리에 선다. 오른쪽에 붙는 표현을
 * 따라 줄도 오른쪽 끝에 맞춘다. 복사는 모든 수정을 반영한 고친 문장을 담는다.
 */
export function LearningExpressionActions({
  spot,
  text,
}: {
  spot: SavedExpressionSpot;
  text: string;
}) {
  return (
    <MessageActionRow align="end" testID="learning-actions">
      <ExpressionCopy label={episodeLabels.copyExpression} text={text} />
      <ExpressionBookmark spot={spot} />
    </MessageActionRow>
  );
}
