import { expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { setStringAsync } from "expo-clipboard";
import { StyleSheet, Text } from "react-native";

import type { SavedExpressionSpot } from "@/features/episode/api/saved-expression";
import {
  type SavedExpressionState,
  SavedExpressionsProvider,
} from "@/features/episode/state/saved-expressions";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { episodeLabels, savedExpressionLabels } from "./episode-labels";
import { UtteranceExpressionSlot } from "./expression-bookmark";

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

const mockSetStringAsync = jest.mocked(setStringAsync);

const LINE = "Next in line, please!";

const SPOT: SavedExpressionSpot = {
  kind: "utterance",
  messageId: "s1",
  utteranceAt: 1,
};

function slot(
  toggle: (spot: SavedExpressionSpot) => void,
  state?: SavedExpressionState,
  isArriving = false,
  canSave = true
) {
  return (
    <SavedExpressionsProvider
      value={{ states: state ? { "s1:1": state } : {}, toggle }}
    >
      <UtteranceExpressionSlot
        at={1}
        canSave={canSave}
        isArriving={isArriving}
        messageId="s1"
        text={LINE}
      >
        <Text>{LINE}</Text>
      </UtteranceExpressionSlot>
    </SavedExpressionsProvider>
  );
}

function renderSlot(
  state?: SavedExpressionState,
  isArriving = false,
  canSave = true
) {
  const toggle = jest.fn<(spot: SavedExpressionSpot) => void>();

  return {
    /** 같은 자리를 그대로 두고 회차만 생긴 다음 프레임. */
    rerender: (
      view: Awaited<ReturnType<typeof renderWithHeroUI>>,
      nextCanSave: boolean
    ) => view.rerender(slot(toggle, state, isArriving, nextCanSave)),
    toggle,
    view: renderWithHeroUI(slot(toggle, state, isArriving, canSave)),
  };
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

// 장면이 흐르는 동안은 그 메시지가 아직 계정에 없고 넘어온 글도 자라는 중이다.
// 자리를 비우면 줄이 나타났다 사라지는 것처럼 보이므로, 흐리게 두고 둘 다
// 누르지 못하게 한다.
test("장면이 도착하는 중이면 줄은 자리만 지키고 아무것도 그리지 않는다", async () => {
  mockSetStringAsync.mockClear();
  const { view } = renderSlot(undefined, true);
  await view;

  // 자리는 남아 있어 줄이 나타날 때 말풍선이 밀리지 않는다. 다만 보이지 않고
  // 화면 읽기도 지나친다.
  const row = screen.getByTestId("utterance-actions", {
    includeHiddenElements: true,
  });

  expect(StyleSheet.flatten(row.props.style).opacity).toBe(0);
  expect(row.props.pointerEvents).toBe("none");
  expect(row.props.importantForAccessibility).toBe("no-hide-descendants");
});

test("회차가 없으면 복사만 서고 회차가 생기면 책갈피가 같은 떠오름으로 합류한다", async () => {
  const { rerender, view } = renderSlot(undefined, false, false);
  const rendered = await view;

  expect(screen.getByLabelText(episodeLabels.copyUtterance)).toBeTruthy();
  expect(screen.queryByTestId("expression-bookmark")).toBeNull();

  await rerender(rendered, true);

  expect(screen.getByTestId("expression-bookmark")).toBeTruthy();
  // 줄은 이미 서 있으므로 줄이 아니라 이 아이콘 하나가 떠오른다.
  expect(
    screen.getByTestId("expression-bookmark-join", {
      includeHiddenElements: true,
    }).props.entering
  ).toBeDefined();
});

test("처음부터 책갈피가 있는 줄에서는 아이콘이 따로 떠오르지 않는다", async () => {
  const { view } = renderSlot();

  await view;

  // 2화의 첫 장면과 대화 기록이 이 경우다. 떠오름은 줄이 통째로 맡는다.
  expect(
    screen.getByTestId("expression-bookmark-join", {
      includeHiddenElements: true,
    }).props.entering
  ).toBeUndefined();
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

// 말풍선 아래 줄은 담기와 복사를 나란히 둔다. 장면 전체가 아니라 그 대사
// 하나만 담기므로, 여러 대사가 흐른 장면에서도 누른 자리의 글이 나간다.
test("대사 복사는 그 말풍선의 글만 클립보드에 넣는다", async () => {
  mockSetStringAsync.mockClear();
  const { view } = renderSlot();
  await view;

  await userEvent.press(screen.getByLabelText(episodeLabels.copyUtterance));

  expect(mockSetStringAsync).toHaveBeenCalledWith(LINE);
});
