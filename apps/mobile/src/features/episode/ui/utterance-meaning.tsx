import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import { useCallback } from "react";
import { View } from "react-native";
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
        <Typography.Paragraph
          className="shrink"
          selectable={false}
          type="body-sm"
        >
          {state.meaning}
        </Typography.Paragraph>
      </View>
      <LinkButton
        accessibilityLabel={labels.ask}
        className="ml-6 min-h-11 gap-0.5 self-start"
        onPress={askAboutMeaning}
        size="sm"
      >
        <LinkButton.Label className="text-accent">
          {labels.ask}
        </LinkButton.Label>
        <Icon name="forward" size="xs" tone="accent" />
      </LinkButton>
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
