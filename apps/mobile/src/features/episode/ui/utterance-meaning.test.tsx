import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { UtteranceMeaningsProvider } from "@/features/episode/state/utterance-meanings";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import {
  UtteranceMeaningFailure,
  UtteranceMeaningLine,
  UtteranceTranslationButton,
} from "./utterance-meaning";

const spot = { dialogueIndex: 0, messageId: "s1" };
test("뜻은 펼치는 동작 없이 보이고 링크만 그 대사를 출처로 연다", async () => {
  const ask = jest.fn();
  const toggle = jest.fn();
  await renderWithHeroUI(
    <UtteranceMeaningsProvider
      value={{
        ask,
        states: {
          "s1:0": {
            meaning: "다음 손님, 오세요!",
            shown: true,
            status: "ready",
          },
        },
        toggle,
      }}
    >
      <UtteranceTranslationButton spot={spot} />
      <UtteranceMeaningLine
        speaker="Mia"
        spot={spot}
        text="Next in line, please!"
      />
    </UtteranceMeaningsProvider>
  );
  expect(
    screen.getByLabelText("대사 뜻 닫기").props.accessibilityState
  ).toMatchObject({ selected: true });
  expect(screen.queryByText("Next in line, please!")).toBeNull();
  expect(screen.getByLabelText("대사 뜻").props.accessibilityValue).toEqual({
    text: "다음 손님, 오세요!",
  });
  expect(screen.getByText("다음 손님, 오세요!").props.className).toContain(
    "text__root--type-body"
  );
  expect(screen.getByText("다음 손님, 오세요!").props.className).not.toContain(
    "text__root--type-body-sm"
  );
  expect(screen.getByTestId("utterance-meaning").props.onPress).toBeUndefined();
  await userEvent.press(screen.getByLabelText("AI에게 물어보기"));
  expect(ask).toHaveBeenCalledWith({
    ...spot,
    meaning: "다음 손님, 오세요!",
    speaker: "Mia",
    text: "Next in line, please!",
  });
});

test("번역 실패 줄의 다시 시도는 같은 대사를 요청한다", async () => {
  const toggle = jest.fn();
  await renderWithHeroUI(
    <UtteranceMeaningsProvider
      value={{
        ask: jest.fn(),
        states: { "s1:0": { status: "error" } },
        toggle,
      }}
    >
      <UtteranceMeaningFailure spot={spot} />
    </UtteranceMeaningsProvider>
  );
  expect(screen.getByText("대사를 번역하지 못했어요")).toBeTruthy();
  await userEvent.press(screen.getByLabelText("번역 다시 시도"));
  expect(toggle).toHaveBeenCalledWith(spot);
});

test("복원한 뜻은 바로 보이고 이후 여닫기에는 공간과 글이 함께 전환한다", async () => {
  const renderMeaning = (shown: boolean) => (
    <UtteranceMeaningsProvider
      value={{
        ask: jest.fn(),
        states: {
          "s1:0": { meaning: "다음 손님, 오세요!", shown, status: "ready" },
        },
        toggle: jest.fn(),
      }}
    >
      <UtteranceMeaningLine
        speaker="Mia"
        spot={spot}
        text="Next in line, please!"
      />
    </UtteranceMeaningsProvider>
  );
  const view = await renderWithHeroUI(renderMeaning(true));
  expect(
    screen.getByTestId("utterance-meaning").props.entering
  ).toBeUndefined();
  await view.rerender(renderMeaning(false));
  expect(screen.queryByTestId("utterance-meaning")).toBeNull();
  await view.rerender(renderMeaning(true));
  expect(screen.getByTestId("utterance-meaning").props.entering).toBeDefined();
  expect(
    screen.getByTestId("utterance-meaning-motion").props.layout
  ).toBeDefined();
});
