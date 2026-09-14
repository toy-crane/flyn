import { expect, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { SetupNeededScreen } from "./setup-needed-screen";

/** `body-sm`이나 `body-xs`가 아니라 본문 `body` 그 자체. */
const BODY_TYPE = /\btext__root--type-body(\s|$)/;

test("제목은 헤더로 읽히는 h3이고 설명은 보조색 본문이다", async () => {
  await renderWithHeroUI(<SetupNeededScreen problem="환경 값이 없어요" />);

  expect(
    screen.getByRole("header", { name: "앱 설정이 끝나지 않았어요" }).props
      .className
  ).toContain("text__root--type-h3");

  const problem = screen.getByText("환경 값이 없어요");
  expect(problem.props.className).toMatch(BODY_TYPE);
  expect(problem.props.className).toContain("text__root--color-muted");
  expect(problem).toHaveProp("selectable", true);
});
