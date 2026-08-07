import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("react-native-safe-area-context", () => ({
  // HeroUI provider가 이 모듈에서 함께 가져다 쓴다 — 통째로 대체하면 provider가
  // 렌더되지 않는다.
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

import { HeroUIWrapper } from "../../test-support/heroui";
import { ChatMarkdown } from "./chat-markdown";

/** HeroUI `Typography`가 내는 글자 크기 preset 클래스. */
const TYPOGRAPHY_TYPE_CLASS = /text__root--type-/;

/** HeroUI `Typography`는 provider 아래에서만 선다. */
function renderMarkdown(markdown: string) {
  return render(<ChatMarkdown>{markdown}</ChatMarkdown>, {
    wrapper: HeroUIWrapper,
  });
}

describe("AI 응답 Markdown", () => {
  it("필수 텍스트 서식과 표를 네이티브 컴포넌트로 렌더링한다", async () => {
    await renderMarkdown(
      "# 제목\n\n**굵게**와 *기울임*\n\n- 첫 항목\n- 둘째 항목\n\n`inline`\n\n```ts\nconst answer = 42;\n```\n\n| 열 | 값 |\n| --- | --- |\n| A | B |"
    );

    expect(screen.getByText("제목")).toBeTruthy();
    expect(screen.getByText("굵게")).toBeTruthy();
    expect(screen.getByText("첫 항목")).toBeTruthy();
    expect(screen.getByText("inline")).toBeTruthy();
    expect(screen.getByText("const answer = 42;")).toBeTruthy();
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("링크는 시스템 브라우저로 열고 이미지는 표시하지 않는다", async () => {
    const openUrl = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValueOnce(undefined);

    await renderMarkdown(
      "[공식 문서](https://example.com)\n\n![이미지](https://example.com/a.png)"
    );

    fireEvent.press(screen.getByRole("link", { name: "공식 문서" }));

    expect(openUrl).toHaveBeenCalledWith("https://example.com");
    expect(screen.queryByLabelText("이미지")).toBeNull();
  });

  it("본문 서식은 HeroUI 토큰 클래스가 나른다", async () => {
    await renderMarkdown("[공식 문서](https://example.com)");

    // 색을 직접 칠하지 않고 의미 토큰 클래스만 얹는다
    // (docs/decisions/uniwind-css-theme.md).
    expect(
      screen.getByRole("link", { name: "공식 문서" }).props.className
    ).toContain("text-accent");
  });

  it("제목 안의 굵은 글씨는 제목 크기를 그대로 물려받는다", async () => {
    await renderMarkdown("# 제목 안 **굵게**");

    const heading = screen.getByRole("header");
    const bold = screen.getByText("굵게");

    // 제목은 h3(24px)로 서고, 그 안의 굵은 글씨는 굵기만 얹는다. HeroUI
    // `Typography`는 언제나 `type` 클래스를 내고 기본이 body(16px)라, 중첩된
    // 자식이 그 클래스를 다시 내면 RN에서는 자식 크기가 이겨 24px가 16px로
    // 내려앉는다.
    expect(heading.props.className).toContain("text__root--type-h3");
    expect(bold.props.className).toContain("font-bold");
    expect(bold.props.className).not.toMatch(TYPOGRAPHY_TYPE_CLASS);
  });

  it("표 칸 안의 서식은 칸의 작은 글자 크기를 그대로 물려받는다", async () => {
    await renderMarkdown("| 열 | 값 |\n| --- | --- |\n| **굵게** | *기울임* |");

    const bold = screen.getByText("굵게");
    const italic = screen.getByText("기울임");

    // 칸 본문은 body-sm(14px)다. 안쪽 서식이 자기 `type`을 내면 16px로 튄다.
    expect(bold.props.className).toContain("font-bold");
    expect(bold.props.className).not.toMatch(TYPOGRAPHY_TYPE_CLASS);
    expect(italic.props.className).toContain("italic");
    expect(italic.props.className).not.toMatch(TYPOGRAPHY_TYPE_CLASS);
    expect(screen.getByText("값").props.className).toContain(
      "text__root--type-body-sm"
    );
  });
});
