import {
  fireEvent,
  isHiddenFromAccessibility,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { processColor, StyleSheet, Text } from "react-native";

// 아래 mock에 `{ virtual: true }`를 붙이지 않는다. jest의 virtual은 디스크에
// 없는 모듈 전용이다. 실재하는 모듈에 붙이면 resolver가 실제 경로 대신 이름
// 문자열로 module id를 만들어 worker 안에서 공유되는 캐시에 굳히고, 같은
// 모듈을 mock하는 다음 test 파일이 진짜 native 모듈을 받게 된다.
jest.mock("@legendapp/list/keyboard", () => {
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
});
jest.mock("react-native-keyboard-controller", () => {
  const { View: NativeView } = require("react-native");
  return {
    KeyboardGestureArea: NativeView,
    KeyboardStickyView: NativeView,
    useReanimatedKeyboardAnimation: () => ({
      height: { value: 0 },
      progress: { value: 0 },
    }),
  };
});
/**
 * reanimated는 실물 그대로 쓴다 — HeroUI 컴포넌트가 이 모듈 위에 서 있어
 * 통째로 대체하면 버튼과 spinner가 마운트되지 않는다. 화면이 직접 정하는
 * 모션 값만 관찰할 수 있게 `withTiming`에 spy를 씌운다.
 */
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");

  return {
    ...actual,
    // Babel은 `__esModule`을 열거되지 않게 정의한다 — 펼치기만 하면 표식과
    // default export가 함께 사라져 `Reanimated.View`가 undefined가 된다.
    __esModule: true,
    default: actual.default,
    withTiming: jest.fn(actual.withTiming),
  };
});
jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("react-native-safe-area-context", () => ({
  // HeroUI provider가 이 모듈에서 함께 가져다 쓴다 — 통째로 대체하면 provider가
  // 렌더되지 않는다.
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
jest.mock("./chat-markdown", () => {
  const ReactRuntime = require("react");
  const { Text: NativeText } = require("react-native");
  return {
    ChatMarkdown: ({ children }: { children: string }) =>
      ReactRuntime.createElement(NativeText, null, children),
  };
});

import { ReduceMotion } from "react-native-reanimated";
import {
  HeroUIWrapper,
  paintedColors,
  THEME_TOKEN_STUBS,
} from "../../test-support/heroui";
import { type ChatController, ChatConversation } from "./chat-conversation";

const mockScrollToEnd = jest.fn();
const mockContentInsetEndAdjustment = { value: 0 };
const mockOnComposerLayout = jest.fn();
const mockWithTiming = jest.requireMock("react-native-reanimated")
  .withTiming as jest.Mock;

/** 아이콘이 그리는 글리프 문자 — 무슨 글자든 하나 잡으면 된다. */
const ANY_GLYPH = /\S/;
/** 맨 아래 action이 나타나고 사라지는 데 화면이 정한 모션. */
const SCROLL_BUTTON_TIMING = {
  duration: 160,
  reduceMotion: ReduceMotion.System,
};
const ON_ACCENT = THEME_TOKEN_STUBS["--color-accent-foreground"];
const NEUTRAL = THEME_TOKEN_STUBS["--color-muted"];
/** 짝 line-height를 함께 내는 Tailwind 글자 크기 스케일. */
const PAIRED_TEXT_SCALE = /\btext-(?:xs|sm|base|lg|\d*xl)\b/;
const LINE_HEIGHT_UTILITY = /\bleading-/;

function controller(overrides: Partial<ChatController> = {}): ChatController {
  return {
    error: null,
    input: "",
    messages: [
      {
        content: "사용자 질문",
        id: "user-1",
        kind: "message",
        role: "user",
        status: "complete",
      },
      {
        content: "**AI 답변**",
        id: "assistant-1",
        kind: "message",
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

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderChat(ui: Parameters<typeof render>[0]) {
  return render(ui, { wrapper: HeroUIWrapper });
}

describe("스트리밍 대화 표면", () => {
  beforeEach(() => {
    mockContentInsetEndAdjustment.value = 0;
    // 아이콘 글리프는 jest-expo의 asset registry mock 위에서만 마운트된다 —
    // `resetAllMocks`는 그 mock까지 지운다.
    jest.clearAllMocks();
  });

  it("사용자 말풍선과 전체 폭 AI 응답을 함께 보여준다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

    expect(screen.getByText("사용자 질문")).toBeTruthy();
    expect(screen.getByText("**AI 답변**")).toBeTruthy();
    expect(screen.getByTestId("user-message-row").props.className).toContain(
      "justify-end"
    );
    expect(screen.getByTestId("assistant-message")).toBeTruthy();
  });

  it("기록 한 줄은 말풍선 사이에 가운데로 서고 누를 수 없다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "사용자 질문",
              id: "user-1",
              kind: "message",
              role: "user",
              status: "complete",
            },
            {
              id: "goal-1",
              kind: "note",
              text: "오늘의 원두 추천 받기 완료",
            },
          ],
        })}
      />
    );

    const note = screen.getByTestId("conversation-note");

    expect(within(note).getByText("오늘의 원두 추천 받기 완료")).toBeTruthy();
    expect(note.props.className).toContain("justify-center");
    // 체크는 상태 표시다. 누를 것이 아니므로 버튼으로 서지 않고, 글리프가
    // 스크린 리더의 정지점을 만들지도 않는다.
    expect(
      isHiddenFromAccessibility(
        within(screen.getByTestId("conversation-note-check")).getByText(
          ANY_GLYPH,
          { includeHiddenElements: true }
        )
      )
    ).toBe(true);
    expect(
      screen.queryByRole("button", { name: "오늘의 원두 추천 받기 완료" })
    ).toBeNull();
  });

  it("판정이 아직 없으면 44pt 고정 열이 비어 있다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

    expect(screen.getByTestId("user-message-mark").props.className).toContain(
      "size-11"
    );
    expect(screen.getByTestId("user-message-mark")).toBeEmptyElement();
  });

  it("판정이 나중에 채워져도 말풍선은 같은 자리에 있다", async () => {
    const { rerender } = await renderChat(
      <ChatConversation chat={controller()} onMarkPress={jest.fn()} />
    );
    const before = screen.getByTestId("user-message-mark").props.className;

    await rerender(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "사용자 질문",
              id: "user-1",
              kind: "message",
              mark: "improvable",
              role: "user",
              status: "complete",
            },
          ],
        })}
        onMarkPress={jest.fn()}
      />
    );

    // 열의 크기는 그대로고 안에 값만 들어선다.
    expect(screen.getByTestId("user-message-mark").props.className).toEqual(
      before
    );
    expect(screen.getByTestId("user-message-mark")).not.toBeEmptyElement();
    expect(screen.getByText("사용자 질문")).toBeTruthy();
  });

  it("누를 수 있는 두 표시만 버튼이고 44pt를 다 쓴다", async () => {
    const onMarkPress = jest.fn();
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "한글로 쓴 발화",
              id: "user-1",
              kind: "message",
              mark: "translated",
              role: "user",
              status: "complete",
            },
            {
              content: "더 자연스럽게 쓸 여지가 있는 발화",
              id: "user-2",
              kind: "message",
              mark: "improvable",
              role: "user",
              status: "complete",
            },
            {
              content: "그대로 통한 발화",
              id: "user-3",
              kind: "message",
              mark: "clear",
              role: "user",
              status: "complete",
            },
          ],
        })}
        onMarkPress={onMarkPress}
      />
    );

    for (const testID of [
      "message-mark-translated",
      "message-mark-improvable",
      "message-mark-clear",
    ]) {
      const mark = screen.getByTestId(testID);

      expect(mark.props.className).toContain("size-11");
      // 뜻은 표시 자리의 접근성 이름이 나른다 — 글리프 문자가 읽히지 않는다.
      expect(
        isHiddenFromAccessibility(
          within(mark).getByText(ANY_GLYPH, { includeHiddenElements: true })
        )
      ).toBe(true);
    }

    // 상태 표시인 체크는 누를 것이 아니다.
    expect(
      screen.queryByRole("button", { name: "그대로 잘 통했어요" })
    ).toBeNull();

    await fireEvent.press(
      screen.getByRole("button", { name: "한글로 쓴 문장 보기" })
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "더 자연스러운 표현 보기" })
    );

    expect(onMarkPress.mock.calls).toEqual([["user-1"], ["user-2"]]);
  });

  it("말풍선 본문을 눌러서는 아무 일도 일어나지 않는다", async () => {
    const onMarkPress = jest.fn();
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "사용자 질문",
              id: "user-1",
              kind: "message",
              mark: "improvable",
              role: "user",
              status: "complete",
            },
          ],
        })}
        onMarkPress={onMarkPress}
      />
    );

    await fireEvent.press(screen.getByTestId("user-message"));

    expect(onMarkPress).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "사용자 질문" })).toBeNull();
  });

  it("맨 아래에서는 목록이 스트리밍 높이 변화를 애니메이션 없이 따라간다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

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
    await renderChat(<ChatConversation chat={controller()} />);

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
    await renderChat(<ChatConversation chat={controller()} />);

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
    // HeroUI 컴포넌트도 같은 함수로 자기 모션을 돌리므로 마지막 호출이 아니라
    // 화면이 정한 값이 있었는지를 본다.
    expect(mockWithTiming).toHaveBeenCalledWith(1, SCROLL_BUTTON_TIMING);
    mockWithTiming.mockClear();

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
    expect(mockWithTiming).toHaveBeenCalledWith(0, SCROLL_BUTTON_TIMING);
  });

  it("중앙 버튼으로 맨 아래에 도착한 뒤 자동 추적 상태로 돌아간다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

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

    // composer 바로 위 전체 폭에 걸쳐 서서 버튼을 가운데에 세운다. 이 두 단언은
    // 짝이다 — 전체 폭을 덮는 자리가 스스로 터치를 받으면(`auto`) 버튼이 보이는
    // 동안(=스크롤을 올린 동안) composer 위 44pt 띠가 목록 드래그와 말풍선 곁
    // 표시 탭을 삼킨다. `box-none`은 자식만 터치 대상으로 남긴다.
    const anchor = screen.getByTestId("chat-scroll-to-bottom-anchor");

    expect(anchor.props.className).toContain("inset-x-0");
    expect(anchor.props.className).toContain("items-center");
    expect(anchor.props.pointerEvents).toBe("box-none");

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
    // 버튼이 사라진 뒤에는 자식까지 통째로 터치에서 빠진다.
    expect(anchor.props.pointerEvents).toBe("none");
  });

  it("목록 머리는 대화의 첫 요소로, dock은 composer 바로 위에 둔다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller()}
        dock={<Text testID="surface-dock">dock</Text>}
        listHeader={<Text testID="surface-header">header</Text>}
      />
    );

    const list = screen.getByTestId("chat-message-list");
    const composerLayout = screen.getByTestId("chat-composer-layout");

    expect(list.props.ListHeaderComponent.props.testID).toBe("surface-header");
    expect(within(composerLayout).getByTestId("surface-dock")).toBeTruthy();
  });

  it("끝난 자리가 오면 목표 바와 composer가 함께 내려가고 대화는 남는다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller()}
        dock={<Text testID="surface-dock">dock</Text>}
        ending={<Text testID="surface-ending">결과 보기</Text>}
      />
    );

    expect(screen.getByTestId("surface-ending")).toBeTruthy();
    expect(screen.queryByTestId("surface-dock")).toBeNull();
    expect(screen.queryByLabelText("메시지")).toBeNull();
    expect(screen.queryByRole("button", { name: "메시지 보내기" })).toBeNull();
    // 대화는 화면에 그대로 남는다.
    expect(screen.getByText("사용자 질문")).toBeTruthy();
  });

  it("composer placeholder는 화면이 정한다", async () => {
    await renderChat(
      <ChatConversation chat={controller()} placeholder="영어로 써 보세요" />
    );

    expect(screen.getByLabelText("메시지").props.placeholder).toBe(
      "영어로 써 보세요"
    );
  });

  it("맨 아래에서는 목록과 composer가 같은 키보드 전환을 따른다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

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
    await renderChat(<ChatConversation chat={controller()} />);

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
    await renderChat(<ChatConversation chat={controller({ setInput })} />);

    const input = screen.getByPlaceholderText("메시지 보내기");
    fireEvent.changeText(input, "새 질문");

    expect(input.props.maxLength).toBe(4000);
    expect(setInput).toHaveBeenCalledWith("새 질문");
  });

  it("composer 입력은 Dynamic Type 글자를 자르는 고정 line height를 쓰지 않는다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

    const input = screen.getByPlaceholderText("메시지 보내기");
    const className: string = input.props.className;

    // Tailwind의 `text-*` 스케일은 font-size만이 아니라 짝 line-height도 낸다.
    // RN은 Dynamic Type로 fontSize만 키우므로 고정 line height는 큰 글자에서
    // 글자를 자른다. 그래서 짝이 없는 앱 토큰 하나만 쓴다 — 그 토큰이 정말
    // line-height를 내지 않는지는 실제 CSS를 컴파일하는
    // `scripts/style-foundation.test.ts`가 확인한다.
    expect(className).toContain("text-composer");
    expect(className).not.toMatch(PAIRED_TEXT_SCALE);
    expect(className).not.toMatch(LINE_HEIGHT_UTILITY);
    expect(
      StyleSheet.flatten(input.props.style ?? {}).lineHeight
    ).toBeUndefined();
  });

  it("composer는 form과 같은 adaptive input fill을 사용한다", async () => {
    await renderChat(<ChatConversation chat={controller()} />);

    expect(
      screen.getByTestId("chat-composer-surface").props.className
    ).toContain("bg-field");
  });

  it("보낼 내용이 있으면 전송 action을 실행한다", async () => {
    const onSend = jest.fn();
    await renderChat(
      <ChatConversation chat={controller({ input: "질문", onSend })} />
    );

    fireEvent.press(screen.getByRole("button", { name: "메시지 보내기" }));

    expect(onSend).toHaveBeenCalled();
  });

  it("스트리밍 중에는 전송 대신 중단 action을 보여준다", async () => {
    const stop = jest.fn();
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "질문",
              id: "user-1",
              kind: "message",
              role: "user",
              status: "complete",
            },
            {
              content: "",
              id: "assistant-stream",
              kind: "message",
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
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "",
              id: "assistant-stream",
              kind: "message",
              role: "assistant",
              status: "complete",
            },
          ],
          status: "submitted",
        })}
      />
    );

    const indicator = screen.getByLabelText("응답 생성 중");
    const painted = paintedColors(screen.toJSON());

    expect(indicator.props.className).toContain("self-start");
    // 대화 영역의 진행은 스스로 나타나는 수동형이라 중립 회색이고, composer
    // action 안의 진행은 그 action의 전경색을 따른다
    // (docs/decisions/apple-hig-with-app-theme.md).
    expect(painted).toContain(processColor(NEUTRAL));
    expect(painted).toContain(processColor(ON_ACCENT));
    expect(screen.queryByText("…")).toBeNull();
    expect(screen.queryByText("▌")).toBeNull();
  });

  it("요청 대기 중에는 composer 스피너로 중단 action을 제공한다", async () => {
    const stop = jest.fn();
    await renderChat(
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
  });

  it("첫 AI 텍스트가 오면 대화 스피너와 cursor 없이 응답만 보여준다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "",
              id: "assistant-stream",
              kind: "message",
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
    expect(screen.queryByText("▌")).toBeNull();
    expect(screen.getByRole("button", { name: "응답 중단" })).toBeTruthy();
  });

  it("중단 저장된 AI 응답에는 중단됨을 표시한다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller({
          messages: [
            {
              content: "여기까지 생성",
              id: "assistant-1",
              kind: "message",
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
    await renderChat(
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

    // 배너는 composer와의 공간 관계를 유지하며 나타나고 사라진다. Reduce
    // Motion은 시스템 설정을 따른다(docs/decisions/native-motion.md).
    expect(banner.props.entering.durationV).toBe(160);
    expect(banner.props.entering.reduceMotionV).toBe(ReduceMotion.System);
    expect(banner.props.exiting.durationV).toBe(140);
    expect(banner.props.exiting.reduceMotionV).toBe(ReduceMotion.System);
    expect(composerSurface.props.layout).toBeUndefined();
    fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(onRetry).toHaveBeenCalled();
  });

  it("모델 오류의 재시도 action은 배너 안에서 44pt로 선다", async () => {
    await renderChat(
      <ChatConversation
        chat={controller({ error: new Error("gateway failed") })}
      />
    );

    const banner = screen.getByTestId("chat-error-banner");
    const retry = within(banner).getByRole("button", { name: "다시 시도" });

    expect(retry.props.className).toContain("min-h-11");
    // 배너의 반지름은 16pt다 — HeroUI 스케일의 `--radius-2xl`. `Surface` 기본값
    // (`--radius-3xl`, 24pt)로 흘러가지 않게 클래스로 고정한다.
    expect(screen.getByTestId("chat-error-surface").props.className).toContain(
      "rounded-2xl"
    );
  });

  it("모델 오류 중에도 새 입력은 일반 전송 버튼으로 보낼 수 있다", async () => {
    const onSend = jest.fn();
    await renderChat(
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
