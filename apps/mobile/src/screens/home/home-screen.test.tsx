import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { HomeScreen } from "./home-screen";

const summary = /주문과 다른 커피가 나왔는데/;

test("에피소드 하나를 이름과 상황과 함께 내놓고 고를 것을 두지 않는다", async () => {
  const user = userEvent.setup();
  const startEpisode = jest.fn();

  await renderWithHeroUI(<HomeScreen onStartEpisode={startEpisode} />);

  expect(screen.getByTestId("home-scroll")).toHaveProp(
    "contentInsetAdjustmentBehavior",
    "automatic"
  );
  expect(screen.getByText("카페에서 생긴 일")).toBeOnTheScreen();
  expect(screen.getByText(summary)).toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "에피소드 시작하기" }));

  expect(startEpisode).toHaveBeenCalledTimes(1);
});
