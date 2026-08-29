import type { UIMessage } from "ai";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type {
  CorrectionEntry,
  EpisodeCorrection,
} from "@/features/episode/api/episode-correction";
import { useCorrections } from "@/features/episode/state/episode-corrections";
import { Icon } from "@/shared/ui/icon";
import { fixedMarks, markedParts } from "./correction-text";
import { correctionLabels } from "./episode-labels";

/**
 * 강조할 자리를 짚은 문장.
 *
 * 강조는 굵기가 아니라 색으로 준다. 고친 문장에서 어디가 달라졌는지가 교정
 * 채널의 보라로 바로 읽히고, 문장은 그대로 한 줄로 이어진다.
 */
function MarkedSentence({
  className,
  marks,
  markClassName,
  testID,
  text,
}: {
  className: string;
  markClassName: string;
  marks: readonly string[];
  testID?: string;
  text: string;
}) {
  return (
    <Text className={className} selectable={false} testID={testID}>
      {markedParts(text, marks).map((part) =>
        part.isMarked ? (
          <Text className={markClassName} key={part.at}>
            {part.text}
          </Text>
        ) : (
          part.text
        )
      )}
    </Text>
  );
}

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
        markClassName="text-learn"
        marks={[entry.fixed]}
        text={showsSentence ? correction.fixed : entry.fixed}
      />
      <Text className="text-muted text-sm leading-5" selectable={false}>
        {entry.why}
      </Text>
    </View>
  );
}

/** 카드 아래의 두 버튼. 하나는 대화로 돌아가고, 하나는 한국어로 묻는다. */
function CorrectionActions({
  onAsk,
  onResend,
}: {
  onAsk: () => void;
  onResend: () => void;
}) {
  return (
    <View className="mt-3 flex-row gap-2">
      <Pressable
        accessibilityLabel={correctionLabels.resend}
        accessibilityRole="button"
        className="min-h-10 flex-1 items-center justify-center rounded-full bg-learn px-3"
        onPress={onResend}
        testID="correction-resend"
      >
        <Text className="font-semibold text-learn-foreground text-sm">
          {correctionLabels.resend}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={correctionLabels.ask}
        accessibilityRole="button"
        className="min-h-10 flex-1 items-center justify-center rounded-full border border-border bg-surface px-3"
        onPress={onAsk}
        testID="correction-ask"
      >
        <Text className="font-semibold text-foreground text-sm">
          {correctionLabels.ask}
        </Text>
      </Pressable>
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
  isResent,
  onAsk,
  onResend,
}: {
  correction: EpisodeCorrection;
  isResent: boolean;
  onAsk: (correction: EpisodeCorrection) => void;
  onResend: (correction: EpisodeCorrection) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const fold = useCallback(() => setIsOpen(false), []);
  const ask = useCallback(() => onAsk(correction), [correction, onAsk]);
  // 고친 문장을 입력창으로 보내고 나면 카드가 할 일은 끝났다. 한 줄로 접혀
  // 입력창 앞을 비운다.
  const resend = useCallback(() => {
    setIsOpen(false);
    onResend(correction);
  }, [correction, onResend]);

  if (!isOpen) {
    return (
      <Pressable
        accessibilityLabel={correctionLabels.open}
        accessibilityRole="button"
        className="mt-1 max-w-[85%] flex-row items-start gap-2 self-end rounded-2xl rounded-tl-md bg-learn-surface px-3.5 py-2.5"
        onPress={open}
        testID="correction-line"
      >
        <View className="mt-1">
          <Icon name="learn" size="sm" tone="learn" />
        </View>
        <View className="flex-1">
          <MarkedSentence
            className="text-foreground text-sm leading-5"
            markClassName="font-semibold text-learn"
            marks={fixedMarks(correction)}
            testID="correction-line-fixed"
            text={correction.fixed}
          />
          {isResent ? (
            <Text
              className="mt-1 text-muted text-xs"
              selectable={false}
              testID="correction-resent"
            >
              ✓ {correctionLabels.resent}
            </Text>
          ) : null}
        </View>
        <View className="mt-0.5">
          <Icon name="expand" size="sm" tone="muted" />
        </View>
      </Pressable>
    );
  }

  return (
    <View
      className="mt-1 max-w-[85%] self-end rounded-2xl rounded-tl-md bg-learn-surface px-3.5 py-3"
      testID="correction-card"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Icon name="learn" size="sm" tone="learn" />
          <Text className="font-semibold text-learn text-xs" selectable={false}>
            {correction.entries.length > 1
              ? correctionLabels.labelCount(correction.entries.length)
              : correctionLabels.label}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={correctionLabels.fold}
          accessibilityRole="button"
          hitSlop={8}
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
          key={entry.pattern}
        />
      ))}
      <CorrectionActions onAsk={ask} onResend={resend} />
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
export function EpisodeCorrectionNote({ message }: { message: UIMessage }) {
  const { ask, byMessageId, resend, resent } = useCorrections();
  const correction = byMessageId[message.id];

  if (message.role !== "user" || !correction) {
    return null;
  }

  return (
    <CorrectionNote
      correction={correction}
      isResent={resent[message.id] === true}
      onAsk={ask}
      onResend={resend}
    />
  );
}
