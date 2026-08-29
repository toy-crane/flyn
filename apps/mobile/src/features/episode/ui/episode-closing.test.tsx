import { afterEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeClosing } from "./episode-closing";

const ENDING = { kind: "타협", outcome: "새 커피 대신 쿠폰을 받았다." };
const NEXT_EPISODE = {
  copy: "다음 날 아침이에요. 계산대 앞에서 카드가 자꾸 튕겨요.",
  episodeId: "11000000-0000-4000-8000-000000000002",
  number: 2,
  title: "계산이 꼬인 아침",
};
const STORY_DONE = {
  copy: "다섯 번의 사건을 영어로 지나왔어요.",
  episodeId: null,
  number: null,
  title: "첫 이야기를 끝냈어요",
};

afterEach(() => {
  jest.useRealTimers();
});

test("결말과 다음 이야기 예고를 함께 보여 주고 갈 곳 두 군데를 준다", async () => {
  const user = userEvent.setup();
  const leave = jest.fn();
  const startNext = jest.fn();

  await renderWithHeroUI(
    <EpisodeClosing
      ending={ENDING}
      nextUp={NEXT_EPISODE}
      onLeave={leave}
      onStartNext={startNext}
    />
  );

  expect(screen.getByTestId("episode-closing-outcome")).toHaveTextContent(
    "새 커피 대신 쿠폰을 받았다."
  );
  expect(screen.queryByText("타협")).not.toBeOnTheScreen();
  expect(screen.getByText("2화 · 계산이 꼬인 아침")).toBeOnTheScreen();
  expect(screen.getByText(NEXT_EPISODE.copy)).toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "2화 시작하기" }));
  await user.press(screen.getByRole("button", { name: "홈으로 가기" }));

  expect(startNext).toHaveBeenCalledTimes(1);
  expect(startNext).toHaveBeenCalledWith(NEXT_EPISODE.episodeId);
  expect(leave).toHaveBeenCalledTimes(1);
});

// 마지막 화 뒤에는 열 화가 없다. 예고 자리에 완주 안내가 들어서고 갈 곳도
// 홈 하나뿐이다.
test("스토리의 마지막 화에서는 완주 안내를 보여 주고 홈으로만 보낸다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      ending={{ kind: "성공", outcome: "제대로 인사를 건넸다." }}
      nextUp={STORY_DONE}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
    />
  );

  expect(screen.getByText("첫 이야기를 끝냈어요")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "홈으로 가기" })).toBeOnTheScreen();
  expect(screen.queryByText("다음 이야기")).not.toBeOnTheScreen();
});

// 한 번 난 결말은 그 스토리의 사실로 남는다. 같은 화를 다시 여는 길을 두지 않는다.
test("다시 시작하는 길을 두지 않는다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      ending={ENDING}
      nextUp={NEXT_EPISODE}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
    />
  );

  expect(
    screen.queryByRole("button", { name: "다시 시작하기" })
  ).not.toBeOnTheScreen();
});

// 다시 여는 기록에는 할 수 있는 일이 없다. 끝 표시와 결과 한 줄로 닫고,
// 읽기 전용이라는 안내도 두지 않는다. 입력창이 없다는 것으로 충분하다.
test("다시 보는 대화는 끝 표시와 결과 한 줄로 닫는다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      ending={ENDING}
      nextUp={NEXT_EPISODE}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
      readOnly
    />
  );

  expect(screen.getByTestId("episode-ending-mark")).toBeOnTheScreen();
  expect(screen.getByText("끝")).toBeOnTheScreen();
  expect(screen.getByTestId("episode-ending-outcome")).toHaveTextContent(
    "새 커피 대신 쿠폰을 받았다."
  );
  expect(screen.queryByText("끝난 대화 기록")).not.toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "홈으로 가기" })
  ).not.toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "2화 시작하기" })
  ).not.toBeOnTheScreen();
});

test("결말 뒤 저장이 1초를 넘기면 마무리 안에서 진행 상태를 보여 준다", async () => {
  jest.useFakeTimers();

  await renderWithHeroUI(
    <EpisodeClosing
      ending={ENDING}
      isSettling
      nextUp={NEXT_EPISODE}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
    />
  );

  expect(screen.queryByRole("progressbar")).not.toBeOnTheScreen();

  await act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(
    screen.getByRole("progressbar", { name: "진행을 저장하고 있어요" })
  ).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "홈으로 가기" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "2화 시작하기" })).toBeDisabled();
});

test("다음 화를 여는 동안 그 버튼에만 진행 상태를 두고 다른 길도 잠근다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      ending={ENDING}
      isStartingNext
      nextUp={NEXT_EPISODE}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
    />
  );

  expect(screen.getByRole("button", { name: "2화 시작하기" })).toHaveProp(
    "accessibilityState",
    { busy: true, disabled: true }
  );
  expect(screen.getByRole("button", { name: "홈으로 가기" })).toBeDisabled();
});
