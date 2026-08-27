import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { Story } from "@/features/episode/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { HomeScreen } from "./home-screen";

const ANY_START_BUTTON = /시작하기/;
const SEASON_WORD = /시즌/;
const STORY_ID = "10000000-0000-4000-8000-000000000001";
const EPISODE_ID = "11000000-0000-4000-8000-000000000001";
const COMPLETION = {
  copy: "다섯 번의 사건을 영어로 지나왔어요.",
  title: "첫 이야기를 끝냈어요",
};

function episodeId(number: number) {
  return `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

function createStory(partial: Partial<Story> = {}): Story {
  return {
    completion: COMPLETION,
    finished: [],
    id: STORY_ID,
    next: {
      episodeId: EPISODE_ID,
      number: 1,
      preview:
        "주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.",
      situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
      situationEmoji: "☕",
      title: "카페에서 생긴 일",
    },
    targetLanguage: "en",
    title: "Mia의 카페",
    total: 5,
    ...partial,
  };
}

test("아무것도 끝내지 않았으면 첫 에피소드 하나만 내놓는다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onOpenEpisode={openEpisode}
      onRetry={jest.fn()}
      story={createStory()}
    />
  );

  expect(screen.getByTestId("home-scroll")).toHaveProp(
    "contentInsetAdjustmentBehavior",
    "automatic"
  );
  expect(screen.getByText("첫 이야기")).toBeOnTheScreen();
  expect(screen.getByText("1화 · 카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-story-record")).not.toBeOnTheScreen();
  expect(screen.queryByText(SEASON_WORD)).not.toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "1화 시작하기" }));

  expect(openEpisode).toHaveBeenCalledWith(EPISODE_ID);
});

test("진행 중이면 다음 에피소드와 끝낸 목록을 함께 보여 준다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={createStory({
        finished: [
          {
            episodeId: episodeId(1),
            hasTranscript: false,
            kind: "성공",
            number: 1,
            outcome: "원하던 커피를 새로 받아냈다.",
            title: "카페에서 생긴 일",
          },
        ],
        next: {
          episodeId: episodeId(2),
          number: 2,
          preview: "다음 날 아침이에요. 계산대 앞에서 카드가 자꾸 튕겨요.",
          situation: "다른 방법을 찾아 계산을 끝내 보세요",
          situationEmoji: "💳",
          title: "계산이 꼬인 아침",
        },
      })}
    />
  );

  expect(screen.getByText("다음 이야기")).toBeOnTheScreen();
  expect(screen.getByText("2화 · 계산이 꼬인 아침")).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "2화 시작하기" })
  ).toBeOnTheScreen();
  expect(screen.getByText("5화 중 1화 완료")).toBeOnTheScreen();
  expect(screen.getByTestId("home-story-progress")).toBeOnTheScreen();
  expect(screen.getByText("카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.getByText("성공")).toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "1화 대화 보기" })
  ).not.toBeOnTheScreen();
});

test("다 끝냈으면 완주 카드와 다섯 에피소드의 기록만 남는다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={createStory({
        finished: [1, 2, 3, 4, 5].map((number) => ({
          episodeId: episodeId(number),
          hasTranscript: true,
          kind: "성공",
          number,
          outcome: `${number}화를 끝냈다.`,
          title: `${number}화의 이야기`,
        })),
        next: null,
      })}
    />
  );

  expect(screen.getByTestId("home-story-done")).toBeOnTheScreen();
  expect(screen.getByText(COMPLETION.title)).toBeOnTheScreen();
  expect(screen.getByText("5화 모두 완료")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-next-episode")).not.toBeOnTheScreen();
  expect(screen.queryByText(ANY_START_BUTTON)).not.toBeOnTheScreen();
  expect(screen.queryByText(SEASON_WORD)).not.toBeOnTheScreen();
});

test("스토리를 읽는 중에는 실패를 알리지 않는다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading
      onOpenEpisode={jest.fn()}
      onRetry={jest.fn()}
      story={undefined}
    />
  );

  expect(screen.queryByTestId("home-empty")).not.toBeOnTheScreen();
});

test("스토리를 읽지 못했으면 다시 시도할 길을 준다", async () => {
  const user = userEvent.setup();
  const retry = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onOpenEpisode={jest.fn()}
      onRetry={retry}
      story={undefined}
    />
  );

  expect(screen.getByText("이야기를 불러오지 못했어요.")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(retry).toHaveBeenCalledTimes(1);
});

test("대화 기록이 있는 끝난 에피소드는 다시 열 수 있다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onOpenEpisode={openEpisode}
      onRetry={jest.fn()}
      story={createStory({
        finished: [
          {
            episodeId: EPISODE_ID,
            hasTranscript: true,
            kind: "성공",
            number: 1,
            outcome: "새 잔을 받아냈다.",
            title: "카페에서 생긴 일",
          },
        ],
      })}
    />
  );

  await user.press(screen.getByRole("button", { name: "1화 대화 보기" }));

  expect(openEpisode).toHaveBeenCalledWith(EPISODE_ID);
});
