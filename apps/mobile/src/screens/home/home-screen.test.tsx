import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { Season } from "@/features/episode/api/season";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { HomeScreen } from "./home-screen";

const ANY_START_BUTTON = /시작하기/;
const COMPLETION = {
  copy: "다섯 번의 사건을 영어로 지나왔어요. 다음 시즌을 준비하고 있어요.",
  title: "시즌 1을 끝냈어요",
};

function createSeason(partial: Partial<Season> = {}): Season {
  return {
    completion: COMPLETION,
    finished: [],
    next: {
      episode: 1,
      preview:
        "주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.",
      situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
      situationEmoji: "☕",
      title: "카페에서 생긴 일",
    },
    season: 1,
    total: 5,
    ...partial,
  };
}

// 시작 전. 고를 것 없이 첫 화 하나만 있다.
test("아무것도 끝내지 않았으면 첫 화 하나만 내놓는다", async () => {
  const user = userEvent.setup();
  const startEpisode = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onRetry={jest.fn()}
      onStartEpisode={startEpisode}
      season={createSeason()}
    />
  );

  expect(screen.getByTestId("home-scroll")).toHaveProp(
    "contentInsetAdjustmentBehavior",
    "automatic"
  );
  expect(screen.getByText("시즌 1의 첫 이야기")).toBeOnTheScreen();
  expect(screen.getByText("1화 · 카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-season-record")).not.toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "1화 시작하기" }));

  expect(startEpisode).toHaveBeenCalledTimes(1);
});

// 진행 중. 이어 하기 카드와 지금까지의 기록이 함께 남는다.
test("진행 중이면 다음 화 예고와 끝낸 화 목록을 함께 보여 준다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onRetry={jest.fn()}
      onStartEpisode={jest.fn()}
      season={createSeason({
        finished: [
          {
            episode: 1,
            kind: "성공",
            outcome: "원하던 커피를 새로 받아냈다.",
            title: "카페에서 생긴 일",
          },
        ],
        next: {
          episode: 2,
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
  expect(screen.getByTestId("home-season-progress")).toBeOnTheScreen();
  // 끝낸 화는 결말과 함께 남는다.
  expect(screen.getByText("카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.getByText("성공")).toBeOnTheScreen();
});

// 완주. 새로 시작할 화가 없다.
test("다 끝냈으면 완주 카드와 다섯 화의 기록만 남는다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onRetry={jest.fn()}
      onStartEpisode={jest.fn()}
      season={createSeason({
        finished: [1, 2, 3, 4, 5].map((episode) => ({
          episode,
          kind: "성공",
          outcome: `${episode}화를 끝냈다.`,
          title: `${episode}화의 이야기`,
        })),
        next: null,
      })}
    />
  );

  expect(screen.getByTestId("home-season-done")).toBeOnTheScreen();
  expect(screen.getByText(COMPLETION.title)).toBeOnTheScreen();
  expect(screen.getByText("5화 모두 완료")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-next-episode")).not.toBeOnTheScreen();
  expect(screen.queryByText(ANY_START_BUTTON)).not.toBeOnTheScreen();
});

// 잠깐 기다리는 것은 실패가 아니다. 읽는 중에 실패라고 알리면 아무 문제가
// 없는데도 사용자가 다시 시도를 누른다.
test("시즌을 읽는 중에는 실패를 알리지 않는다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      isLoading={true}
      onRetry={jest.fn()}
      onStartEpisode={jest.fn()}
      season={undefined}
    />
  );

  expect(screen.queryByTestId("home-empty")).not.toBeOnTheScreen();
});

// 시즌을 읽지 못하면 홈에 아무것도 없다. 앱을 다시 켜는 것 말고 할 수 있는
// 일을 남긴다.
test("시즌을 읽지 못했으면 다시 시도할 길을 준다", async () => {
  const user = userEvent.setup();
  const retry = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      onRetry={retry}
      onStartEpisode={jest.fn()}
      season={undefined}
    />
  );

  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(retry).toHaveBeenCalledTimes(1);
});
