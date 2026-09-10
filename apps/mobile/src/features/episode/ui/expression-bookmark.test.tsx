import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import type { SavedExpressionSpot } from "@/features/episode/api/saved-expression";
import {
  type SavedExpressionState,
  SavedExpressionsProvider,
} from "@/features/episode/state/saved-expressions";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { savedExpressionLabels } from "./episode-labels";
import { UtteranceExpressionSlot } from "./expression-bookmark";

const SPOT: SavedExpressionSpot = {
  kind: "utterance",
  messageId: "s1",
  utteranceAt: 1,
};

function renderSlot(state?: SavedExpressionState, isArriving = false) {
  const toggle = jest.fn<(spot: SavedExpressionSpot) => void>();
  const view = renderWithHeroUI(
    <SavedExpressionsProvider
      value={{ states: state ? { "s1:1": state } : {}, toggle }}
    >
      <UtteranceExpressionSlot at={1} isArriving={isArriving} messageId="s1">
        <Text>Next in line, please!</Text>
      </UtteranceExpressionSlot>
    </SavedExpressionsProvider>
  );

  return { toggle, view };
}

test("담지 않은 자리는 담기를 권하고 누르면 그 자리를 담는다", async () => {
  const { toggle, view } = renderSlot();
  await view;

  const bookmark = screen.getByLabelText(savedExpressionLabels.save);
  await userEvent.press(bookmark);

  expect(toggle).toHaveBeenCalledWith(SPOT);
  expect(screen.queryByTestId("expression-save-failed")).toBeNull();
});

test("담긴 자리는 취소를 권하고 담긴 것으로 읽힌다", async () => {
  const { view } = renderSlot({ id: "saved-1", status: "saved" });
  await view;

  expect(
    screen.getByLabelText(savedExpressionLabels.unsave).props.accessibilityState
  ).toMatchObject({ selected: true });
});

// 장면이 흐르는 동안은 그 메시지가 아직 계정에 없다. 자리를 비우면 책갈피가
// 나타났다 사라지는 것처럼 보이므로, 흐리게 두고 누르지 못하게 한다.
test("장면이 도착하는 중이면 자리는 지키되 누를 수 없다", async () => {
  const { toggle, view } = renderSlot(undefined, true);
  await view;

  const bookmark = screen.getByTestId("expression-bookmark");

  expect(bookmark.props.accessibilityState).toMatchObject({ disabled: true });
  await userEvent.press(bookmark);
  expect(toggle).not.toHaveBeenCalled();
});

test("장면이 다 오면 같은 자리에서 담을 수 있다", async () => {
  const { toggle, view } = renderSlot();
  await view;

  await userEvent.press(screen.getByTestId("expression-bookmark"));

  expect(toggle).toHaveBeenCalledWith(SPOT);
});

test("담는 동안에는 다시 눌리지 않는다", async () => {
  const { toggle, view } = renderSlot({ status: "saving" });
  await view;

  const bookmark = screen.getByTestId("expression-bookmark");

  expect(bookmark.props.accessibilityState).toMatchObject({
    busy: true,
    disabled: true,
  });

  await userEvent.press(bookmark);

  expect(toggle).not.toHaveBeenCalled();
});

test("담지 못하면 그 자리에 한 줄이 남고 다시 시도할 수 있다", async () => {
  const { toggle, view } = renderSlot({ status: "error" });
  await view;

  expect(screen.getByTestId("expression-save-failed")).toBeVisible();
  expect(screen.getByText(savedExpressionLabels.saveFailed)).toBeVisible();

  await userEvent.press(screen.getByLabelText(savedExpressionLabels.saveRetry));

  expect(toggle).toHaveBeenCalledWith(SPOT);
});
