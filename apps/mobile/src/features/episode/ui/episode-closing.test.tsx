import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeClosing } from "./episode-closing";

const ENDING = { kind: "타협", outcome: "새 커피 대신 쿠폰을 받았다." };

test("결말 종류와 사건 결과를 보여 주고 갈 곳 두 군데를 준다", async () => {
  const user = userEvent.setup();
  const leave = jest.fn();
  const restart = jest.fn();

  await renderWithHeroUI(
    <EpisodeClosing ending={ENDING} onLeave={leave} onRestart={restart} />
  );

  expect(screen.getByTestId("episode-closing-kind")).toHaveTextContent("타협");
  expect(screen.getByTestId("episode-closing-outcome")).toHaveTextContent(
    "새 커피 대신 쿠폰을 받았다."
  );

  await user.press(screen.getByRole("button", { name: "다시 시작하기" }));
  await user.press(screen.getByRole("button", { name: "홈으로 가기" }));

  expect(restart).toHaveBeenCalledTimes(1);
  expect(leave).toHaveBeenCalledTimes(1);
});
