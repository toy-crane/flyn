import type { UIMessage } from "ai";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import type {
  CorrectionEntry,
  EpisodeCorrection,
} from "@/features/episode/api/episode-correction";
import {
  type ExpressionState,
  useCorrections,
} from "@/features/episode/state/episode-corrections";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { MarkedSentence } from "@/shared/ui/marked-text";
import { StatusLine } from "@/shared/ui/status-line";
import { correctionPresentation } from "./correction-presentation";
import { fixedMarks } from "./correction-text";
import { correctionLabels } from "./episode-labels";
import {
  ExpressionBookmark,
  ExpressionSaveFailure,
} from "./expression-bookmark";

/**
 * 카드 안의 표현 하나. 원문의 어긋난 자리, 고친 문장, 이유 한 줄.
 *
 * 표현이 하나뿐이면 문장을 통째로 놓고 달라진 자리를 짚는다. 여럿이면 문장을
 * 항목 수만큼 되풀이하는 대신 달라진 조각만 마주 놓는다. 어느 쪽이든 짚는
 * 장치는 같아서, 두 항목이 같은 규칙으로 읽힌다.
 */
function CorrectionRow({
  correction,
  entry,
  isFirst,
}: {
  correction: EpisodeCorrection;
  entry: CorrectionEntry;
  isFirst: boolean;
}) {
  const showsSentence = correction.entries.length === 1;
  const appearance = correctionPresentation(correction.original);

  return (
    <View
      className={
        isFirst ? undefined : "mt-2.5 border-separator border-t pt-2.5"
      }
      testID="correction-entry"
    >
      <MarkedSentence
        className="mb-0.5 text-muted text-sm leading-5"
        markClassName="underline"
        marks={[entry.original]}
        text={showsSentence ? correction.original : entry.original}
      />
      <MarkedSentence
        className="mb-1.5 font-semibold text-base text-foreground leading-6"
        markClassName={appearance.text}
        marks={[entry.fixed]}
        text={showsSentence ? correction.fixed : entry.fixed}
      />
      <Text className="text-muted text-sm leading-5" selectable={false}>
        {entry.why}
      </Text>
    </View>
  );
}

function CorrectionActions({ onAsk }: { onAsk: () => void }) {
  return (
    <View className="mt-3">
      <Button
        accessibilityLabel={correctionLabels.ask}
        className="w-full rounded-full bg-surface"
        labelClassName="font-semibold text-foreground text-sm"
        onPress={onAsk}
        testID="correction-ask"
        variant="outline"
      >
        {correctionLabels.ask}
      </Button>
    </View>
  );
}

/**
 * 사용자 말풍선 아래에 매달리는 배울 표현.
 *
 * 접혀 있을 때는 고친 문장 한 줄이고, 탭하면 그 자리에서 카드로 펼쳐진다.
 * 붙은 뒤에는 사라지지 않고 대화에 남는다. 자동으로 보이는 것은 여기까지이고,
 * 왜 그런지는 탭한 사람에게만 보인다.
 *
 * 펼침 상태는 이 자리가 소유한다. 시트를 열고 돌아와도 카드가 그대로 열려 있는
 * 이유이고, 목록이 이 행을 다시 만들지 않는 한 그대로 남는다.
 */
