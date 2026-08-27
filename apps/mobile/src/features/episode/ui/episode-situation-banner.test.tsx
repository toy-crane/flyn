import { expect, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeSituationBanner } from "./episode-situation-banner";

test("이모지와 문구를 한 줄로 보여 준다", async () => {
  await renderWithHeroUI(
    <EpisodeSituationBanner
      emoji="☕"
      text="잘못 나온 커피를 원하는 커피로 바꿔 보세요"
    />
  );

  const banner = screen.getByTestId("episode-situation-banner");

  expect(banner).toBeOnTheScreen();
  expect(screen.getByText("☕")).toBeOnTheScreen();
  const text = screen.getByText("잘못 나온 커피를 원하는 커피로 바꿔 보세요");
  expect(text).toBeOnTheScreen();
  expect(text.props.numberOfLines).toBe(1);
});
