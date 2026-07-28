import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock(
  "@legendapp/list/react-native",
  () => {
    const ReactRuntime = require("react");
    const { View: NativeView } = require("react-native");

    return {
      LegendList: ReactRuntime.forwardRef(
        (
          {
            data,
            keyExtractor,
            renderItem,
            ...props
          }: {
            data: unknown[];
            keyExtractor: (item: unknown) => string;
            renderItem: (info: { index: number; item: unknown }) => unknown;
          },
          ref: unknown
        ) => {
          ReactRuntime.useImperativeHandle(ref, () => ({
            scrollToEnd: jest.fn(),
          }));

          return ReactRuntime.createElement(
            NativeView,
            props,
            data.map((item, index) =>
              ReactRuntime.createElement(
                ReactRuntime.Fragment,
                { key: keyExtractor(item) },
                renderItem({ index, item })
              )
            )
          );
        }
      ),
    };
  },
  { virtual: true }
);
jest.mock(
  "react-native-keyboard-controller",
  () => {
    const { View: NativeView } = require("react-native");
    return {
      KeyboardGestureArea: NativeView,
      KeyboardStickyView: NativeView,
    };
  },
  { virtual: true }
);
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
jest.mock(
  "expo-glass-effect",
  () => {
    const { View: NativeView } = require("react-native");
    return {
      GlassView: NativeView,
      isLiquidGlassAvailable: () => false,
    };
  },
  { virtual: true }
);
jest.mock(
  "expo-blur",
  () => {
    const { View: NativeView } = require("react-native");
    return { BlurView: NativeView };
  },
  { virtual: true }
);
jest.mock(
  "expo-symbols",
  () => {
    const ReactRuntime = require("react");
    const { Text: NativeText } = require("react-native");
    return {
      SymbolView: ({ name }: { name: string }) =>
        ReactRuntime.createElement(NativeText, null, name),
    };
  },
  { virtual: true }
);
jest.mock(
  "./chat-markdown",
  () => {
    const ReactRuntime = require("react");
    const { Text: NativeText } = require("react-native");
    return {
      ChatMarkdown: ({ children }: { children: string }) =>
        ReactRuntime.createElement(NativeText, null, children),
    };
  },
  { virtual: true }
);

import { type ChatController, ChatConversation } from "./chat-conversation";

function controller(overrides: Partial<ChatController> = {}): ChatController {
  return {
    error: null,
    input: "",
    isGenerating: false,
    messages: [
      {
        content: "사용자 질문",
        id: "user-1",
        role: "user",
        status: "complete",
      },
      {
        content: "**AI 답변**",
        id: "assistant-1",
        role: "assistant",
        status: "complete",
      },
    ],
    onRetry: jest.fn(),
    onSend: jest.fn(),
    setInput: jest.fn(),
    stop: jest.fn(),
    streamingStore: {
      get: () => "",
      set: jest.fn(),
      subscribe: () => () => undefined,
    },
    ...overrides,
  };
}

describe("채팅방 상세 대화", () => {
  it("사용자 말풍선과 전체 폭 AI 응답을 함께 보여준다", async () => {
    await render(<ChatConversation chat={controller()} />);

    expect(screen.getByText("사용자 질문")).toBeTruthy();
    expect(screen.getByText("**AI 답변**")).toBeTruthy();
    expect(screen.getByTestId("user-message").props.className).toContain(
      "self-end"
    );
    expect(screen.getByTestId("assistant-message")).toBeTruthy();
  });

  it("메시지 목록은 가상화·interactive keyboard dismissal 설정을 가진다", async () => {
    await render(<ChatConversation chat={controller()} />);

    const list = screen.getByTestId("chat-message-list");

    expect(list.props.keyboardDismissMode).toBe("interactive");
    expect(list.props.maintainVisibleContentPosition).toBeTruthy();
  });

  it("composer는 텍스트만 4,000자까지 받고 내용을 컨트롤러에 전한다", async () => {
    const setInput = jest.fn();
    await render(<ChatConversation chat={controller({ setInput })} />);

    const input = screen.getByPlaceholderText("메시지 보내기");
    fireEvent.changeText(input, "새 질문");

    expect(input.props.maxLength).toBe(4000);
    expect(setInput).toHaveBeenCalledWith("새 질문");
  });

  it("보낼 내용이 있으면 전송 action을 실행한다", async () => {
    const onSend = jest.fn();
    await render(
      <ChatConversation chat={controller({ input: "질문", onSend })} />
    );

    fireEvent.press(screen.getByRole("button", { name: "메시지 보내기" }));

    expect(onSend).toHaveBeenCalled();
  });

  it("생성 중에는 전송 대신 중단 action을 보여준다", async () => {
    const stop = jest.fn();
    await render(
      <ChatConversation
        chat={controller({
          isGenerating: true,
          messages: [
            {
              content: "질문",
              id: "user-1",
              role: "user",
              status: "complete",
            },
            {
              content: "",
              id: "assistant-stream",
              role: "assistant",
              status: "complete",
            },
          ],
          stop,
        })}
      />
    );

    fireEvent.press(screen.getByRole("button", { name: "응답 중단" }));

    expect(stop).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "메시지 보내기" })).toBeNull();
  });

  it("중단 저장된 AI 응답에는 중단됨을 표시한다", async () => {
    await render(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "여기까지 생성",
              id: "assistant-1",
              role: "assistant",
              status: "stopped",
            },
          ],
        })}
      />
    );

    expect(screen.getByText("중단됨")).toBeTruthy();
  });

  it("모델 오류는 현재 화면에서 재시도할 수 있다", async () => {
    const onRetry = jest.fn();
    await render(
      <ChatConversation
        chat={controller({
          error: new Error("gateway failed"),
          onRetry,
        })}
      />
    );

    expect(screen.getByText("응답을 만들지 못했어요.")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalled();
  });
});
