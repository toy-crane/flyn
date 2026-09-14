import { expect, jest, test } from "@jest/globals";
import { screen, userEvent, within } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StoryRow } from "./story-row";

const TITLE = "Mia의 카페";
const HOOK = "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요";

test("스토리 행은 제목과 소개를 잇는 이름의 버튼 하나이고 누르면 연다", async () => {
  const onPress = jest.fn();
  await renderWithHeroUI(
    <StoryRow
      coverBlurhash={null}
      coverImagePath={null}
      hook={HOOK}
      onPress={onPress}
      testID="row"
      title={TITLE}
    />
  );

  const row = screen.getByRole("button", { name: `${TITLE}, ${HOOK}` });
  expect(row).toBe(screen.getByTestId("row"));
  expect(screen.getAllByRole("button")).toHaveLength(1);

  await userEvent.press(row);

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("스토리 행은 HeroUI ListGroup 행의 제목과 설명으로 그린다", async () => {
  await renderWithHeroUI(
    <StoryRow
      coverBlurhash={null}
      coverImagePath={null}
      hook={HOOK}
      onPress={jest.fn()}
      testID="row"
      title={TITLE}
    />
  );

  const row = within(screen.getByTestId("row"));
  expect(row.getByText(TITLE).props.className).toContain(
    "list-group__item-title"
  );
  expect(row.getByText(HOOK).props.className).toContain(
    "list-group__item-description"
  );
  expect(row.getByText(TITLE).props.numberOfLines).toBe(1);
  expect(row.getByText(HOOK).props.numberOfLines).toBe(2);
});
