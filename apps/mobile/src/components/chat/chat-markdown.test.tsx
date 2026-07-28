import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import { ChatMarkdown } from "./chat-markdown";

describe("AI 응답 Markdown", () => {
  it("필수 텍스트 서식과 표를 네이티브 컴포넌트로 렌더링한다", async () => {
    await render(
      <ChatMarkdown>
        {
          "# 제목\n\n**굵게**와 *기울임*\n\n- 첫 항목\n- 둘째 항목\n\n`inline`\n\n```ts\nconst answer = 42;\n```\n\n| 열 | 값 |\n| --- | --- |\n| A | B |"
        }
      </ChatMarkdown>
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

    await render(
      <ChatMarkdown>
        {
          "[공식 문서](https://example.com)\n\n![이미지](https://example.com/a.png)"
        }
      </ChatMarkdown>
    );

    fireEvent.press(screen.getByRole("link", { name: "공식 문서" }));

    expect(openUrl).toHaveBeenCalledWith("https://example.com");
    expect(screen.queryByLabelText("이미지")).toBeNull();
  });
});
