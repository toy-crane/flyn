import { render, screen } from "@testing-library/react-native";
import type { MessageFeedback } from "../../lib/message-feedback";
import { FeedbackSheet } from "./feedback-sheet";

const IMPROVABLE: MessageFeedback = {
  delivered: "Sound good. Can you make it oat milk?",
  improvedSentence: "Sounds good. Can you make it with oat milk?",
  messageId: "user-2",
  reasons: [
    "앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요.",
    "무엇으로 만들어 달라고 할 때는 make it with를 써요.",
  ],
  sourceText: "Sound good. Can you make it oat milk?",
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

function edits() {
  return screen
    .getAllByTestId("feedback-improved-edit")
    .map((node) => node.props.children);
}

describe("첨삭 시트", () => {
  it("교정은 개선 문장과 항목별 이유를 보여준다", async () => {
    await render(<FeedbackSheet feedback={IMPROVABLE} />);

    expect(screen.getByText("이렇게 쓰면 더 자연스러워요")).toBeTruthy();
    expect(screen.getByTestId("feedback-improved")).toHaveTextContent(
      "Sounds good. Can you make it with oat milk?"
    );
    expect(
      screen.getByText("앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요.")
    ).toBeTruthy();
    expect(
      screen.getByText("무엇으로 만들어 달라고 할 때는 make it with를 써요.")
    ).toBeTruthy();
  });

  it("밑줄은 개선 문장에서 바뀐 자리에만 있다", async () => {
    await render(<FeedbackSheet feedback={IMPROVABLE} />);

    expect(edits()).toEqual(["s", "with"]);

    for (const node of screen.getAllByTestId("feedback-improved-edit")) {
      expect(node.props.style).toEqual(
        expect.objectContaining({ textDecorationLine: "underline" })
      );
    }
  });

  it("번역은 같은 시트에서 내가 쓴 한글과 전달된 문장을 보여준다", async () => {
    await render(<FeedbackSheet feedback={TRANSLATED} />);

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

  it("아직 05가 붙일 자리라 더 물어보기는 두지 않는다", async () => {
    await render(<FeedbackSheet feedback={IMPROVABLE} />);

    expect(screen.queryByText("더 물어보기")).toBeNull();
  });
});
