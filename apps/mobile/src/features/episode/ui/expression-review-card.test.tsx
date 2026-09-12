import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import type { SavedExpressionSpot } from "@/features/episode/api/saved-expression";
import {
  type SavedExpressionState,
  SavedExpressionsProvider,
} from "@/features/episode/state/saved-expressions";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { ExpressionReviewCard } from "./expression-review-card";

const CORRECTION: EpisodeCorrection = {
  entries: [
    {
      fixed: "a latte",
      original: "latte",
      pattern: "article",
      why: "한 잔을 말할 때 a를 붙여요.",
    },
  ],
  fixed: "I ordered a latte.",
  messageId: "m1",
  original: "I ordered latte.",
  review: {
    example: "I ordered a sandwich.",
    exampleMeaning: "샌드위치를 주문했어요.",
    meaning: "라테를 주문했어요.",
    situation: "주문한 것을 다시 말할 때",
  },
};

const SPOT: SavedExpressionSpot = { kind: "learning", messageId: "m1" };

function renderCard(state?: SavedExpressionState) {
  const toggle = jest.fn<(spot: SavedExpressionSpot) => void>();

  return {
    toggle,
    view: renderWithHeroUI(
      <SavedExpressionsProvider
        value={{ states: state ? { "m1:learning": state } : {}, toggle }}
      >
        <ExpressionReviewCard correction={CORRECTION} />
      </SavedExpressionsProvider>
    ),
  };
}

test("첫 줄이 상황이고 아래가 영어 문장과 한국어 뜻이다", async () => {
  await renderCard().view;

  expect(screen.getByText("주문한 것을 다시 말할 때")).toBeOnTheScreen();
  expect(screen.getByTestId("expression-card-m1-english")).toHaveTextContent(
    "I ordered a latte."
  );
  expect(screen.getByTestId("expression-card-m1-meaning")).toHaveTextContent(
    "라테를 주문했어요."
  );
});

test("책갈피는 대화의 배울 표현과 같은 자리를 가리킨다", async () => {
  const { toggle, view } = renderCard();
  await view;

  await userEvent.press(screen.getByLabelText("표현 저장"));

  expect(toggle).toHaveBeenCalledWith(SPOT);
});

test("담지 못하면 카드 아래에 실패 줄이 남고 다시 시도할 수 있다", async () => {
  const { toggle, view } = renderCard({ status: "error" });
  await view;

  expect(screen.getByText("표현을 저장하지 못했어요")).toBeOnTheScreen();

  await userEvent.press(screen.getByLabelText("표현 저장 다시 시도"));

  expect(toggle).toHaveBeenCalledWith(SPOT);
});

test("담기지 않은 카드에는 실패 줄이 없다", async () => {
  await renderCard().view;

  expect(screen.queryByTestId("expression-save-failed")).toBeNull();
});
