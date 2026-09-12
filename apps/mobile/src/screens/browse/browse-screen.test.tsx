import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { StoryCard } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { BrowseScreen } from "./browse-screen";

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 140,
}));

const STORY_ID = "10000000-0000-4000-8000-000000000001";
const MADE_STORY_ID = "10000000-0000-4000-8000-0000000000f1";

function official(): StoryCard {
  return {
    coverBlurhash: null,
    coverEmoji: "☕",
    coverImagePath: null,
    hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
    mine: false,
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 5,
  };
}

function made(): StoryCard {
  return {
    coverBlurhash: null,
    coverEmoji: "🧳",
    coverImagePath: null,
    hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
    mine: true,
    storyId: MADE_STORY_ID,
    title: "베를린 출장 일주일",
    total: 3,
  };
}

/** 서버가 내려보내는 순서 그대로다. 만든 스토리가 공식 스토리보다 위에 온다. */
function stories(): StoryCard[] {
  return [made(), official()];
}

function renderBrowse(
  overrides: Partial<Parameters<typeof BrowseScreen>[0]> = {}
) {
  const onCreateStory = jest.fn();
  const onOpenStory = jest.fn<(storyId: string) => void>();

  return {
    onCreateStory,
    onOpenStory,
    rendered: renderWithHeroUI(
      <BrowseScreen
        isLoading={false}
        isRetrying={false}
        onCreateStory={onCreateStory}
        onOpenStory={onOpenStory}
        onRetry={jest.fn()}
        stories={stories()}
        {...overrides}
      />
    ),
  };
}

test("전체는 만든 스토리를 위에, 공식 스토리를 아래에 둔다", async () => {
  const { rendered } = renderBrowse();

  await rendered;

  expect(screen.getByText("전체")).toBeVisible();
  expect(screen.getByText("내 스토리")).toBeVisible();
  expect(screen.getByTestId(`browse-row-${MADE_STORY_ID}`)).toBeVisible();
  expect(screen.getByTestId(`browse-row-${STORY_ID}`)).toBeVisible();
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

/*
  목록은 한 번의 조회로 온다. 칩을 바꾸는 것은 이미 받은 목록을 거르는 일이라
  다시 묻지 않는다.
*/
test("내 스토리를 고르면 만든 것만 남는다", async () => {
  const { rendered } = renderBrowse();

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByText("내 스토리"));

  expect(screen.getByTestId(`browse-row-${MADE_STORY_ID}`)).toBeVisible();
  expect(screen.queryByTestId(`browse-row-${STORY_ID}`)).toBeNull();
});

test("만든 스토리가 없으면 내 스토리가 만들기를 안내한다", async () => {
  const { onCreateStory, rendered } = renderBrowse({ stories: [official()] });

  await rendered;
  const user = userEvent.setup();

  await user.press(screen.getByText("내 스토리"));

  expect(screen.getByTestId("browse-mine-empty")).toBeVisible();
  expect(screen.getByText("아직 내 스토리가 없어요")).toBeVisible();

  await user.press(screen.getByText("스토리 만들기"));

  expect(onCreateStory).toHaveBeenCalled();
});

// 칩은 만든 스토리가 없어도 늘 보인다. 만들 수 있다는 사실을 칩이 알려 준다.
test("만든 스토리가 없어도 칩 두 개가 보인다", async () => {
  const { rendered } = renderBrowse({ stories: [official()] });

  await rendered;

  expect(screen.getByText("전체")).toBeVisible();
  expect(screen.getByText("내 스토리")).toBeVisible();
  expect(screen.getByTestId(`browse-row-${STORY_ID}`)).toBeVisible();
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
