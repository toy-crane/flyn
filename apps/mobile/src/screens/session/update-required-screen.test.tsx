import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { UpdateRequiredScreen } from "./update-required-screen";

test("업데이트 화면에서 설치와 다시 확인을 고를 수 있다", async () => {
  const openInstall = jest.fn();
  const recheck = jest.fn();
  await renderWithHeroUI(
    <UpdateRequiredScreen
      checkError={false}
      isRechecking={false}
      onOpenInstall={openInstall}
      onRecheck={recheck}
      openError={false}
    />
  );

  expect(
    screen.getByRole("header", { name: "업데이트가 필요해요" })
  ).toBeOnTheScreen();
  const user = userEvent.setup();
  await user.press(screen.getByRole("button", { name: "업데이트하기" }));
  await user.press(screen.getByRole("button", { name: "다시 확인" }));
  expect(openInstall).toHaveBeenCalledTimes(1);
  expect(recheck).toHaveBeenCalledTimes(1);
});

test("재확인 실패를 화면에 알리고 차단 행동은 유지한다", async () => {
  await renderWithHeroUI(
    <UpdateRequiredScreen
      checkError
      isRechecking={false}
      onOpenInstall={jest.fn()}
      onRecheck={jest.fn()}
      openError={false}
    />
  );
  expect(screen.getByText("지금은 확인할 수 없어요")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "다시 확인" })).toBeOnTheScreen();
});
