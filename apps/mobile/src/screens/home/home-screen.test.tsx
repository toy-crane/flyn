import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { ContinueCard, Home } from "@/features/story/api/story";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { HomeScreen } from "./home-screen";

const ANY_START_BUTTON = /시작하기/;
const ENDING_WORDS = /성공|타협|실패/;
const PROGRESS_SENTENCE = /화 중 .*완료/;
const STORY_ID = "10000000-0000-4000-8000-000000000001";

function episodeId(number: number) {
  return `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`;
}

function createCard(partial: Partial<ContinueCard> = {}): ContinueCard {
  return {
    coverEmoji: "☕",
    coverImageUrl: null,
    episodeId: episodeId(1),
    episodeNumber: 1,
    episodeTitle: "카페에서 생긴 일",
    finished: 0,
    hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
    preview:
      "주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.",
    resuming: false,
    storyId: STORY_ID,
    title: "Mia의 카페",
    total: 5,
    ...partial,
  };
}

function createHome(partial: Partial<Home> = {}): Home {
  return {
    continueCard: createCard(),
    firstTime: true,
    others: [],
    ...partial,
  };
}

test("처음 온 사용자에게 첫 이야기 카드 하나만 내놓는다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      home={createHome()}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={openEpisode}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByTestId("home-scroll")).toHaveProp(
    "contentInsetAdjustmentBehavior",
    "automatic"
  );
  expect(screen.getByText("첫 이야기")).toBeOnTheScreen();
  expect(screen.getByText("1화 · 카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-other-stories")).not.toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "1화 시작하기" }));

  expect(openEpisode).toHaveBeenCalledWith(episodeId(1));
});

test("화 사이면 이어 하기 제목과 다음 화의 예고를 보여 준다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      home={createHome({
        continueCard: createCard({
          episodeId: episodeId(3),
          episodeNumber: 3,
          episodeTitle: "자리를 맡아 둔 사이에",
          finished: 2,
          preview:
            "잠깐 자리를 비운 사이, 창가 자리에 다른 사람이 앉아 있어요.",
        }),
        firstTime: false,
      })}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByText("이어 하기")).toBeOnTheScreen();
  expect(screen.getByText("3화 · 자리를 맡아 둔 사이에")).toBeOnTheScreen();
  expect(
    screen.getByText(
      "잠깐 자리를 비운 사이, 창가 자리에 다른 사람이 앉아 있어요."
    )
  ).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "3화 시작하기" })
  ).toBeOnTheScreen();
});

test("진행하다 만 화는 시작이 아니라 이어서 하기로 연다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      home={createHome({
        continueCard: createCard({ finished: 1, resuming: true }),
        firstTime: false,
      })}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByRole("button", { name: "이어서 하기" })).toBeOnTheScreen();
  expect(screen.getByText("진행하던 장면부터 이어가요.")).toBeOnTheScreen();
  expect(screen.queryByText(ANY_START_BUTTON)).not.toBeOnTheScreen();
});

test("진행 중인 스토리가 여럿이면 나머지는 목록 행으로 남는다", async () => {
  const user = userEvent.setup();
  const openEpisode = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      home={createHome({
        firstTime: false,
        others: [
          createCard({
            episodeId: episodeId(2),
            episodeNumber: 2,
            episodeTitle: "계산이 꼬인 아침",
            finished: 1,
            storyId: "10000000-0000-4000-8000-000000000002",
            title: "출장 일주일",
          }),
        ],
      })}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={openEpisode}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByText("진행 중인 스토리")).toBeOnTheScreen();

  await user.press(screen.getByLabelText("출장 일주일"));

  expect(openEpisode).toHaveBeenCalledWith(episodeId(2));
});

test("모두 완주했으면 스토리 탭으로 안내한다", async () => {
  const user = userEvent.setup();
  const openStories = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      home={createHome({ continueCard: null, firstTime: false })}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={openStories}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByTestId("home-done")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-continue-card")).not.toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "스토리 보러 가기" }));

  expect(openStories).toHaveBeenCalledTimes(1);
});

test("진행은 분절 바로만 말하고 결말 낱말은 어디에도 없다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      home={createHome({
        continueCard: createCard({ finished: 2 }),
        firstTime: false,
      })}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByTestId("story-progress")).toHaveProp(
    "accessibilityValue",
    { max: 5, min: 0, now: 2 }
  );
  expect(screen.queryByText(PROGRESS_SENTENCE)).not.toBeOnTheScreen();
  expect(screen.queryByText(ENDING_WORDS)).not.toBeOnTheScreen();
});

test("홈을 읽는 중에는 실패를 알리지 않는다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      home={undefined}
      isLoading
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.queryByTestId("home-empty")).not.toBeOnTheScreen();
});

test("홈을 읽지 못했으면 다시 시도할 길을 준다", async () => {
  const user = userEvent.setup();
  const retry = jest.fn();

  await renderWithHeroUI(
    <HomeScreen
      home={undefined}
      isLoading={false}
      isRetrying={false}
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={retry}
    />
  );

  expect(screen.getByText("이야기를 불러오지 못했어요.")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(retry).toHaveBeenCalledTimes(1);
});

test("홈을 다시 읽는 동안 오류 카드와 버튼 자리를 지킨다", async () => {
  await renderWithHeroUI(
    <HomeScreen
      home={undefined}
      isLoading={false}
      isRetrying
      onOpenEpisode={jest.fn()}
      onOpenStories={jest.fn()}
      onRetry={jest.fn()}
    />
  );

  expect(screen.getByTestId("home-empty")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "다시 시도하기" })).toHaveProp(
    "accessibilityState",
    { busy: true, disabled: true }
  );
});
