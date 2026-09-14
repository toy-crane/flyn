import { expect, jest, test } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import type { StoryPlay, StoryPlays } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoryRecordsScreen } from "./story-records-screen";

const STORY_ID = "10000000-0000-4000-8000-000000000001";
const FIRST_ID = "1a000000-0000-4000-8000-000000000001";
const SECOND_ID = "1a000000-0000-4000-8000-000000000002";

function play(id: string, finished: number): StoryPlay {
  return {
    episodes: Array.from({ length: finished }, (_, index) => ({
      episodeId: `11000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      hasTranscript: true,
      number: index + 1,
      outcome: "해냈어요.",
      title: `${index + 1}화`,
    })),
    finished,
    next:
      finished === 5
        ? null
        : {
            episodeId: `11000000-0000-4000-8000-${String(finished + 1).padStart(12, "0")}`,
            hasTranscript: finished === 0,
            number: finished + 1,
            title: "계산이 꼬인 아침",
          },
    startedAt: new Date(2026, 8, finished + 1, 15, 42).toISOString(),
    storyPlayId: id,
  };
}

function records(plays: StoryPlay[], total = 5): StoryPlays {
  return {
    coverBlurhash: null,
    coverImagePath: null,
    intro: "동네 카페에서 벌어지는 이야기.",
    plays,
    storyId: STORY_ID,
    title: "Mia의 카페",
    total,
  };
}

function renderRecords(
  overrides: Partial<Parameters<typeof StoryRecordsScreen>[0]> = {}
) {
  const onOpen = jest.fn<(selected: StoryPlay) => void>();
  const onDelete = jest.fn<(storyPlayId: string) => void>();
  const rendered = renderWithHeroUI(
    <StoryRecordsScreen
      isLoading={false}
      isRetrying={false}
      onDelete={onDelete}
      onOpen={onOpen}
      onRetry={jest.fn()}
      storyPlays={records([play(FIRST_ID, 1), play(SECOND_ID, 5)])}
      {...overrides}
    />
  );
  return { onDelete, onOpen, rendered };
}

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 103,
}));

test("회차 본문을 누르면 선택한 회차의 Sheet 진입을 요청한다", async () => {
  const first = play(FIRST_ID, 1);
  const { onDelete, onOpen, rendered } = renderRecords({
    storyPlays: records([first, play(SECOND_ID, 5)]),
  });
  await rendered;

  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(screen.getByText("2/5화 · 계산이 꼬인 아침")).toBeVisible();
  expect(screen.getByText("5/5화 · 완료")).toBeVisible();
  expect(screen.getAllByTestId("story-progress")).toHaveLength(2);
  expect(screen.queryByText("이어서 하기")).toBeNull();
  fireEvent.press(screen.getByTestId(`story-play-open-${FIRST_ID}`));

  expect(onOpen).toHaveBeenCalledWith(first);
  expect(onDelete).not.toHaveBeenCalled();
});

test("끝낸 화가 없는 회차도 본문을 누르면 화 선택으로 간다", async () => {
  const first = play(FIRST_ID, 0);
  const { onOpen, rendered } = renderRecords({ storyPlays: records([first]) });
  await rendered;

  fireEvent.press(screen.getByTestId(`story-play-open-${FIRST_ID}`));
  expect(onOpen).toHaveBeenCalledWith(first);
  expect(screen.getByTestId(`story-play-menu-${FIRST_ID}`)).toBeVisible();
});

test("삭제 중에는 그 회차의 본문과 메뉴를 잠그고 메뉴 자리에 진행을 표시한다", async () => {
  const { rendered } = renderRecords({ deletingStoryPlayId: FIRST_ID });
  await rendered;

  expect(
    screen.getByTestId("story-play-delete-progress", {
      includeHiddenElements: true,
    })
  ).toBeTruthy();
  expect(
    screen.getByTestId(`story-play-open-${FIRST_ID}`).props.accessibilityState
  ).toEqual({ busy: true, disabled: true });
  expect(
    screen.getByTestId(`story-play-menu-${FIRST_ID}`).props.accessibilityState
  ).toEqual({ busy: true, disabled: true });
  expect(screen.getByTestId(`story-play-menu-${SECOND_ID}`)).toBeVisible();
});

test("한 화짜리 회차도 같은 본문 너비에 진행 바를 둔다", async () => {
  const finished = play(FIRST_ID, 5);
  const one = {
    ...finished,
    episodes: finished.episodes.slice(0, 1),
    finished: 1,
  };
  const { rendered } = renderRecords({ storyPlays: records([one], 1) });
  await rendered;

  expect(screen.getByTestId("story-progress")).toBeVisible();
  expect(screen.getByTestId("story-progress").props.className).toContain(
    "w-full"
  );
  expect(screen.getByText("1/1화 · 완료")).toBeVisible();
  expect(
    screen.getByTestId(`story-play-open-${FIRST_ID}`).props.className
  ).toContain("px-4");
});

test("기록이 없으면 빈 상태를 보여 준다", async () => {
  const { rendered } = renderRecords({ storyPlays: records([]) });
  await rendered;
  expect(screen.getByTestId("story-records-empty")).toBeVisible();
});

test("조회 실패는 빈 상태와 구분한다", async () => {
  const { rendered } = renderRecords({ storyPlays: undefined });
  await rendered;
  expect(screen.getByTestId("story-records-unavailable")).toBeVisible();
  expect(screen.queryByTestId("story-records-empty")).toBeNull();
});

test("이미 아는 소개는 남겨 두고 최근 대화만 기다린다", async () => {
  const { rendered } = renderRecords({
    isLoading: true,
    storyIntro: records([]),
    storyPlays: undefined,
  });
  await rendered;

  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(screen.getByText("최근 대화")).toBeVisible();
  expect(screen.queryByTestId("story-records-empty")).toBeNull();
  expect(screen.queryByTestId("story-records-unavailable")).toBeNull();
});

test("최근 대화가 1초 넘게 걸리면 스피너를 보여 주고 결과가 오면 지운다", async () => {
  const onDelete = jest.fn<(storyPlayId: string) => void>();
  const onOpen = jest.fn<(selected: StoryPlay) => void>();
  const onRetry = jest.fn();
  const intro = records([]);
  const rendered = await renderWithHeroUI(
    <StoryRecordsScreen
      isLoading
      isRetrying={false}
      onDelete={onDelete}
      onOpen={onOpen}
      onRetry={onRetry}
      storyIntro={intro}
      storyPlays={undefined}
    />
  );

  expect(screen.queryByTestId("story-records-loading")).toBeNull();
  const loading = await screen.findByTestId(
    "story-records-loading",
    {},
    {
      timeout: 2000,
    }
  );
  expect(loading.props.accessibilityRole).toBe("progressbar");
  expect(loading.props.accessibilityLabel).toBe("불러오는 중");
  expect(screen.getByText("최근 대화")).toBeVisible();

  await rendered.rerender(
    <StoryRecordsScreen
      isLoading={false}
      isRetrying={false}
      onDelete={onDelete}
      onOpen={onOpen}
      onRetry={onRetry}
      storyIntro={intro}
      storyPlays={intro}
    />
  );
  expect(screen.queryByTestId("story-records-loading")).toBeNull();
  expect(screen.getByTestId("story-records-empty")).toBeVisible();
});
