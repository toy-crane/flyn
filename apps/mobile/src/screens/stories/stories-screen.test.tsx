import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { StoryCard } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoriesScreen } from "./stories-screen";

const CONTINUE_HEADING = /이어 하기/;
const PROGRESS_SENTENCE = /화 중 .*완료/;
const STORY_ID = "10000000-0000-4000-8000-000000000001";

function createStory(partial: Partial<StoryCard> = {}): StoryCard {
  return {
    coverEmoji: "☕",
    coverImageUrl: null,
    finished: 2,
    hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 5,
    ...partial,
  };
}

test("모든 공식 스토리를 훅과 진행 바와 함께 보여 준다", async () => {
  const user = userEvent.setup();
  const openStory = jest.fn();

  await renderWithHeroUI(
    <StoriesScreen
      isLoading={false}
      isRetrying={false}
      onOpenStory={openStory}
      onRetry={jest.fn()}
      stories={[createStory()]}
    />
  );

  expect(screen.getByText("모든 스토리")).toBeOnTheScreen();
  expect(screen.getByText("Mia의 카페")).toBeOnTheScreen();
  expect(
    screen.getByText("늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요")
  ).toBeOnTheScreen();
  expect(screen.getByTestId("story-progress")).toHaveProp(
    "accessibilityValue",
    { max: 5, min: 0, now: 2 }
  );
  expect(screen.queryByText(PROGRESS_SENTENCE)).not.toBeOnTheScreen();
  expect(screen.queryByText(CONTINUE_HEADING)).not.toBeOnTheScreen();

  await user.press(screen.getByTestId(`story-row-${STORY_ID}`));

  expect(openStory).toHaveBeenCalledWith(STORY_ID);
});

test("스토리를 읽지 못했으면 다시 시도할 길을 준다", async () => {
  const user = userEvent.setup();
  const retry = jest.fn();

  await renderWithHeroUI(
    <StoriesScreen
      isLoading={false}
      isRetrying={false}
      onOpenStory={jest.fn()}
      onRetry={retry}
      stories={undefined}
    />
  );

  expect(screen.getByTestId("stories-empty")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(retry).toHaveBeenCalledTimes(1);
});

test("스토리를 읽는 중에는 실패를 알리지 않는다", async () => {
  await renderWithHeroUI(
    <StoriesScreen
      isLoading
      isRetrying={false}
      onOpenStory={jest.fn()}
      onRetry={jest.fn()}
      stories={undefined}
    />
  );

  expect(screen.queryByTestId("stories-empty")).not.toBeOnTheScreen();
});
