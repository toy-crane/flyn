import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { StoryDetail, StoryEpisode } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoryDetailScreen } from "./story-detail-screen";

const ENDING_WORDS = /성공|타협|실패/;
const ANY_OPEN_BUTTON = /시작하기|이어서 하기/;
const COMPLETION_COPY = /끝냈어요/;
const STORY_ID = "10000000-0000-4000-8000-000000000001";

function episodeId(number: number) {
  return `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

function finished(
  number: number,
  title: string,
  outcome: string
): StoryEpisode {
  return {
    episodeId: episodeId(number),
    hasTranscript: true,
    number,
    outcome,
    preview: null,
    state: "finished",
    title,
  };
}

function locked(number: number, title: string): StoryEpisode {
  return {
    episodeId: episodeId(number),
    hasTranscript: false,
    number,
    outcome: null,
    preview: null,
    state: "locked",
    title,
  };
}

function createDetail(partial: Partial<StoryDetail> = {}): StoryDetail {
  return {
    coverEmoji: "☕",
    coverImageUrl: null,
    episodes: [
      finished(1, "카페에서 생긴 일", "원하는 커피로 바꿔냈어요."),
      {
        episodeId: episodeId(2),
        hasTranscript: false,
        number: 2,
        outcome: null,
        preview: "계산대 앞에서 카드가 자꾸 튕겨요.",
        state: "next",
        title: "계산이 꼬인 아침",
      },
      locked(3, "자리를 맡아 둔 사이에"),
    ],
    finished: 1,
    hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
    intro: "매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.",
    next: { episodeId: episodeId(2), number: 2, resuming: false },
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 3,
    ...partial,
  };
}

test("끝낸 화의 결과와 다음 화의 예고를 보여 주고 잠긴 화는 제목만 남긴다", async () => {
  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={createDetail()}
    />
  );

  expect(screen.getByText("에피소드 목록")).toBeOnTheScreen();
  expect(screen.getByText("원하는 커피로 바꿔냈어요.")).toBeOnTheScreen();
  expect(
    screen.getByText("계산대 앞에서 카드가 자꾸 튕겨요.")
  ).toBeOnTheScreen();
  expect(screen.getByText("자리를 맡아 둔 사이에")).toBeOnTheScreen();
  expect(
    screen.getByLabelText("3화 자리를 맡아 둔 사이에, 아직 열리지 않았어요")
  ).toBeOnTheScreen();
  expect(screen.queryByText(ENDING_WORDS)).not.toBeOnTheScreen();
});

test("다음 화는 버튼으로도 행으로도 열린다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={openEpisode}
      onRetry={jest.fn()}
      story={createDetail()}
    />
  );

  await user.press(screen.getByRole("button", { name: "2화 시작하기" }));
  await user.press(screen.getByTestId("story-episode-2"));

  expect(openEpisode).toHaveBeenCalledTimes(2);
  expect(openEpisode).toHaveBeenCalledWith(episodeId(2));
});

test("대화 기록이 남은 끝낸 화는 다시 열 수 있다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={openEpisode}
      onRetry={jest.fn()}
      story={createDetail()}
    />
  );

  await user.press(
    screen.getByRole("button", { name: "1화 카페에서 생긴 일, 대화 보기" })
  );

  expect(openEpisode).toHaveBeenCalledWith(episodeId(1));
});

test("시작 전 스토리는 진행 바 대신 화 수를 센다", async () => {
  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={createDetail({
        episodes: [
          {
            episodeId: episodeId(1),
            hasTranscript: false,
            number: 1,
            outcome: null,
            preview: "주문과 다른 커피가 나왔어요.",
            state: "next",
            title: "카페에서 생긴 일",
          },
          locked(2, "계산이 꼬인 아침"),
          locked(3, "자리를 맡아 둔 사이에"),
        ],
        finished: 0,
        next: { episodeId: episodeId(1), number: 1, resuming: false },
      })}
    />
  );

  expect(screen.getByText("에피소드 3개")).toBeOnTheScreen();
  expect(screen.queryByTestId("story-progress")).not.toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "1화 시작하기" })
  ).toBeOnTheScreen();
});

test("완주한 스토리에는 시작 버튼도 완주 안내 카드도 없다", async () => {
  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={createDetail({
        episodes: [
          finished(1, "카페에서 생긴 일", "원하는 커피로 바꿔냈어요."),
          finished(2, "계산이 꼬인 아침", "현금으로 냈어요."),
          finished(3, "자리를 맡아 둔 사이에", "자리를 되찾았어요."),
        ],
        finished: 3,
        next: null,
      })}
    />
  );

  expect(screen.getByTestId("story-progress")).toHaveProp(
    "accessibilityValue",
    { max: 3, min: 0, now: 3 }
  );
  expect(screen.queryByText(ANY_OPEN_BUTTON)).not.toBeOnTheScreen();
  expect(screen.queryByText(COMPLETION_COPY)).not.toBeOnTheScreen();
});

test("스토리를 읽지 못했으면 다시 시도할 길을 준다", async () => {
  const user = userEvent.setup();
  const retry = jest.fn();

  await renderWithHeroUI(
    <StoryDetailScreen
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onRetry={retry}
      story={undefined}
    />
  );

  expect(screen.getByTestId("story-detail-empty")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(retry).toHaveBeenCalledTimes(1);
});
