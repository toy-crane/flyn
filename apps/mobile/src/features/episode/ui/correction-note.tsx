import type { UIMessage } from "ai";
import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type {
  CorrectionEntry,
  EpisodeCorrection,
} from "@/features/episode/api/episode-correction";
import {
  type ExpressionState,
  useCorrections,
} from "@/features/episode/state/episode-corrections";
import { Icon } from "@/shared/ui/icon";
import { MarkedSentence } from "@/shared/ui/marked-text";
import { StatusLine } from "@/shared/ui/status-line";
import { useReduceMotion } from "@/shared/ui/use-reduce-motion";
import { correctionPresentation } from "./correction-presentation";
import { fixedMarks } from "./correction-text";
import { correctionLabels } from "./episode-labels";
import {
  ExpressionSaveFailure,
  LearningExpressionActions,
} from "./expression-bookmark";

const reveal = FadeIn.duration(240).reduceMotion(ReduceMotion.System);
const conceal = FadeOut.duration(180).reduceMotion(ReduceMotion.System);
const resize = LinearTransition.duration(480).reduceMotion(ReduceMotion.System);

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
        className="mb-0.5"
        color="muted"
        markClassName="underline"
        marks={[entry.original]}
        text={showsSentence ? correction.original : entry.original}
        type="body-sm"
      />
      <MarkedSentence
        className="mb-1.5"
        markClassName={appearance.text}
        marks={[entry.fixed]}
        text={showsSentence ? correction.fixed : entry.fixed}
        type="h6"
      />
      <Typography.Paragraph color="muted" selectable={false} type="body-sm">
        {entry.why}
      </Typography.Paragraph>
    </View>
  );
}

function CorrectionActions({ onAsk }: { onAsk: () => void }) {
  return (
    <View className="mt-3 items-end">
      <LinkButton
        accessibilityLabel={correctionLabels.ask}
        className="min-h-11 gap-0.5 self-end"
        onPress={onAsk}
        size="sm"
        testID="correction-ask"
      >
        <LinkButton.Label className="text-accent">
          {correctionLabels.ask}
        </LinkButton.Label>
        <Icon name="forward" size="xs" tone="accent" />
      </LinkButton>
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
  animateOnArrival = false,
  correction,
  onAsk,
}: {
  animateOnArrival?: boolean;
  correction: EpisodeCorrection;
  onAsk: (correction: EpisodeCorrection) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isReduced = useReduceMotion();
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.set(
      withTiming(isOpen ? 180 : 0, {
        duration: isReduced ? 0 : 350,
        reduceMotion: ReduceMotion.Never,
      })
    );
  }, [isOpen, isReduced, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  // biome-ignore lint/suspicious/noUnnecessaryConditions: 마운트 뒤 useEffect가 값을 바꾼다.
  const entering = mounted.current && !isReduced ? reveal : undefined;
  const open = useCallback(() => setIsOpen(true), []);
  const fold = useCallback(() => setIsOpen(false), []);
  const ask = useCallback(() => onAsk(correction), [correction, onAsk]);
  const appearance = correctionPresentation(correction.original);
  const spot = useMemo(
    () => ({ kind: "learning" as const, messageId: correction.messageId }),
    [correction.messageId]
  );

  return (
    <Animated.View
      className="mt-1 w-full items-end"
      entering={animateOnArrival && !isReduced ? reveal : undefined}
      layout={isReduced ? undefined : resize}
      testID="correction-note"
    >
      {isOpen ? (
        <Animated.View
          className={`max-w-[85%] self-end rounded-2xl rounded-tl-md px-3.5 py-3 ${appearance.surface}`}
          entering={isReduced ? undefined : reveal}
          exiting={isReduced ? undefined : conceal}
          testID="correction-card"
        >
          <View className="mb-2 flex-row items-center justify-between gap-1">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="learn" size="sm" tone={appearance.tone} />
              <Typography.Paragraph
                className={`shrink ${appearance.text}`}
                selectable={false}
                type="body-xs"
                weight="semibold"
              >
                {correction.entries.length > 1
                  ? `${appearance.title} ${correction.entries.length}개`
                  : appearance.title}
              </Typography.Paragraph>
            </View>
            <Pressable
              accessibilityLabel={`${appearance.title} 접기`}
              accessibilityRole="button"
              accessibilityState={{ expanded: true }}
              className="-my-2 -mr-2 size-11 items-center justify-center"
              onPress={fold}
              testID="correction-fold"
            >
              <Animated.View style={chevronStyle}>
                <Icon name="expand" size="sm" tone="muted" />
              </Animated.View>
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
        </Animated.View>
      ) : (
        <Animated.View
          entering={entering}
          exiting={isReduced ? undefined : conceal}
        >
          <Pressable
            accessibilityLabel={`${appearance.title} 보기`}
            accessibilityRole="button"
            accessibilityState={{ expanded: false }}
            className={`max-w-[92%] flex-row items-start gap-2 self-end rounded-2xl rounded-tl-md px-3.5 py-2.5 ${appearance.surface}`}
            onPress={open}
            testID="correction-line"
          >
            <View className="mt-1">
              <Icon name="learn" size="sm" tone={appearance.tone} />
            </View>
            <View className="shrink">
              <MarkedSentence
                markClassName={appearance.text}
                marks={fixedMarks(correction)}
                testID="correction-line-fixed"
                text={correction.fixed}
                type="body-sm"
              />
            </View>
            {/* `body-sm`의 24 줄 가운데에 16pt 아이콘을 맞춘다. */}
            <Animated.View className="mt-1" style={chevronStyle}>
              <Icon name="expand" size="sm" tone="muted" />
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}
      {/*
        아이콘 줄은 접힌 한 줄과 펼친 카드 아래 같은 자리에 선다. 어느 쪽에서
        담아도 같은 자리를 가리키므로 상태도 함께 바뀐다.
      */}
      <LearningExpressionActions spot={spot} text={correction.fixed} />
      <ExpressionSaveFailure align="end" spot={spot} />
    </Animated.View>
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
  const isReduced = useReduceMotion();
  const hadCorrectionAtMount = useRef(correction !== undefined).current;
  const retryExpression = useCallback(
    () => retry(message.id),
    [retry, message.id]
  );
  if (message.role !== "user") {
    return null;
  }
  let content: ReactNode;
  if (state && state.status !== "corrected") {
    content = <ExpressionStatusNote onRetry={retryExpression} state={state} />;
  } else if (correction) {
    content = (
      <CorrectionNote
        animateOnArrival={!hadCorrectionAtMount}
        correction={correction}
        onAsk={ask}
      />
    );
  }
  return (
    <Animated.View layout={isReduced ? undefined : resize}>
      {content}
    </Animated.View>
  );
}
