import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { StoryCard } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { BrowseScreen } from "./browse-screen";

const STORY_ID = "10000000-0000-4000-8000-000000000001";

function stories(): StoryCard[] {
  return [
    {
      coverBlurhash: null,
      coverEmoji: "☕",
      coverImagePath: null,
      hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
      storyId: STORY_ID,
      title: "Mia의 카페",
      total: 5,
    },
  ];
}

function renderBrowse(
  overrides: Partial<Parameters<typeof BrowseScreen>[0]> = {}
) {
  const onOpenStory = jest.fn<(storyId: string) => void>();

  return {
    onOpenStory,
    rendered: renderWithHeroUI(
      <BrowseScreen
        isLoading={false}
        isRetrying={false}
        onOpenStory={onOpenStory}
        onRetry={jest.fn()}
        stories={stories()}
        {...overrides}
      />
    ),
  };
}

test("모든 스토리를 표지와 한 줄 소개로 보여 준다", async () => {
  const { rendered } = renderBrowse();

  await rendered;

  expect(screen.getByText("모든 스토리")).toBeVisible();
  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(
    screen.getByText("늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요")
  ).toBeVisible();
});

// 탐색은 콘텐츠를 소개한다. 특정 플레이의 진행을 스토리의 상태처럼 세우지 않는다.
test("목록에 진행 바를 두지 않는다", async () => {
  const { rendered } = renderBrowse();

  await rendered;

  expect(screen.queryByTestId("story-progress")).toBeNull();
});

test("스토리를 누르면 상세로 간다", async () => {
  const { onOpenStory, rendered } = renderBrowse();

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByTestId(`browse-row-${STORY_ID}`));

  expect(onOpenStory).toHaveBeenCalledWith(STORY_ID);
});

test("불러오지 못하면 다시 시도할 수 있다", async () => {
  const { rendered } = renderBrowse({ stories: undefined });

  await rendered;

  expect(screen.getByTestId("browse-unavailable")).toBeVisible();
  expect(screen.getByText("다시 시도하기")).toBeVisible();
});
