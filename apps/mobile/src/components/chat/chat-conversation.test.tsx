import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";

const mockScrollToEnd = jest.fn();
const mockContentInsetEndAdjustment = { value: 0 };
const mockOnComposerLayout = jest.fn();
const mockKeyboardHeight = { value: 0 };
const mockKeyboardProgress = { value: 0 };

jest.mock(
  "@legendapp/list/keyboard",
  () => {
    const ReactRuntime = require("react");
    const { View: NativeView } = require("react-native");

    return {
      KeyboardAwareLegendList: ReactRuntime.forwardRef(
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
            scrollToEnd: mockScrollToEnd,
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
      useKeyboardChatComposerInset: () => ({
        contentInsetEndAdjustment: mockContentInsetEndAdjustment,
        onComposerLayout: mockOnComposerLayout,
      }),
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
      useReanimatedKeyboardAnimation: () => ({
        height: mockKeyboardHeight,
        progress: mockKeyboardProgress,
      }),
    };
  },
  { virtual: true }
);
jest.mock("react-native-reanimated", () => {
  const { View: NativeView } = require("react-native");

  class MockAnimationBuilder {
    config?: unknown;
    durationMs?: number;
    reduceMotionV?: string;

    constructor(config?: unknown) {
      this.config = config;
    }

    duration(value: number) {
      this.durationMs = value;
      return this;
    }

    reduceMotion(value: string) {
      this.reduceMotionV = value;
      return this;
    }
  }

  return {
    __esModule: true,
    default: { View: NativeView },
    Keyframe: MockAnimationBuilder,
    LinearTransition: new MockAnimationBuilder(),
    ReduceMotion: { System: "system" },
    useAnimatedStyle: (style: () => object) => style(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: jest.fn((value: number) => value),
  };
});
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

const mockWithTiming = jest.requireMock("react-native-reanimated")
  .withTiming as jest.Mock;

function controller(overrides: Partial<ChatController> = {}): ChatController {
  return {
    error: null,
    input: "",
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
    status: "ready",
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
  beforeEach(() => {
    mockContentInsetEndAdjustment.value = 0;
    mockKeyboardHeight.value = 0;
    mockKeyboardProgress.value = 0;
    mockScrollToEnd.mockClear();
    mockOnComposerLayout.mockClear();
    mockWithTiming.mockClear();
  });

  it("사용자 말풍선과 전체 폭 AI 응답을 함께 보여준다", async () => {
    await render(<ChatConversation chat={controller()} />);

    expect(screen.getByText("사용자 질문")).toBeTruthy();
    expect(screen.getByText("**AI 답변**")).toBeTruthy();
    expect(screen.getByTestId("user-message").props.className).toContain(
      "self-end"
    );
    expect(screen.getByTestId("assistant-message")).toBeTruthy();
  });

  it("맨 아래에서는 목록이 스트리밍 높이 변화를 애니메이션 없이 따라간다", async () => {
    await render(<ChatConversation chat={controller()} />);

    const list = screen.getByTestId("chat-message-list");

    expect(list.props.contentContainerStyle).toEqual(
      expect.objectContaining({ paddingBottom: 16 })
    );
    expect(list.props.keyboardDismissMode).toBe("interactive");
    expect(list.props.initialScrollAtEnd).toBe(true);
    expect(list.props.maintainScrollAtEnd).toEqual({
      animated: false,
      on: {
        dataChange: true,
        itemLayout: true,
        layout: true,
      },
    });
    expect(list.props.maintainVisibleContentPosition).toBeUndefined();
    expect(list.props.onContentSizeChange).toBeUndefined();
  });

  it("목록 높이에 상관없이 맨 아래 72pt를 자동 추적 범위로 사용한다", async () => {
    await render(<ChatConversation chat={controller()} />);

    await fireEvent(screen.getByTestId("chat-message-viewport"), "onLayout", {
      nativeEvent: {
        layout: { height: 360, width: 390, x: 0, y: 0 },
      },
    });

    expect(
      screen.getByTestId("chat-message-list").props.maintainScrollAtEndThreshold
    ).toBeCloseTo(0.2);
  });

  it("키보드 전환과 하단 버튼은 inset을 포함한 같은 72pt 경계를 따른다", async () => {
    await render(<ChatConversation chat={controller()} />);

    const list = screen.getByTestId("chat-message-list");
    const stickyComposer = screen.getByTestId("chat-composer-sticky");

    await fireEvent(list, "onScroll", {
      nativeEvent: {
        contentInset: { bottom: 96, left: 0, right: 0, top: 0 },
        contentOffset: { x: 0, y: 496 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });

    expect(list.props.keyboardLiftBehavior).toBe("never");
    expect(
      within(stickyComposer).getByRole("button", { name: "맨 아래로" })
    ).toBeTruthy();
    expect(mockWithTiming).toHaveBeenLastCalledWith(1, {
      duration: 160,
      reduceMotion: "system",
    });

    await fireEvent(list, "onScroll", {
      nativeEvent: {
        contentInset: { bottom: 96, left: 0, right: 0, top: 0 },
        contentOffset: { x: 0, y: 536 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });

    expect(list.props.keyboardLiftBehavior).toBe("always");
    expect(
      within(stickyComposer).queryByRole("button", { name: "맨 아래로" })
    ).toBeNull();
    expect(mockWithTiming).toHaveBeenLastCalledWith(0, {
      duration: 160,
      reduceMotion: "system",
    });
  });

  it("중앙 버튼으로 맨 아래에 도착한 뒤 자동 추적 상태로 돌아간다", async () => {
    await render(<ChatConversation chat={controller()} />);

    const list = screen.getByTestId("chat-message-list");
    await fireEvent(list, "onScroll", {
      nativeEvent: {
        contentOffset: { x: 0, y: 0 },
        contentSize: { height: 500, width: 390 },
        layoutMeasurement: { height: 300, width: 390 },
      },
    });

    const stickyComposer = screen.getByTestId("chat-composer-sticky");
    const button = within(stickyComposer).getByRole("button", {
      name: "맨 아래로",
    });

    expect(screen.getByTestId("chat-scroll-to-bottom-anchor")).toHaveStyle({
      left: "50%",
      top: -60,
      transform: [{ translateX: -22 }],
    });

    await fireEvent.press(button);

    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: true });
    expect(
      within(stickyComposer).getByRole("button", { name: "맨 아래로" })
    ).toBeTruthy();

    await fireEvent(list, "onScroll", {
      nativeEvent: {
        contentOffset: { x: 0, y: 150 },
        contentSize: { height: 500, width: 390 },
        layoutMeasurement: { height: 300, width: 390 },
      },
    });

    expect(
      within(stickyComposer).queryByRole("button", { name: "맨 아래로" })
    ).toBeNull();
  });

  it("빈 안내는 목록 높이에 참여하지 않는 overlay로 표시한다", async () => {
    const { rerender } = await render(
      <ChatConversation chat={controller({ messages: [] })} />
    );

    const list = screen.getByTestId("chat-message-list");
    const viewport = screen.getByTestId("chat-message-viewport");
    const emptyState = within(viewport).getByTestId("chat-empty-state");

    expect(list.props.ListEmptyComponent).toBeUndefined();
    expect(emptyState.props.pointerEvents).toBe("none");
    expect(screen.getByText("무엇이든 물어보세요")).toBeTruthy();

    await rerender(<ChatConversation chat={controller()} />);

    expect(screen.queryByTestId("chat-empty-state")).toBeNull();
  });

  it("빈 안내는 키보드와 composer를 제외한 영역 안에서 중앙 정렬된다", async () => {
    mockContentInsetEndAdjustment.value = 96;
    mockKeyboardHeight.value = -300;
    mockKeyboardProgress.value = 1;

    await render(<ChatConversation chat={controller({ messages: [] })} />);

    const emptyState = screen.getByTestId("chat-empty-state");

    expect(emptyState).toHaveStyle({ bottom: 396 });
    expect(emptyState.props.className).toContain("top-0");
  });

  it("맨 아래에서는 목록과 composer가 같은 키보드 전환을 따른다", async () => {
    await render(<ChatConversation chat={controller()} />);

    const list = screen.getByTestId("chat-message-list");

    expect(list.props.keyboardLiftBehavior).toBe("always");
    expect(list.props.keyboardOffset).toBe(0);
    expect(list.props.contentInsetEndAdjustment).toBe(
      mockContentInsetEndAdjustment
    );
    expect(screen.getByTestId("chat-composer-sticky")).toHaveStyle({
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
    });
  });

  it("composer 높이 변화는 메시지 목록의 아래 inset에 반영한다", async () => {
    await render(<ChatConversation chat={controller()} />);

    await fireEvent(screen.getByTestId("chat-composer-layout"), "onLayout", {
      nativeEvent: {
        layout: { height: 96, width: 390, x: 0, y: 0 },
      },
    });

    expect(mockOnComposerLayout).toHaveBeenCalledWith({
      nativeEvent: {
        layout: { height: 96, width: 390, x: 0, y: 0 },
      },
    });
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

  it("스트리밍 중에는 전송 대신 중단 action을 보여준다", async () => {
    const stop = jest.fn();
    await render(
      <ChatConversation
        chat={controller({
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
          status: "streaming",
          stop,
        })}
      />
    );

    fireEvent.press(screen.getByRole("button", { name: "응답 중단" }));

    expect(stop).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "메시지 보내기" })).toBeNull();
  });

  it("첫 AI 텍스트 전에는 대화 영역에 응답 생성 스피너를 보여준다", async () => {
    await render(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "",
              id: "assistant-stream",
              role: "assistant",
              status: "complete",
            },
          ],
          status: "submitted",
        })}
      />
    );

    expect(screen.getByLabelText("응답 생성 중")).toHaveStyle({
      alignSelf: "flex-start",
      marginLeft: 8,
    });
    expect(screen.queryByText("…")).toBeNull();
    expect(screen.queryByText("\u258c")).toBeNull();
  });

  it("요청 대기 중에는 composer 스피너로 중단 action을 제공한다", async () => {
    const stop = jest.fn();
    await render(
      <ChatConversation
        chat={controller({
          status: "submitted",
          stop,
        })}
      />
    );

    expect(screen.getByTestId("composer-submit-spinner")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "응답 중단" }));

    expect(stop).toHaveBeenCalled();
    expect(screen.queryByText("stop.fill")).toBeNull();
  });

  it("첫 AI 텍스트가 오면 대화 스피너와 cursor 없이 응답만 보여준다", async () => {
    await render(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "",
              id: "assistant-stream",
              role: "assistant",
              status: "complete",
            },
          ],
          status: "streaming",
          streamingStore: {
            get: () => "첫 응답",
            set: jest.fn(),
            subscribe: () => () => undefined,
          },
        })}
      />
    );

    expect(screen.getByText("첫 응답")).toBeTruthy();
    expect(screen.queryByTestId("assistant-response-spinner")).toBeNull();
    expect(screen.queryByText("\u258c")).toBeNull();
    expect(screen.getByText("stop.fill")).toBeTruthy();
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
    const banner = screen.getByTestId("chat-error-banner");
    const composerSurface = screen.getByTestId("chat-composer-surface");

    expect(banner.props.entering).toMatchObject({
      durationMs: 160,
      reduceMotionV: "system",
    });
    expect(banner.props.exiting).toMatchObject({
      durationMs: 140,
      reduceMotionV: "system",
    });
    expect(composerSurface.props.layout).toBeUndefined();
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalled();
  });

  it("모델 오류 중에도 새 입력은 일반 전송 버튼으로 보낼 수 있다", async () => {
    const onSend = jest.fn();
    await render(
      <ChatConversation
        chat={controller({
          error: new Error("gateway failed"),
          input: "새 질문",
          onSend,
          status: "error",
        })}
      />
    );

    expect(screen.queryByTestId("composer-submit-spinner")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "메시지 보내기" }));

    expect(onSend).toHaveBeenCalled();
  });
});
