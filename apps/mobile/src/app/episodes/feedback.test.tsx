import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../lib/use-episodes", () => ({ useStoredFeedback: jest.fn() }));

import type { MessageFeedback } from "../../lib/message-feedback";
import { useStoredFeedback } from "../../lib/use-episodes";
import { setSearchParams } from "../../test-support/expo-router";
import FeedbackSheetScreen from "./feedback";

const mockUseStoredFeedback = useStoredFeedback as jest.Mock;

const FEEDBACK: MessageFeedback[] = [
  {
    delivered: "Sound good. Can you make it oat milk?",
    improvedSentence: "Sounds good. Can you make it with oat milk?",
    messageId: "user-2",
    reasons: ["앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요."],
    sourceText: "Sound good. Can you make it oat milk?",
    verdict: "improvable",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  setSearchParams({ episodeId: "episode-1", messageId: "user-2" });
  mockUseStoredFeedback.mockReturnValue(FEEDBACK);
});

describe("첨삭 시트 화면", () => {
  it("이미 저장된 판정만 읽어 시트를 연다", async () => {
    await render(<FeedbackSheetScreen />);

    expect(mockUseStoredFeedback).toHaveBeenCalledWith("episode-1");
    expect(screen.getByTestId("feedback-improved")).toHaveTextContent(
      "Sounds good. Can you make it with oat milk?"
    );
  });

  it("읽어 둔 판정이 없으면 대화 화면으로 돌려보낸다", async () => {
    mockUseStoredFeedback.mockReturnValue(undefined);

    await render(<FeedbackSheetScreen />);

    expect(screen.getByText("대화 화면에서 다시 열어 주세요.")).toBeTruthy();
    expect(screen.queryByTestId("feedback-sheet")).toBeNull();
  });
});
