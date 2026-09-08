import { expect, jest, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";

import type { StoryDetail } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoryDetailScreen } from "./story-detail-screen";

const STORY_ID = "10000000-0000-4000-8000-000000000001";

function episodeId(number: number): string {
  return `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

function story(): StoryDetail {
  return {
    coverEmoji: "☕",
    coverImagePath: null,
    episodes: [
      {
        episodeId: episodeId(1),
        number: 1,
        situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
        situationEmoji: "☕",
        title: "카페에서 생긴 일",
      },
      {
        episodeId: episodeId(2),
        number: 2,
        situation: "다른 방법을 찾아 계산을 끝내 보세요",
        situationEmoji: "💳",
        title: "계산이 꼬인 아침",
      },
    ],
    hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
    intro: "매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.",
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 5,
  };
}

function renderDetail(
  overrides: Partial<Parameters<typeof StoryDetailScreen>[0]> = {}
) {
  return renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      isStarting={false}
      onRetry={jest.fn()}
      onStart={jest.fn()}
      story={story()}
      {...overrides}
    />
  );
}

test("표지 소개와 모든 화의 제목·상황 설명을 보여 준다", async () => {
  await renderDetail();

  expect(screen.getByText("Mia의 카페")).toBeVisible();
  expect(
    screen.getByText("매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.")
  ).toBeVisible();
  expect(screen.getByText("카페에서 생긴 일")).toBeVisible();
  expect(
    screen.getByText("잘못 나온 커피를 원하는 커피로 바꿔 보세요")
  ).toBeVisible();
  expect(screen.getByText("계산이 꼬인 아침")).toBeVisible();
});

// 상세는 콘텐츠 소개다. 회차마다 다른 진행이 여기 섞이면 어느 회차의 상태인지
// 먼저 해석해야 한다.
test("진행 상태와 결과 문구를 보여 주지 않는다", async () => {
  await renderDetail();

  expect(screen.queryByTestId("story-progress")).toBeNull();
  expect(screen.queryByText("이어서 하기")).toBeNull();
  expect(screen.queryByText("완료")).toBeNull();
});

test("기록 유무와 관계없이 하단 버튼 하나를 보여 준다", async () => {
  await renderDetail();

  const start = screen.getByTestId("story-start");

  expect(start).toBeVisible();
  expect(screen.getByText("대화 시작하기")).toBeVisible();
});

test("에피소드 행은 눌러서 열 수 없다", async () => {
  await renderDetail();

  expect(screen.getByTestId("story-episode-1")).not.toHaveProp(
    "accessibilityRole",
    "button"
  );
});

test("불러오지 못하면 다시 시도할 수 있고 하단 버튼은 두지 않는다", async () => {
  await renderDetail({ story: undefined });

  expect(screen.getByTestId("story-detail-unavailable")).toBeVisible();
  expect(screen.getByText("다시 시도하기")).toBeVisible();
  expect(screen.queryByTestId("story-start")).toBeNull();
});
