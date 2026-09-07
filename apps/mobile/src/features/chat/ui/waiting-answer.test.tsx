import { afterEach, expect, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";

import { mockReducedMotion } from "@/shared/test/reduced-motion";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { WaitingAnswer } from "./waiting-answer";

afterEach(() => {
  mockReducedMotion.isOn = false;
});

test("답변 대기는 문구 없이 점 세 개로 보이고 화면 읽기에는 상태 하나를 제공한다", async () => {
  await renderWithHeroUI(<WaitingAnswer />);

  expect(screen.queryAllByText("Thinking")).toHaveLength(0);
  expect(screen.queryByText("답변을 준비하고 있어요.")).not.toBeOnTheScreen();
  expect(screen.getAllByLabelText("답변을 준비하고 있어요.")).toHaveLength(1);
  expect(screen.getAllByTestId("chat-waiting-dot")).toHaveLength(3);
});
