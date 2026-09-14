import { Card } from "heroui-native/card";
import { Menu, type MenuTriggerRef } from "heroui-native/menu";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";

import type { StoryPlay, StoryPlays } from "@/features/story/api/story";
import { StoryCover } from "@/features/story/ui/story-cover";
import { storyLabels } from "@/features/story/ui/story-labels";
import { formatStoryPlayStart } from "@/features/story/ui/story-play-time";
import { StoryProgress } from "@/features/story/ui/story-progress";
import { DelayedLoading } from "@/shared/ui/delayed-loading";
import { IconButton } from "@/shared/ui/icon-button";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";
import { useScreenContentHeight } from "@/shared/ui/use-screen-content-height";

function StoryPlayCard({
  isDeleting,
  onDelete,
  onOpen,
  storyPlay,
  total,
}: {
  isDeleting: boolean;
  onDelete: (storyPlayId: string) => void;
  onOpen: (storyPlay: StoryPlay) => void;
  storyPlay: StoryPlay;
  total: number;
}) {
  const startedAt = formatStoryPlayStart(storyPlay.startedAt);
  const progress = storyLabels.runProgress(
    storyPlay.finished,
    total,
    storyPlay.next
  );
  const open = useCallback(() => onOpen(storyPlay), [onOpen, storyPlay]);
  const remove = useCallback(
    () => onDelete(storyPlay.storyPlayId),
    [onDelete, storyPlay.storyPlayId]
  );
  const triggerRef = useRef<MenuTriggerRef>(null);
  const openMenu = useCallback(() => triggerRef.current?.open(), []);

  return (
    <Card
      className="overflow-visible p-0"
      testID={`story-play-card-${storyPlay.storyPlayId}`}
    >
      <PressableFeedback
        accessibilityLabel={storyLabels.runCard(startedAt, progress)}
        accessibilityRole="button"
        accessibilityState={{ busy: isDeleting, disabled: isDeleting }}
        className="gap-2 px-4 py-4"
        isDisabled={isDeleting}
        onPress={open}
        testID={`story-play-open-${storyPlay.storyPlayId}`}
      >
        <Typography.Heading className="pr-10" type="h6">
          {startedAt}
        </Typography.Heading>
        <StoryProgress
          current={storyPlay.next?.number}
          finished={storyPlay.finished}
          total={total}
        />
        <Typography.Paragraph color="muted" type="body-sm">
          {progress}
        </Typography.Paragraph>
      </PressableFeedback>
      <View className="absolute top-1 right-1 z-10">
        {isDeleting ? (
          <IconButton
            accessibilityLabel={storyLabels.runMenu(startedAt)}
            accessibilityState={{ busy: true }}
            className="rounded-full"
            isDisabled
            size="lg"
            testID={`story-play-menu-${storyPlay.storyPlayId}`}
          >
            <LoadingSpinner
              sizeRole="control"
              testID="story-play-delete-progress"
            />
          </IconButton>
        ) : (
          <Menu>
            <Menu.Trigger asChild ref={triggerRef}>
              <View>
                <IconButton
                  accessibilityLabel={storyLabels.runMenu(startedAt)}
                  accessibilityState={{ busy: false }}
                  className="rounded-full"
                  onPress={openMenu}
                  size="lg"
                  testID={`story-play-menu-${storyPlay.storyPlayId}`}
                >
                  <Typography.Paragraph type="body" weight="semibold">
                    ···
                  </Typography.Paragraph>
                </IconButton>
              </View>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Overlay />
              <Menu.Content
                align="end"
                placement="bottom"
                presentation="popover"
                width={144}
              >
                <Menu.Item onPress={remove}>
                  <Menu.ItemTitle>{storyLabels.deleteRun}</Menu.ItemTitle>
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu>
        )}
      </View>
    </Card>
  );
}

type StoryIntro = Pick<
  StoryPlays,
  "coverBlurhash" | "coverImagePath" | "intro" | "title"
>;

function StoryHeader({ storyPlays }: { storyPlays: StoryIntro }) {
  return (
    <View className="flex-row items-center gap-3.5 px-1">
      <StoryCover
        blurhash={storyPlays.coverBlurhash}
        imagePath={storyPlays.coverImagePath}
      />
      <View className="flex-1 gap-1">
        <Typography.Heading type="h5">{storyPlays.title}</Typography.Heading>
        <Typography.Paragraph color="muted" type="body-sm">
          {storyPlays.intro}
        </Typography.Paragraph>
      </View>
    </View>
  );
}

export function StoryRecordsScreen({
  deletingStoryPlayId,
  isLoading,
  isRetrying,
  onDelete,
  onOpen,
  onRetry,
  storyIntro,
  storyPlays,
}: {
  deletingStoryPlayId?: string;
  isLoading: boolean;
  isRetrying: boolean;
  onDelete: (storyPlayId: string) => void;
  onOpen: (storyPlay: StoryPlay) => void;
  onRetry: () => void;
  storyIntro?: StoryIntro;
  storyPlays: StoryPlays | undefined;
}) {
  const contentHeight = useScreenContentHeight();
  const intro = storyPlays ?? storyIntro;

  return (
    <ScrollView
      {...contentHeight}
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="story-records-scroll"
    >
      {intro ? (
        <>
          <View className="pb-6">
            <StoryHeader storyPlays={intro} />
          </View>
          <Separator testID="story-records-divider" />
          <View className="grow pt-6">
            <Typography.Paragraph
              accessibilityRole="header"
              className="mb-3 px-1"
              color="muted"
              type="body-sm"
              weight="medium"
            >
              {storyLabels.recentHeading}
            </Typography.Paragraph>
            {storyPlays && storyPlays.plays.length > 0 ? (
              <View className="gap-4">
                {storyPlays.plays.map((storyPlay) => (
                  <StoryPlayCard
                    isDeleting={deletingStoryPlayId === storyPlay.storyPlayId}
                    key={storyPlay.storyPlayId}
                    onDelete={onDelete}
                    onOpen={onOpen}
                    storyPlay={storyPlay}
                    total={storyPlays.total}
                  />
                ))}
              </View>
            ) : null}
            {storyPlays && storyPlays.plays.length === 0 ? (
              <ScreenEmpty
                testID="story-records-empty"
                title={storyLabels.recordsEmptyTitle}
              />
            ) : null}
            {!storyPlays && isLoading ? (
              <DelayedLoading testID="story-records-loading" />
            ) : null}
            {storyPlays || isLoading ? null : (
              <ScreenUnavailable
                isRetrying={isRetrying}
                onRetry={onRetry}
                testID="story-records-unavailable"
                title={storyLabels.unavailable}
              />
            )}
          </View>
        </>
      ) : null}
      {!intro && isLoading ? (
        <DelayedLoading testID="story-records-loading" />
      ) : null}
      {intro || isLoading ? null : (
        <ScreenUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="story-records-unavailable"
          title={storyLabels.unavailable}
        />
      )}
    </ScrollView>
  );
}
