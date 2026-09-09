import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { RecentStory } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { RecentStoriesScreen } from "./recent-stories-screen";

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 140,
}));

const STORY_ID = "10000000-0000-4000-8000-000000000001";
const OTHER_STORY_ID = "10000000-0000-4000-8000-000000000002";

function stories(): RecentStory[] {
  return [
    {
      coverBlurhash: null,
      coverEmoji: "☕",
      coverImagePath: null,
      hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
      storyId: STORY_ID,
      title: "Mia의 카페",
    },
    {
      coverBlurhash: null,
      coverEmoji: "✈️",
      coverImagePath: null,
      hook: "첫 출장인데 공항에서부터 꼬였어요",
      storyId: OTHER_STORY_ID,
      title: "첫 출장",
    },
  ];
}

function renderRecent(
  overrides: Partial<Parameters<typeof RecentStoriesScreen>[0]> = {}
) {
  const onBrowse = jest.fn();
  const onOpenRecords = jest.fn<(storyId: string) => void>();

  return {
    onBrowse,
    onOpenRecords,
    rendered: renderWithHeroUI(
      <RecentStoriesScreen
        isLoading={false}
        isRetrying={false}
        onBrowse={onBrowse}
        onOpenRecords={onOpenRecords}
        onRetry={jest.fn()}
        stories={stories()}
        {...overrides}
      />
    ),
  };
}

test("최근 대화 제목 아래 서버가 준 순서 그대로 세운다", async () => {
  const { rendered } = renderRecent();

  await rendered;

  expect(screen.getByText("최근 대화")).toBeVisible();
  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(screen.getByText("첫 출장")).toBeVisible();
});

// 목록에 대표 진행 바를 두지 않는다. 회차마다 진행이 달라 어느 것을 세울지
// 정할 수 없다.
test("목록에 진행 바를 두지 않는다", async () => {
  const { rendered } = renderRecent();

  await rendered;

  expect(screen.queryByTestId("story-progress")).toBeNull();
});

test("스토리를 누르면 그 스토리의 대화 기록으로 간다", async () => {
  const { onOpenRecords, rendered } = renderRecent();

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByTestId(`recent-row-${STORY_ID}`));

  expect(onOpenRecords).toHaveBeenCalledWith(STORY_ID);
});

test("대화한 적 없으면 탐색으로 안내하고 다시 시도를 붙이지 않는다", async () => {
  const { onBrowse, rendered } = renderRecent({ stories: [] });

  await rendered;
  const user = userEvent.setup();

  expect(screen.getByTestId("recent-empty")).toBeVisible();
  expect(screen.queryByText("다시 시도하기")).toBeNull();

  await user.press(screen.getByText("스토리 둘러보기"));

  expect(onBrowse).toHaveBeenCalledTimes(1);
});

test("불러오지 못하면 다시 시도할 수 있다", async () => {
  const { rendered } = renderRecent({ stories: undefined });

  await rendered;

  expect(screen.getByTestId("recent-unavailable")).toBeVisible();
  expect(screen.getByText("다시 시도하기")).toBeVisible();
  expect(screen.queryByTestId("recent-empty")).toBeNull();
});
