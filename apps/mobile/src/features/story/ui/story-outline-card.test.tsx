import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { type StoryOutline, StoryOutlineCard } from "./story-outline-card";

const outline: StoryOutline = {
  characters: [
    { name: "Emma", position: 1, role: "40대 편집자. 조용히 쉬고 싶어 한다." },
  ],
  cover: "A woman in her forties, close-up, head tilted, teal background",
  episodes: [
    {
      cast: ["Emma"],
      details: "고함치지 않는 승객에게 이해를 구한다.",
      number: 1,
      preview: "아기가 울고 옆자리 승객이 한숨을 쉬어요",
      title: "옆자리의 한숨",
    },
  ],
  hook: "아기를 달래고 있는데 옆자리의 시선이 느껴져요",
  title: "옆자리의 한숨",
};

test("표지 자리 없이 한 화를 확정하거나 추가 인터뷰를 선택한다", async () => {
  const onAdd = jest.fn();
  const onStart = jest.fn();
  await renderWithHeroUI(
    <StoryOutlineCard onAdd={onAdd} onStart={onStart} outline={outline} />
  );
  expect(
    screen.queryByTestId("story-outline-cover", { includeHiddenElements: true })
  ).not.toBeOnTheScreen();
  const user = userEvent.setup();
  await user.press(screen.getByRole("button", { name: "에피소드 추가하기" }));
  expect(onAdd).toHaveBeenCalledTimes(1);
  expect(onStart).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "스토리 만들기" })).toBeEnabled();
});

test("다섯 화에서는 추가만 막고 인터뷰 중에는 두 행동을 막는다", async () => {
  const [episode] = outline.episodes;
  if (!episode) {
    throw new Error("에피소드 예시가 없습니다.");
  }
  const full = {
    ...outline,
    episodes: Array.from({ length: 5 }, (_, at) => ({
      ...episode,
      number: at + 1,
    })),
  };
  const view = await renderWithHeroUI(
    <StoryOutlineCard onAdd={jest.fn()} onStart={jest.fn()} outline={full} />
  );
  expect(
    screen.getByRole("button", { name: "에피소드 추가하기" })
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "스토리 만들기" })).toBeEnabled();
  await view.rerender(
    <StoryOutlineCard
      isDisabled
      onAdd={jest.fn()}
      onStart={jest.fn()}
      outline={outline}
    />
  );
  expect(
    screen.getByRole("button", { name: "에피소드 추가하기" })
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "스토리 만들기" })).toBeDisabled();
});
