import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../lib/use-episodes", () => ({ useStoredFeedback: jest.fn() }));

import type { MessageFeedback } from "../../lib/message-feedback";
import { useStoredFeedback } from "../../lib/use-episodes";
import { routerStub, setSearchParams } from "../../test-support/expo-router";
import FeedbackSheetScreen from "./feedback";

const mockUseStoredFeedback = useStoredFeedback as jest.Mock;

const FEEDBACK: MessageFeedback[] = [
  {
    delivered: "Sound good. Can you make it oat milk?",
    improvedSentence: "Sounds good. Can you make it with oat milk?",
    messageId: "user-2",
    reasons: ["앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요."],
    sourceText: null,
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

  it("`더 물어보기`는 시트를 닫고 그 문장의 질문 화면을 push한다", async () => {
    await render(<FeedbackSheetScreen />);

    fireEvent.press(screen.getByTestId("feedback-ask-more"));

    // 시트 위에 시트를 쌓지 않는다 — 닫은 뒤 대화 화면 위로 push한다.
    expect(routerStub.back).toHaveBeenCalledTimes(1);
    expect(routerStub.push).toHaveBeenCalledWith({
      params: { episodeId: "episode-1", messageId: "user-2" },
      pathname: "/episodes/question",
    });
    expect(routerStub.back.mock.invocationCallOrder[0]).toBeLessThan(
      routerStub.push.mock.invocationCallOrder[0] as number
    );
  });

  it("읽어 둔 판정이 없으면 대화 화면으로 돌려보낸다", async () => {
    mockUseStoredFeedback.mockReturnValue(undefined);

    await render(<FeedbackSheetScreen />);

    expect(screen.getByText("대화 화면에서 다시 열어 주세요.")).toBeTruthy();
    expect(screen.queryByTestId("feedback-sheet")).toBeNull();
  });
});
