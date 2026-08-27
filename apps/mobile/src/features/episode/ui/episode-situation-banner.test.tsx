import { expect, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeSituationBanner } from "./episode-situation-banner";

const SITUATION = "잘못 나온 커피를 원하는 커피로 바꿔 보세요";

test("이모지와 문구를 한 줄로 보여 준다", async () => {
  await renderWithHeroUI(
    <EpisodeSituationBanner emoji="☕" text={SITUATION} />
  );

  expect(screen.getByTestId("episode-situation-banner")).toBeOnTheScreen();
  expect(
    screen.getByText("☕", { includeHiddenElements: true })
  ).toBeOnTheScreen();

  const text = screen.getByText(SITUATION);

  expect(text).toBeOnTheScreen();
  expect(text.props.numberOfLines).toBe(1);
});

// 틴트만 깔면 강조색이 투명과 섞인 색이라 아래로 지나가는 말풍선이 비쳐
// 글씨가 겹쳐 읽힌다. 실제 기기에서 그렇게 보여 바깥에 배경을 한 겹 깔았다.
test("틴트 아래에 불투명한 배경을 깔아 뒤가 비치지 않게 한다", async () => {
  await renderWithHeroUI(
    <EpisodeSituationBanner emoji="☕" text={SITUATION} />
  );

  const banner = screen.getByTestId("episode-situation-banner");
  const tint = screen.getByText(SITUATION).parent;

  expect(banner.props.className).toContain("bg-background");
  expect(tint?.props.className).toContain("bg-accent-soft");
});

// 문구를 꾸미는 장식이라 낭독에서는 빠져야 한다. 남으면 문장 앞에서 이모지
// 이름이 한 번 더 읽힌다. 접근성 트리에서 빠졌으므로 기본 조회로는 잡히지
// 않고, 숨은 요소까지 뒤져야 나온다.
test("이모지는 낭독에서 빠지고 문구만 남는다", async () => {
  await renderWithHeroUI(
    <EpisodeSituationBanner emoji="☕" text={SITUATION} />
  );

  expect(screen.queryByText("☕")).not.toBeOnTheScreen();

  const emoji = screen.getByText("☕", { includeHiddenElements: true });

  expect(emoji.props.accessibilityElementsHidden).toBe(true);
  expect(emoji.props.importantForAccessibility).toBe("no-hide-descendants");
  expect(screen.getByText(SITUATION)).toBeOnTheScreen();
});
