import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
import {
  meaningKey,
  type UtteranceSpot,
} from "@/features/episode/api/utterance-meaning";
import {
  type UtteranceSource,
  useMeaningView,
} from "@/features/episode/state/utterance-meanings";
import { castTone } from "@/shared/ui/cast-tone";
import { Icon } from "@/shared/ui/icon";
import { IconRowButton } from "@/shared/ui/icon-row";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { StatusLine } from "@/shared/ui/status-line";
import { useReduceMotion } from "@/shared/ui/use-reduce-motion";
import { utteranceMeaningLabels as labels } from "./episode-labels";

const reveal = FadeIn.duration(240).reduceMotion(ReduceMotion.System);
const conceal = FadeOut.duration(180).reduceMotion(ReduceMotion.System);
const resize = LinearTransition.duration(480).reduceMotion(ReduceMotion.System);

export function UtteranceTranslationButton({ spot }: { spot: UtteranceSpot }) {
  const { states, toggle } = useMeaningView();
  const state = states[meaningKey(spot)];
  const shown = state?.status === "ready" && state.shown;
  const busy = state?.status === "pending";
  const press = useCallback(() => toggle(spot), [spot, toggle]);
  return (
    <IconRowButton
      isBusy={busy}
      isSelected={shown}
      label={shown ? labels.hide : labels.show}
      onPress={press}
      testID="utterance-translate"
    >
      {busy ? (
        <LoadingSpinner sizeRole="compactControl" />
      ) : (
        <Icon name="translate" size="sm" tone={shown ? "accent" : "muted"} />
      )}
    </IconRowButton>
  );
}

export function UtteranceMeaningLine({
  spot,
  speaker,
  text,
}: {
  spot: UtteranceSpot;
  speaker: string;
  text: string;
}) {
  const { states, ask } = useMeaningView();
  const state = states[meaningKey(spot)];
  const isReduced = useReduceMotion();
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  // biome-ignore lint/suspicious/noUnnecessaryConditions: 마운트 뒤 useEffect가 값을 바꾼다.
  const entering = mounted.current && !isReduced ? reveal : undefined;
  const askAboutMeaning = useCallback(() => {
    if (state?.status === "ready") {
      ask({ ...spot, meaning: state.meaning, speaker, text });
    }
  }, [ask, spot, speaker, state, text]);
  let content: ReactNode;
  if (state?.status === "ready" && state.shown) {
    content = (
      <Animated.View
        className="mt-1 max-w-[92%] self-start rounded-2xl rounded-tr-md bg-surface px-3.5 pt-2.5 pb-0.5"
        entering={entering}
        exiting={isReduced ? undefined : conceal}
        testID="utterance-meaning"
      >
        <View
          accessibilityLabel={labels.title}
          accessibilityValue={{ text: state.meaning }}
          accessible
        >
          <Typography.Paragraph selectable={false} type="body">
            {state.meaning}
          </Typography.Paragraph>
        </View>
        <LinkButton
          accessibilityLabel={labels.ask}
          className="min-h-11 gap-0.5 self-start"
          onPress={askAboutMeaning}
          size="sm"
        >
          <LinkButton.Label className="text-accent">
            {labels.ask}
          </LinkButton.Label>
          <Icon name="forward" size="xs" tone="accent" />
        </LinkButton>
      </Animated.View>
    );
  }
  return (
    <Animated.View
      layout={isReduced ? undefined : resize}
      testID="utterance-meaning-motion"
    >
      {content}
    </Animated.View>
  );
}

export function UtteranceMeaningFailure({ spot }: { spot: UtteranceSpot }) {
  const { states, toggle } = useMeaningView();
  const state = states[meaningKey(spot)];
  const retry = useCallback(() => toggle(spot), [spot, toggle]);
  if (state?.status !== "error") {
    return null;
  }
  return (
    <View
      className="mt-1 max-w-[85%] self-start"
      testID="utterance-translation-failed-row"
    >
      <StatusLine
        icon="regenerate"
        label={labels.failed}
        retry={{
          label: labels.retry,
          onPress: retry,
          testID: "utterance-translation-retry",
        }}
        testID="utterance-translation-failed"
        tone="danger"
      />
    </View>
  );
}

/**
 * 인물 대사를 두고 연 질문창의 맨 위 출처. 표현 노트에서 연 질문창도 같은 출처를
 * 쓰므로 그리는 것만 받는다. 노트는 인물의 스토리 안 순서를 모르므로 첫 이름표 색이 된다.
 */
export function UtteranceMeaningSource({
  source,
}: {
  source: Pick<UtteranceSource, "meaning" | "position" | "speaker" | "text">;
}) {
  return (
    <View
      className="mb-4 rounded-2xl bg-surface px-3.5 py-3"
      testID="utterance-source"
    >
      <View className="mb-1 flex-row items-center gap-1.5">
        <Icon name="translate" size="sm" tone="muted" />
        <Typography.Paragraph color="muted" type="body-xs" weight="semibold">
          {labels.title}
        </Typography.Paragraph>
      </View>
      <Typography.Paragraph
        className={`mb-0.5 ${castTone(source.position)}`}
        type="body-xs"
        weight="semibold"
      >
        {source.speaker}
      </Typography.Paragraph>
      <Typography.Paragraph
        className="mb-0.5"
        color="muted"
        selectable={false}
        type="body-sm"
      >
        {source.text}
      </Typography.Paragraph>
      <Typography.Paragraph selectable={false} weight="semibold">
        {source.meaning}
      </Typography.Paragraph>
    </View>
  );
}
