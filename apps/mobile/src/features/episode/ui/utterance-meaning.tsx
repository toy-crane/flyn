import { useCallback } from "react";
import { Text, View } from "react-native";
import {
  meaningKey,
  type UtteranceSpot,
} from "@/features/episode/api/utterance-meaning";
import {
  type UtteranceSource,
  useMeaningView,
} from "@/features/episode/state/utterance-meanings";
import { Button } from "@/shared/ui/button";
import { castTone } from "@/shared/ui/cast-tone";
import { Icon } from "@/shared/ui/icon";
import { IconRowButton } from "@/shared/ui/icon-row";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { StatusLine } from "@/shared/ui/status-line";
import { utteranceMeaningLabels as labels } from "./episode-labels";

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
  const { states, toggle, ask } = useMeaningView();
  const state = states[meaningKey(spot)];
  const retry = useCallback(() => toggle(spot), [spot, toggle]);
  const askAboutMeaning = useCallback(() => {
    if (state?.status === "ready") {
      ask({ ...spot, meaning: state.meaning, speaker, text });
    }
  }, [ask, spot, speaker, state, text]);
  if (state?.status === "error") {
    return (
      <View className="mt-1 max-w-[85%] self-start">
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
  if (state?.status !== "ready" || !state.shown) {
    return null;
  }
  return (
    <View
      className="mt-1 max-w-[92%] self-start rounded-2xl rounded-tr-md bg-surface px-3.5 pt-2.5 pb-0.5"
      testID="utterance-meaning"
    >
      <View
        accessibilityLabel={labels.title}
        accessibilityValue={{ text: state.meaning }}
        accessible
        className="flex-row items-start gap-2"
      >
        <View className="mt-1">
          <Icon name="translate" size="sm" tone="muted" />
        </View>
        <Text
          className="shrink text-foreground text-sm leading-5"
          selectable={false}
        >
          {state.meaning}
        </Text>
      </View>
      <Button
        accessibilityLabel={labels.ask}
        className="-ml-1.5 self-start"
        labelClassName="text-accent text-xs"
        onPress={askAboutMeaning}
        size="sm"
        variant="ghost"
      >
        {`${labels.ask} ›`}
      </Button>
    </View>
  );
}

export function UtteranceMeaningSource({
  source,
}: {
  source: UtteranceSource;
}) {
  return (
    <View
      className="mb-4 rounded-2xl bg-surface px-3.5 py-3"
      testID="utterance-source"
    >
      <View className="mb-1 flex-row items-center gap-1.5">
        <Icon name="translate" size="sm" tone="muted" />
        <Text className="font-semibold text-muted text-xs">{labels.title}</Text>
      </View>
      <Text
        className={`mb-0.5 font-semibold text-xs ${castTone(source.position)}`}
      >
        {source.speaker}
      </Text>
      <Text className="mb-0.5 text-muted text-sm leading-5" selectable={false}>
        {source.text}
      </Text>
      <Text
        className="font-semibold text-base text-foreground leading-6"
        selectable={false}
      >
        {source.meaning}
      </Text>
    </View>
  );
}
