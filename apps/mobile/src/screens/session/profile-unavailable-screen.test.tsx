import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { ProfileUnavailableScreen } from "./profile-unavailable-screen";

test("제목은 헤더로 읽히는 h3이고 설명은 보조색 본문이다", async () => {
  await renderWithHeroUI(
    <ProfileUnavailableScreen isRetrying={false} onRetry={jest.fn()} />
  );

  expect(
    screen.getByRole("header", { name: "잠시 후 다시 시도해 주세요" }).props
      .className
  ).toContain("text__root--type-h3");
  expect(
    screen.getByText("프로필을 불러오지 못했어요").props.className
  ).toContain("text__root--color-muted");
});

test("다시 불러오는 동안 버튼에서 진행 상태를 알리고 중복 실행을 막는다", async () => {
  const onRetry = jest.fn();

  await renderWithHeroUI(
    <ProfileUnavailableScreen isRetrying onRetry={onRetry} />
  );

  const button = screen.getByRole("button", {
    name: "프로필 다시 불러오기",
  });

  expect(button).toBeBusy();
  expect(button).toBeDisabled();

  await userEvent.setup().press(button);

  expect(onRetry).not.toHaveBeenCalled();
});
