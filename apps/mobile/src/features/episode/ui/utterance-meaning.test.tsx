import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { UtteranceMeaningsProvider } from "@/features/episode/state/utterance-meanings";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import {
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
      <UtteranceMeaningLine
        speaker="Mia"
        spot={spot}
        text="Next in line, please!"
      />
    </UtteranceMeaningsProvider>
  );
  expect(screen.getByText("대사를 번역하지 못했어요")).toBeTruthy();
  await userEvent.press(screen.getByLabelText("번역 다시 시도"));
  expect(toggle).toHaveBeenCalledWith(spot);
});
