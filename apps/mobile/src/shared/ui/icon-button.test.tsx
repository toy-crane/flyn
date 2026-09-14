import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { View } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { IconButton } from "./icon-button";

test("아이콘만 있어도 이름을 가진 버튼으로 읽히고 누르면 동작한다", async () => {
  const onPress = jest.fn();

  await renderWithHeroUI(
    <IconButton accessibilityLabel="보내기" onPress={onPress} size="lg">
      <View testID="send-icon" />
    </IconButton>
  );

  const button = screen.getByRole("button", { name: "보내기" });

  expect(button).toBeEnabled();
  expect(button.props.className).not.toContain("element-disabled");

  await userEvent.setup().press(button);

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("비활성이면 HeroUI의 비활성 표현을 쓰고 눌리지 않는다", async () => {
  const onPress = jest.fn();

  await renderWithHeroUI(
    <IconButton
      accessibilityLabel="보내기"
      isDisabled
      onPress={onPress}
      size="lg"
    >
      <View />
    </IconButton>
  );

  const button = screen.getByRole("button", { name: "보내기" });

  expect(button).toBeDisabled();
  expect(button.props.className).toContain("element-disabled");
  expect(button.props.className).not.toContain("opacity-");

  await userEvent.setup().press(button);

  expect(onPress).not.toHaveBeenCalled();
});

test.each([
  { size: "sm" as const, sizeClass: "size-7" },
  { size: "lg" as const, sizeClass: "size-11" },
])(
  "$size 크기는 채팅 컨트롤이 쓰는 고정 원의 크기다",
  async ({ size, sizeClass }) => {
    await renderWithHeroUI(
      <IconButton accessibilityLabel="닫기" onPress={jest.fn()} size={size}>
        <View />
      </IconButton>
    );

    expect(screen.getByRole("button").props.className).toContain(sizeClass);
  }
);