export function CorrectionNote({
  correction,
  onAsk,
}: {
  correction: EpisodeCorrection;
  onAsk: (correction: EpisodeCorrection) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // iOS 글자 크기가 바뀌면 내부 배치를 새로 만들고 펼침 상태는 유지한다.
  const { fontScale } = useWindowDimensions();
  const open = useCallback(() => setIsOpen(true), []);
  const fold = useCallback(() => setIsOpen(false), []);
  const ask = useCallback(() => onAsk(correction), [correction, onAsk]);
  const appearance = correctionPresentation(correction.original);
  const spot = useMemo(
    () => ({ kind: "learning" as const, messageId: correction.messageId }),
    [correction.messageId]
  );

  return (
    <View className="mt-1 w-full items-end">
      {isOpen ? (
        <View
          className={`max-w-[85%] self-end rounded-2xl rounded-tl-md px-3.5 py-3 ${appearance.surface}`}
          key={fontScale}
          testID="correction-card"
        >
          <View className="mb-2 flex-row items-center justify-between gap-1">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="learn" size="sm" tone={appearance.tone} />
              <Text
                className={`shrink font-semibold text-xs ${appearance.text}`}
                selectable={false}
              >
                {correction.entries.length > 1
                  ? `${appearance.title} ${correction.entries.length}개`
                  : appearance.title}
              </Text>
            </View>
            {/*
              펼친 카드의 제목 줄에도 같은 책갈피를 둔다. 접힌 한 줄과 늘 같은
              상태를 보여 주므로, 어느 쪽에서 담아도 다른 쪽이 함께 채워진다.
            */}
            <ExpressionBookmark side="right" spot={spot} />
            <Pressable
              accessibilityLabel={`${appearance.title} 접기`}
              accessibilityRole="button"
              className="-my-2 -mr-2 size-11 items-center justify-center"
              onPress={fold}
              testID="correction-fold"
            >
              <Icon name="collapse" size="sm" tone="muted" />
            </Pressable>
          </View>
          {correction.entries.map((entry, index) => (
            <CorrectionRow
              correction={correction}
              entry={entry}
              isFirst={index === 0}
              key={`${entry.pattern}:${entry.original}:${entry.fixed}`}
            />
          ))}
          <CorrectionActions onAsk={ask} />
        </View>
      ) : (
        <View className="max-w-[92%] flex-row items-end self-end">
          {/* 책갈피는 화면 가운데를 향한 쪽, 곧 오른쪽에 붙는 한 줄의 왼편에 선다. */}
          <ExpressionBookmark side="left" spot={spot} />
          <Pressable
            accessibilityLabel={`${appearance.title} 보기`}
            accessibilityRole="button"
            className={`shrink flex-row items-start gap-2 rounded-2xl rounded-tl-md px-3.5 py-2.5 ${appearance.surface}`}
            key={fontScale}
            onPress={open}
            testID="correction-line"
          >
            <View className="mt-1">
              <Icon name="learn" size="sm" tone={appearance.tone} />
            </View>
            <View className="shrink">
              <MarkedSentence
                className="text-foreground text-sm leading-5"
                markClassName={`font-semibold ${appearance.text}`}
                marks={fixedMarks(correction)}
                testID="correction-line-fixed"
                text={correction.fixed}
              />
            </View>
            <View className="mt-0.5">
              <Icon name="expand" size="sm" tone="muted" />
            </View>
          </Pressable>
        </View>
      )}
      <ExpressionSaveFailure align="end" spot={spot} />
    </View>
  );
}

/**
 * 이 메시지에 붙은 배울 표현, 붙은 것이 없으면 아무것도.
 *
 * 장면 목록은 이 자리를 메시지마다 하나씩 놓아 두기만 한다. 교정이 있는지,
 * 어떤 교정인지는 이 자리가 스스로 읽는다. 그래야 교정 하나가 도착할 때 흐르는
 * 장면과 지나간 말풍선을 함께 다시 그리지 않는다.
 */
function ExpressionStatusNote({
  state,
  onRetry,
}: {
  state: Exclude<ExpressionState, { status: "corrected" }>;
  onRetry: () => void;
}) {
  const pending = state.status === "pending";
  const retrying = pending && state.retrying;
  if (state.status === "error" || retrying) {
    return (
      <View className="mt-1 max-w-[85%] self-end">
        <StatusLine
          icon="regenerate"
          label={retrying ? correctionLabels.checking : correctionLabels.failed}
          loading={retrying}
          retry={{
            label: correctionLabels.retry,
            onPress: onRetry,
            testID: "expression-retry",
          }}
          tone={retrying ? "muted" : "danger"}
        />
      </View>
    );
  }
  const natural = state.status === "natural";
  const label = {
    natural: correctionLabels.natural,
    pending: correctionLabels.checking,
    unclear: correctionLabels.unclear,
  }[state.status];
  return (
    <View className="mt-1 max-w-[85%] self-end py-1">
      <StatusLine
        icon={natural ? "check" : undefined}
        label={label}
        loading={pending}
        tone={natural ? "success" : "muted"}
      />
    </View>
  );
}

export function EpisodeCorrectionNote({ message }: { message: UIMessage }) {
  const { ask, byMessageId, states, retry } = useCorrections();
  const correction = byMessageId[message.id];
  const state = states?.[message.id];
  const retryExpression = useCallback(
    () => retry(message.id),
    [retry, message.id]
  );
  if (message.role !== "user") {
    return null;
  }
  if (state && state.status !== "corrected") {
    return <ExpressionStatusNote onRetry={retryExpression} state={state} />;
  }
  if (!correction) {
    return null;
  }
  return <CorrectionNote correction={correction} onAsk={ask} />;
}
