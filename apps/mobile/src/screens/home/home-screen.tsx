import { ScrollView, Text, View } from "react-native";

import type { FinishedEpisode, Season } from "@/features/episode/api/season";
import {
  episodeLabels,
  seasonLabels,
} from "@/features/episode/ui/episode-labels";
import { Button } from "@/shared/ui/button";

/**
 * The season's record: which episodes are done and how each one ended.
 *
 * 끝난 화는 지울 수 없는 사실이라 목록도 누르는 자리를 두지 않는다. 다시 하기도
 * 지난 대화 다시 보기도 없으므로, 이 줄들은 읽는 것이 전부다.
 */
function SeasonRecord({
  episodes,
  heading,
  progress,
  total,
}: {
  episodes: FinishedEpisode[];
  heading: string;
  progress: string;
  /** Set while episodes are left, which is when the dots still say something. */
  total: number | undefined;
}) {
  return (
    <View className="gap-3" testID="home-season-record">
      <View className="flex-row items-baseline justify-between px-1">
        <Text accessibilityRole="header" className="font-bold text-foreground">
          {heading}
        </Text>
        <Text className="text-muted text-sm">{progress}</Text>
      </View>
      {total === undefined ? null : (
        <SeasonProgress finished={episodes.length} total={total} />
      )}
      <View className="rounded-2xl bg-surface px-5">
        {episodes.map((finished, index) => (
          <View
            className={`flex-row items-center gap-3 py-3.5 ${
              index === episodes.length - 1 ? "" : "border-border border-b"
            }`}
            key={finished.episode}
          >
            <Text className="w-8 font-bold text-muted text-sm">
              {seasonLabels.episodeNumber(finished.episode)}
            </Text>
            <Text className="flex-1 text-base text-foreground leading-6">
              {finished.title}
            </Text>
            <Text className="rounded-full border border-border px-2.5 py-0.5 font-semibold text-muted text-xs">
              {finished.kind}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** 다섯 칸 중 끝낸 만큼이 채워지는 시즌 진행 표시. */
function SeasonProgress({
  finished,
  total,
}: {
  finished: number;
  total: number;
}) {
  return (
    // 칸에는 글이 없다. 몇 화를 끝냈는지는 옆의 문장이 말하므로 이 줄은
    // 눈으로만 읽는다.
    <View className="flex-row gap-1.5 px-1" testID="home-season-progress">
      {Array.from({ length: total }, (_, index) => index + 1).map((episode) => (
        <View
          className={`size-2 rounded-full ${
            episode <= finished ? "bg-accent" : "bg-border"
          }`}
          key={episode}
        />
      ))}
    </View>
  );
}

/**
 * Home, which is where the season is.
 *
 * 세 가지 상태를 가진다. 시작 전에는 첫 화 하나, 진행 중에는 다음 화 예고와
 * 지금까지의 기록, 완주 뒤에는 완주 안내와 다섯 화의 기록이다. 어느 상태든
 * 고를 것은 없고 이어서 할 일 하나만 있다.
 *
 * Home owns no episode state. The screen only says the person wants to start;
 * the route it belongs to is what opens the episode.
 */
export function HomeScreen({
  isLoading,
  onRetry,
  onStartEpisode,
  season,
}: {
  /** 아직 시즌을 읽는 중인지. 읽는 중과 못 읽은 것은 다른 상태다. */
  isLoading: boolean;
  onRetry: () => void;
  onStartEpisode: () => void;
  season: Season | undefined;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-6 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
    >
      {/*
        읽는 중에는 아무 말도 하지 않는다. 잠깐 기다리는 것을 실패라고 알리면
        아무 문제가 없는데도 사용자가 다시 시도를 누르게 된다.
      */}
      {season ? (
        <SeasonBody onStartEpisode={onStartEpisode} season={season} />
      ) : null}
      {season || isLoading ? null : <SeasonUnavailable onRetry={onRetry} />}
    </ScrollView>
  );
}

/**
 * 시즌을 읽지 못했을 때.
 *
 * 홈에 아무것도 없으면 앱을 다시 켜는 것 말고는 할 수 있는 일이 없다. 사과보다
 * 지금 할 수 있는 일을 먼저 둔다.
 */
function SeasonUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      className="gap-3 rounded-2xl bg-surface px-5 py-6"
      testID="home-empty"
    >
      <Text className="text-base text-muted leading-6">
        {episodeLabels.unavailable}
      </Text>
      <Button accessibilityLabel={episodeLabels.retry} onPress={onRetry}>
        {episodeLabels.retry}
      </Button>
    </View>
  );
}

function SeasonBody({
  onStartEpisode,
  season,
}: {
  onStartEpisode: () => void;
  season: Season;
}) {
  const { completion, finished, next, total } = season;
  const hasFinished = finished.length > 0;

  return (
    <>
      {next ? (
        <View
          className="gap-3 rounded-2xl bg-surface px-5 py-6"
          testID="home-next-episode"
        >
          <Text className="font-semibold text-accent text-sm">
            {hasFinished
              ? episodeLabels.nextEyebrow
              : episodeLabels.firstEyebrow(season.season)}
          </Text>
          <Text
            accessibilityRole="header"
            className="font-bold text-foreground text-xl leading-7"
          >
            {episodeLabels.title(next.episode, next.title)}
          </Text>
          <Text className="text-base text-muted leading-6">{next.preview}</Text>
          <Button
            accessibilityLabel={episodeLabels.start(next.episode)}
            onPress={onStartEpisode}
          >
            {episodeLabels.start(next.episode)}
          </Button>
        </View>
      ) : (
        <View
          className="gap-3 rounded-2xl bg-surface px-5 py-6"
          testID="home-season-done"
        >
          <Text className="font-semibold text-accent text-sm">
            {seasonLabels.name(season.season)}
          </Text>
          <Text
            accessibilityRole="header"
            className="font-bold text-foreground text-xl leading-7"
          >
            {completion.title}
          </Text>
          <Text className="text-base text-muted leading-6">
            {completion.copy}
          </Text>
        </View>
      )}

      {hasFinished ? (
        <SeasonRecord
          episodes={finished}
          heading={seasonLabels.name(season.season)}
          progress={
            next
              ? seasonLabels.progress(finished.length, total)
              : seasonLabels.wholeSeason(total)
          }
          total={next ? total : undefined}
        />
      ) : null}
    </>
  );
}
