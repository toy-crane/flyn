import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { UpdateRequiredScreen } from "./update-required-screen";

test("업데이트 화면에서 설치 화면을 열 수 있다", async () => {
  const openInstall = jest.fn();
  await renderWithHeroUI(
    <UpdateRequiredScreen
      checkError={false}
      isRechecking={false}
      onOpenInstall={openInstall}
      openError={false}
    />
  );

  expect(
    screen.getByRole("header", { name: "업데이트가 필요해요" })
  ).toBeOnTheScreen();
  const user = userEvent.setup();
  await user.press(screen.getByRole("button", { name: "업데이트하기" }));
  expect(openInstall).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole("button")).toHaveLength(1);
});

test("자동 확인 실패는 앱을 다시 여는 방법을 안내한다", async () => {
  await renderWithHeroUI(
    <UpdateRequiredScreen
      checkError
      isRechecking={false}
      onOpenInstall={jest.fn()}
      openError={false}
    />
  );
  expect(screen.getByText("지금은 확인할 수 없어요")).toBeOnTheScreen();
  expect(
    screen.getByText("인터넷 연결을 확인하고 앱을 다시 열어 주세요")
  ).toBeOnTheScreen();
  expect(screen.getAllByRole("button")).toHaveLength(1);
});
