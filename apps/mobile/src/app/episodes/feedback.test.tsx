import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../lib/use-episodes", () => ({ useStoredFeedback: jest.fn() }));

import type { MessageFeedback } from "../../lib/message-feedback";
import { useStoredFeedback } from "../../lib/use-episodes";
import { routerStub, setSearchParams } from "../../test-support/expo-router";
import { HeroUIWrapper } from "../../test-support/heroui";
import FeedbackSheetScreen from "./feedback";

const mockUseStoredFeedback = useStoredFeedback as jest.Mock;

const IMPROVABLE: MessageFeedback = {
  delivered: "Sound good. Can you make it oat milk?",
  improvedSentence: "Sounds good. Can you make it with oat milk?",
  messageId: "user-2",
  reasons: [
    "앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요.",
    "무엇으로 만들어 달라고 할 때는 make it with를 써요.",
  ],
  sourceText: null,
  verdict: "improvable",
};

const TRANSLATED: MessageFeedback = {
  delivered: "Could you recommend today's coffee?",
  improvedSentence: null,
  messageId: "user-1",
  reasons: ["추천을 부탁하는 말이라 recommend를 써요."],
  sourceText: "오늘 커피 뭐가 좋아요?",
  verdict: "clear",
};

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderSheet() {
  return render(<FeedbackSheetScreen />, { wrapper: HeroUIWrapper });
}

/*
 * `resetAllMocks`가 아니다 — 그것은 jest-expo가 세운 asset registry 대역까지
 * 지워 브랜드 층 아이콘(Ionicons)이 마운트에 실패한다.
 */
beforeEach(() => {
  jest.clearAllMocks();
  setSearchParams({ episodeId: "episode-1", messageId: "user-2" });
  mockUseStoredFeedback.mockReturnValue([IMPROVABLE]);
});

/** 밑줄이 간 도막만 모은다. */
function edits() {
  return screen
    .getAllByTestId("feedback-improved-edit")
    .map((node) => node.props.children);
}

describe("첨삭 시트 화면", () => {
  it("이미 저장된 판정만 읽어 시트를 연다", async () => {
    await renderSheet();

    expect(mockUseStoredFeedback).toHaveBeenCalledWith("episode-1");
    expect(screen.getByTestId("feedback-improved")).toHaveTextContent(
      "Sounds good. Can you make it with oat milk?"
    );
  });

  it("교정은 개선 문장과 항목별 이유를 보여준다", async () => {
    await renderSheet();

    expect(screen.getByText("이렇게 쓰면 더 자연스러워요")).toBeTruthy();
    expect(
      screen.getByText("앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요.")
    ).toBeTruthy();
    expect(
      screen.getByText("무엇으로 만들어 달라고 할 때는 make it with를 써요.")
    ).toBeTruthy();
  });

  it("밑줄은 개선 문장에서 바뀐 자리에만 있다", async () => {
    await renderSheet();

    expect(edits()).toEqual(["s", "with"]);

    for (const node of screen.getAllByTestId("feedback-improved-edit")) {
      // 밑줄과 그 색은 토큰 클래스가 나른다 — jest는 Metro를 거치지 않아
      // 클래스가 스타일로 풀리지 않으므로 클래스 자체를 단언한다.
      expect(node.props.className).toContain("underline");
      expect(node.props.className).toContain("decoration-accent");
    }
  });

  it("번역은 같은 시트에서 내가 쓴 한글과 전달된 문장을 보여준다", async () => {
    setSearchParams({ episodeId: "episode-1", messageId: "user-1" });
    mockUseStoredFeedback.mockReturnValue([TRANSLATED]);

    await renderSheet();

    expect(screen.getByText("내가 쓴 한글")).toBeTruthy();
    expect(screen.getByText("오늘 커피 뭐가 좋아요?")).toBeTruthy();
    expect(screen.getByText("이렇게 전달됐어요")).toBeTruthy();
    expect(
      screen.getByText("Could you recommend today's coffee?")
    ).toBeTruthy();
    expect(
      screen.getByText("추천을 부탁하는 말이라 recommend를 써요.")
    ).toBeTruthy();
    // 교정 시트의 자리를 함께 쓰지 않는다 — 같은 시트지만 내용이 다르다.
    expect(screen.queryByText("이렇게 쓰면 더 자연스러워요")).toBeNull();
    expect(screen.queryByTestId("feedback-improved-edit")).toBeNull();
  });

  it("`더 물어보기`는 시트를 닫고 그 문장의 질문 화면을 push한다", async () => {
    await renderSheet();

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

  it("번역 시트에도 같은 자리에 `더 물어보기`가 선다", async () => {
    setSearchParams({ episodeId: "episode-1", messageId: "user-1" });
    mockUseStoredFeedback.mockReturnValue([TRANSLATED]);

    await renderSheet();

    expect(screen.getByLabelText("더 물어보기")).toBeTruthy();
  });

  it("읽어 둔 판정이 없으면 대화 화면으로 돌려보낸다", async () => {
    mockUseStoredFeedback.mockReturnValue(undefined);

    await renderSheet();

    expect(screen.getByText("대화 화면에서 다시 열어 주세요.")).toBeTruthy();
    expect(screen.queryByTestId("feedback-sheet")).toBeNull();
  });
});
