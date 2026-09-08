import { afterEach, describe, expect, jest, test } from "@jest/globals";
import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import type { UIMessage } from "ai";
import { setStringAsync } from "expo-clipboard";
import { useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  type AppStateStatus,
  StyleSheet,
} from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";

import type { ChatSession } from "@/features/chat/state/use-conversation";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { ChatPanel, chatLabels } from "./chat-panel";

const mockScrollToEnd = jest.fn<
  (options?: { animated?: boolean }) => Promise<void>
>(() => Promise.resolve());
const mockScrollToIndex = jest.fn<
  (options: {
    animated?: boolean;
    index: number;
    viewOffset?: number;
    viewPosition?: number;
  }) => Promise<void>
>(() => Promise.resolve());
const mockListState = { contentLength: 1000, scroll: 500, scrollLength: 500 };
const mockScrollToOffset = jest.fn<
  (options: { animated?: boolean; offset: number }) => Promise<void>
>(({ offset }) => {
  mockListState.scroll = offset;
  return Promise.resolve();
});

jest.mock("@legendapp/list/keyboard", () => {
  const React = require("react") as typeof import("react");
  const { KeyboardController: keyboardController } =
    require("react-native-keyboard-controller") as typeof import("react-native-keyboard-controller");
  const { View } = require("react-native") as typeof import("react-native");

  type MockListProps = React.ComponentProps<typeof View> & {
    applyWorkaroundForContentInsetHitTestBug?: boolean;
    contentContainerStyle?: unknown;
    contentInsetEndAdjustment?: unknown;
    data: UIMessage[];
    freeze?: unknown;
    keyboardDismissMode?: unknown;
    keyboardLiftBehavior?: unknown;
    keyboardOffset?: unknown;
    keyboardShouldPersistTaps?: unknown;
    keyExtractor: (item: UIMessage) => string;
    ListFooterComponent?: React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    maintainScrollAtEnd?: unknown;
    maintainScrollAtEndThreshold?: unknown;
    maintainVisibleContentPosition?: unknown;
    onEndVisible?: (visible: boolean) => void;
    recycleItems?: unknown;
    renderItem: (info: {
      data: UIMessage[];
      extraData: unknown;
      index: number;
      item: UIMessage;
      type: string | undefined;
    }) => React.ReactNode;
    scrollEventThrottle?: unknown;
  };
  interface MockListRef {
    getState: () => typeof mockListState;
    reportContentInset: (inset: { bottom: number }) => void;
    scrollToEnd: (options?: { animated?: boolean }) => Promise<void>;
    scrollToIndex: typeof mockScrollToIndex;
    scrollToOffset: typeof mockScrollToOffset;
  }

  const KeyboardAwareLegendList = React.forwardRef<MockListRef, MockListProps>(
    (props, ref) => {
      const {
        data,
        keyExtractor,
        ListFooterComponent,
        ListHeaderComponent,
        renderItem,
        ...viewProps
      } = props;
      const scrollToEnd = React.useCallback(
        (options?: { animated?: boolean }) => mockScrollToEnd(options),
        []
      );

      React.useImperativeHandle(
        ref,
        () => ({
          getState: () => mockListState,
          reportContentInset: jest.fn(),
          scrollToEnd,
          scrollToIndex: mockScrollToIndex,
          scrollToOffset: mockScrollToOffset,
        }),
        [scrollToEnd]
      );

      return React.createElement(
        View,
        { ...viewProps, data, keyExtractor } as React.ComponentProps<
          typeof View
        >,
        ListHeaderComponent,
        ...data.map((item, index) =>
          React.createElement(
            React.Fragment,
            { key: keyExtractor(item) },
            renderItem({
              data,
              extraData: undefined,
              index,
              item,
              type: undefined,
            })
          )
        ),
        ListFooterComponent
      );
    }
  );

  return {
    KeyboardAwareLegendList,
    useKeyboardChatComposerInset: () => ({
      contentInsetEndAdjustment: { value: 0 },
      onComposerLayout: jest.fn(),
    }),
    useKeyboardScrollToEnd: ({
      listRef,
    }: {
      listRef: React.RefObject<{
        scrollToEnd: (options?: { animated?: boolean }) => Promise<void>;
      } | null>;
    }) => {
      const freeze = React.useRef({ value: false }).current;
      const scrollMessageToEnd = React.useCallback(
        async ({
          animated,
          closeKeyboard,
        }: {
          animated: boolean;
          closeKeyboard: boolean;
        }) => {
          // 설치된 3.3.5와 같이 닫기와 스크롤을 동시에 시작한다.
          const dismissing = closeKeyboard && keyboardController.dismiss();
          await Promise.all([
            dismissing,
            listRef.current?.scrollToEnd({ animated }),
          ]);
        },
        [listRef]
      );

      return { freeze, scrollMessageToEnd };
    },
  };
});

/**
 * The menu stands in for HeroUI's, which cannot show itself here: its content
 * lives in a portal host the raw test provider does not mount, and it will
 * not place itself until the trigger reports a measurement Jest never makes.
 * The stand-in keeps the part this panel owns — a long press asks the trigger
 * to open, and the items call back — and leaves the real gesture, placement
 * and outside-press to the device checks the spec lists.
 */
jest.mock("heroui-native/menu", () => {
  const React = require("react") as typeof import("react");
  const { Pressable, Text, View } =
    require("react-native") as typeof import("react-native");

  const OpenContext = React.createContext<{
    isOpen: boolean;
    open: () => void;
  }>({ isOpen: false, open: () => undefined });

  function Root({ children, ...viewProps }: React.ComponentProps<typeof View>) {
    const [isOpen, setIsOpen] = React.useState(false);
    const value = React.useMemo(
      () => ({ isOpen, open: () => setIsOpen(true) }),
      [isOpen]
    );

    return React.createElement(
      OpenContext.Provider,
      { value },
      React.createElement(View, viewProps, children)
    );
  }

  const Trigger = React.forwardRef<
    { open: () => void },
    { asChild?: boolean; children: React.ReactElement }
  >(({ children }, ref) => {
    const { open } = React.useContext(OpenContext);

    React.useImperativeHandle(ref, () => ({ open }), [open]);

    return children;
  });

  function Portal({ children }: { children: React.ReactNode }) {
    const { isOpen } = React.useContext(OpenContext);

    return isOpen ? React.createElement(React.Fragment, null, children) : null;
  }

  return {
    Menu: Object.assign(Root, {
      Content: ({ children }: { children: React.ReactNode }) =>
        React.createElement(View, { testID: "chat-message-menu" }, children),
      Item: Pressable,
      ItemDescription: Text,
      ItemTitle: Text,
      Overlay: () => null,
      Portal,
      Trigger,
    }),
  };
});

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

const mockSetStringAsync = jest.mocked(setStringAsync);

function textMessage(
  id: string,
  role: "assistant" | "user",
  text: string
): UIMessage {
  return { id, parts: [{ text, type: "text" }], role };
}

function chatSession(overrides: Partial<ChatSession> = {}): ChatSession {
  return {
    beginEdit: jest.fn(),
    cancelEdit: jest.fn(),
    draft: "",
    editingMessageId: undefined,
    error: undefined,
    isBusy: false,
    messages: [],
    regenerateAnswer: jest.fn(),
    retry: jest.fn(),
    send: jest.fn(),
    setDraft: jest.fn(),
    stop: jest.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function EditableChat({ onSend }: { onSend: () => void }) {
  const [draft, setDraft] = useState("");

  return <ChatPanel chat={chatSession({ draft, send: onSend, setDraft })} />;
}

/**
 * A panel whose send actually puts the question in the conversation, which is
 * what a message coming in from below depends on.
 */
function SendingChat({
  editingMessageId,
  messages: initialMessages = [],
}: {
  editingMessageId?: string;
  messages?: UIMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const send = () =>
    setMessages((current) => {
      const kept = editingMessageId
        ? current.slice(
            0,
            current.findIndex((message) => message.id === editingMessageId)
          )
        : current;

      return [...kept, textMessage(`sent-${kept.length}`, "user", "새 질문")];
    });

  return (
    <ChatPanel
      chat={chatSession({ draft: "새 질문", editingMessageId, messages, send })}
    />
  );
}

/** Which rows carry an entry animation, in list order. */
function enteringRows() {
  return screen
    .getAllByTestId("chat-message-row")
    .map((row) => row.props.entering !== undefined);
}

/**
 * The long press asks the trigger to open through a ref rather than through
 * state React already knows about, so the flush has to be asked for.
 */
async function longPressMessage() {
  await act(() => {
    fireEvent(screen.getByTestId("chat-message-user"), "longPress");
  });
}

async function scrollAwayFromLatest() {
  const list = screen.getByTestId("chat-list");

  await act(() => {
    list.props.onScrollBeginDrag({
      nativeEvent: { contentOffset: { y: 240 } },
    });
    list.props.onScroll({
      nativeEvent: {
        contentInset: { bottom: 0 },
        contentOffset: { y: 160 },
        contentSize: { height: 800 },
        layoutMeasurement: { height: 400 },
      },
    });
  });
}

describe("ChatPanel", () => {
  afterEach(() => {
    mockScrollToEnd.mockClear();
    mockScrollToIndex.mockClear();
    mockScrollToOffset.mockReset();
    mockScrollToOffset.mockImplementation(({ offset }) => {
      mockListState.scroll = offset;
      return Promise.resolve();
    });
    Object.assign(mockListState, {
      contentLength: 1000,
      scroll: 500,
      scrollLength: 500,
    });
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("대화가 비어 있으면 메시지 목록과 입력·전송만 보여준다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.getByTestId("chat-list")).toBeOnTheScreen();
    expect(screen.getByLabelText(chatLabels.input)).toBeOnTheScreen();
    expect(screen.getByLabelText(chatLabels.send)).toBeDisabled();
    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
    expect(screen.queryByText("무엇을 도와드릴까요?")).not.toBeOnTheScreen();
  });

  // Focusing at mount makes iOS carry the rising keyboard along with the push
  // animation, so it enters from the right while the composer climbs from the
  // bottom. The screen decides when to focus instead; see
  // docs/decisions/mobile-keyboard-entry-focus.md.
  test("입력창은 mount 시점에 스스로 포커스를 잡지 않는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.getByLabelText(chatLabels.input).props.autoFocus).toBeFalsy();
  });

  test("메시지는 헤더와 분리된 목록 안에서 12px 간격을 둔다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} topInset={116} />);

    const list = screen.getByTestId("chat-list");

    expect(StyleSheet.flatten(list.props.contentContainerStyle)).toMatchObject({
      paddingTop: 12,
    });
    expect(list.props.contentInsetAdjustmentBehavior).toBe("never");
  });

  test("키보드가 열리면 입력창 아래에 8px 간격을 둔다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.getByTestId("chat-composer").parent?.props.offset).toEqual({
      closed: 0,
      opened: 26,
    });
  });

  test("하단 안전 영역이 없어도 키보드와 입력창 사이를 8px 띄운다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />, {
      safeAreaBottomInset: 0,
    });

    expect(screen.getByTestId("chat-composer").parent?.props.offset).toEqual({
      closed: 0,
      opened: 4,
    });
  });

  test("AI 답변만 Markdown 렌더러로 보내고 질문은 일반 텍스트로 둔다", async () => {
    const messages = [
      textMessage("user-1", "user", "질문"),
      textMessage("assistant-1", "assistant", "# 제목 **강조**"),
    ];

    await renderWithHeroUI(<ChatPanel chat={chatSession({ messages })} />);

    expect(screen.getByTestId("chat-message-assistant").props.markdown).toBe(
      "# 제목 **강조**"
    );
    expect(screen.getByText("질문")).toBeOnTheScreen();
    expect(
      screen.getByTestId("chat-message-user").props.markdown
    ).toBeUndefined();
  });

  test("장면 답변은 화자별 말풍선과 지문으로 그린다", async () => {
    const message: UIMessage = {
      id: "assistant-1",
      parts: [
        { data: { name: null }, id: "speaker-1", type: "data-speaker" },
        { text: "국물 김이 오른다.", type: "text" },
        { data: { name: "만복" }, id: "speaker-2", type: "data-speaker" },
        { text: "**어서 와.**", type: "text" },
      ],
      role: "assistant",
    };

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: [message] })} />
    );

    expect(screen.getByTestId("chat-scene-narration")).toHaveTextContent(
      "국물 김이 오른다."
    );
    expect(
      within(screen.getByTestId("chat-scene-utterance")).getByText("만복")
    ).toBeOnTheScreen();
    expect(screen.getByText("**어서 와.**").props.flavor).toBe("commonmark");
    expect(
      screen.queryByTestId("chat-message-assistant")
    ).not.toBeOnTheScreen();
  });

  test("장면 복사는 화자 이름이 살아 있는 각본으로 넣는다", async () => {
    const message: UIMessage = {
      id: "assistant-1",
      parts: [
        { data: { name: "만복" }, id: "speaker-1", type: "data-speaker" },
        { text: "어서 와.", type: "text" },
        { data: { name: null }, id: "speaker-2", type: "data-speaker" },
        { text: "국물 김이 오른다.", type: "text" },
      ],
      role: "assistant",
    };
    const user = userEvent.setup();

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: [message] })} />
    );

    await user.press(screen.getByLabelText(chatLabels.copyAnswer));

    expect(mockSetStringAsync).toHaveBeenCalledWith(
      "만복: 어서 와.\n국물 김이 오른다."
    );
  });

  test("텍스트가 아닌 응답 part는 표시하지 않는다", async () => {
    const message: UIMessage = {
      id: "assistant-1",
      parts: [
        {
          mediaType: "application/pdf",
          type: "file",
          url: "https://example.com/document.pdf",
        },
        {
          sourceId: "source-1",
          title: "문서 출처",
          type: "source-url",
          url: "https://example.com/source",
        },
        { text: "일반 텍스트", type: "text" },
      ],
      role: "assistant",
    };

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: [message] })} />
    );

    expect(screen.getByText("일반 텍스트")).toBeOnTheScreen();
    expect(screen.queryByText("문서 출처")).not.toBeOnTheScreen();
  });

  test("텍스트가 없는 응답은 빈 메시지 행도 만들지 않는다", async () => {
    const message: UIMessage = {
      id: "assistant-1",
      parts: [
        {
          mediaType: "application/pdf",
          type: "file",
          url: "https://example.com/document.pdf",
        },
      ],
      role: "assistant",
    };

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: [message] })} />
    );

    expect(
      screen.queryByTestId("chat-message-assistant")
    ).not.toBeOnTheScreen();
  });

  test("완료된 답변 아래에 복사와 다시 받기를 보여 준다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
        })}
      />
    );

    expect(screen.getByLabelText(chatLabels.copyAnswer)).toBeOnTheScreen();
    expect(screen.getByLabelText(chatLabels.regenerate)).toBeOnTheScreen();
  });

  test("받는 중부터 동작 줄을 두고 완료되면 같은 자리의 버튼만 보여 준다", async () => {
    const { rerender } = await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "받는 중"),
          ],
        })}
      />
    );

    expect(
      screen.queryByLabelText(chatLabels.copyAnswer)
    ).not.toBeOnTheScreen();
    const reserved = screen.getByTestId("chat-message-actions", {
      includeHiddenElements: true,
    });
    expect(reserved).toHaveStyle({ opacity: 0 });

    await rerender(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "받는 중"),
          ],
        })}
      />
    );
    expect(screen.getByTestId("chat-message-actions")).toBe(reserved);
    expect(reserved).toHaveStyle({ opacity: 1 });
    expect(screen.getByLabelText(chatLabels.copyAnswer)).toBeOnTheScreen();
  });

  test("앞선 답변은 새 답변을 받는 동안에도 아이콘 줄을 그대로 둔다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [
            textMessage("user-1", "user", "첫 질문"),
            textMessage("assistant-1", "assistant", "첫 답변"),
            textMessage("user-2", "user", "두 번째 질문"),
            textMessage("assistant-2", "assistant", "받는 중"),
          ],
        })}
      />
    );

    expect(screen.getAllByLabelText(chatLabels.copyAnswer)).toHaveLength(1);
  });

  test("내용과 선택 메뉴가 같은 지난 본문은 다른 답변의 시작과 완료로 다시 그리지 않는다", async () => {
    const markdownModule = require("react-native-enriched-markdown");
    const renderBody = jest.spyOn(markdownModule, "EnrichedMarkdownText");
    const previous = [
      textMessage("user-1", "user", "이전 질문"),
      textMessage("assistant-1", "assistant", "그대로 읽는 답변"),
    ];
    const { rerender } = await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: previous })} />
    );
    renderBody.mockClear();
    const messages = [...previous, textMessage("user-2", "user", "다음 질문")];
    await rerender(
      <ChatPanel chat={chatSession({ isBusy: true, messages })} />
    );
    await rerender(
      <ChatPanel
        chat={chatSession({
          messages: [
            ...messages,
            textMessage("assistant-2", "assistant", "새 답변"),
          ],
        })}
      />
    );
    expect(
      renderBody.mock.calls.filter(
        ([props]) =>
          (props as { markdown: string }).markdown === "그대로 읽는 답변"
      )
    ).toHaveLength(0);
    expect(
      screen.getAllByTestId("chat-message-assistant")[0]
    ).toHaveTextContent("그대로 읽는 답변");
  });

  // The list keeps its rows until `data` or `extraData` changes; handing it a
  // new renderItem does not reach them. The last answer arrives while the
  // request is still open, so nothing about the messages changes when it
  // closes and only this tells the rows to pick up their icon row.
  test("답변이 끝나면 목록에 메시지를 다시 그리라고 알린다", async () => {
    const messages = [
      textMessage("user-1", "user", "질문"),
      textMessage("assistant-1", "assistant", "답변"),
    ];
    const { rerender } = await renderWithHeroUI(
      <ChatPanel chat={chatSession({ isBusy: true, messages })} />
    );
    const whileBusy = screen.getByTestId("chat-list").props.extraData;

    await rerender(
      <ChatPanel chat={chatSession({ isBusy: false, messages })} />
    );

    expect(screen.getByTestId("chat-list").props.extraData).not.toBe(whileBusy);
  });

  test("수정을 시작해도 목록에 메시지를 다시 그리라고 알린다", async () => {
    const messages = [
      textMessage("user-1", "user", "질문"),
      textMessage("assistant-1", "assistant", "답변"),
    ];
    const { rerender } = await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages })} />
    );
    const beforeEdit = screen.getByTestId("chat-list").props.extraData;

    await rerender(
      <ChatPanel chat={chatSession({ editingMessageId: "user-1", messages })} />
    );

    expect(screen.getByTestId("chat-list").props.extraData).not.toBe(
      beforeEdit
    );
  });

  test("답변 복사는 그 답변의 본문 전체를 클립보드에 넣는다", async () => {
    const user = userEvent.setup();
    const markdown = "# 제목\n\n**강조**와 `코드`";
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", markdown)],
        })}
      />
    );

    await user.press(screen.getByLabelText(chatLabels.copyAnswer));

    expect(mockSetStringAsync).toHaveBeenCalledWith(markdown);
  });

  test("답변 다시 받기는 그 답변을 기준으로 되돌린다", async () => {
    const regenerateAnswer = jest.fn();
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "첫 질문"),
            textMessage("assistant-1", "assistant", "첫 답변"),
            textMessage("user-2", "user", "두 번째 질문"),
            textMessage("assistant-2", "assistant", "두 번째 답변"),
          ],
          regenerateAnswer,
        })}
      />
    );

    const [firstAnswerAction] = screen.getAllByLabelText(chatLabels.regenerate);
    await user.press(firstAnswerAction);

    expect(regenerateAnswer).toHaveBeenCalledWith("assistant-1");
  });

  test("메시지를 길게 누르면 메뉴가 열리고 한 번 누르는 것은 아무 일도 하지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await act(() => {
      fireEvent.press(screen.getByTestId("chat-message-user"));
    });

    expect(screen.queryByTestId("chat-message-menu")).not.toBeOnTheScreen();

    await longPressMessage();

    expect(screen.getByTestId("chat-message-menu")).toBeOnTheScreen();
    expect(screen.getByText(chatLabels.copyMessage)).toBeOnTheScreen();
    expect(screen.getByText(chatLabels.editMessage)).toBeOnTheScreen();
  });

  test("답변을 받는 동안에는 메시지 메뉴를 열지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await longPressMessage();

    expect(screen.queryByTestId("chat-message-menu")).not.toBeOnTheScreen();
  });

  test("메뉴의 복사는 그 메시지의 본문 전체를 클립보드에 넣는다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("user-1", "user", "가져갈 질문 전체")],
        })}
      />
    );

    await longPressMessage();
    await user.press(screen.getByText(chatLabels.copyMessage));

    expect(mockSetStringAsync).toHaveBeenCalledWith("가져갈 질문 전체");
  });

  test("메뉴의 수정은 그 메시지의 수정을 시작한다", async () => {
    const beginEdit = jest.fn();
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          beginEdit,
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await longPressMessage();
    await user.press(screen.getByText(chatLabels.editMessage));

    expect(beginEdit).toHaveBeenCalledWith("user-1");
  });

  // The answer's own selection now belongs to the Markdown renderer, which
  // turns it back on once a message stops streaming. Only the question's side
  // is the panel's to state: selecting it would take the long press its menu
  // needs.
  test("메시지 본문은 선택할 수 없다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    expect(screen.getByTestId("chat-message-user").props.selectable).toBe(
      false
    );
  });

  test("사용자 메시지와 AI 답변은 같은 글자 크기와 행간을 쓴다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
        })}
      />
    );

    // The question takes its size from a class and the answer from the numbers
    // the Markdown renderer accepts, so the check is that the two still meet at
    // the same body size rather than each keeping its renderer's default.
    const question = screen.getByTestId("chat-message-user");
    expect(question.props.className).toContain("text-base");
    expect(question.props.className).toContain("leading-6");
    expect(
      screen.getByTestId("chat-message-assistant").props.markdownStyle.paragraph
    ).toMatchObject({ fontSize: 16, lineHeight: 24 });
  });

  test("사용자가 이전 메시지로 스크롤하면 최신 메시지 이동 버튼을 보여준다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    await scrollAwayFromLatest();

    expect(screen.getByLabelText("최신 메시지로 이동")).toBeOnTheScreen();
  });

  test("목록 위쪽의 음수 오프셋은 이전 메시지 이동으로 보지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    const list = screen.getByTestId("chat-list");

    await act(() => {
      list.props.onScrollBeginDrag({
        nativeEvent: { contentOffset: { y: 0 } },
      });
      list.props.onScroll({
        nativeEvent: {
          contentInset: { bottom: 0 },
          contentOffset: { y: -120 },
          contentSize: { height: 800 },
          layoutMeasurement: { height: 400 },
        },
      });
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("최신 메시지 버튼은 입력창 밖의 투명한 오버레이에 띄운다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    await act(() => {
      screen.getByTestId("chat-composer").props.onLayout({
        nativeEvent: { layout: { height: 76 } },
      });
    });
    await scrollAwayFromLatest();

    expect(
      within(screen.getByTestId("chat-composer")).queryByLabelText(
        chatLabels.latest
      )
    ).not.toBeOnTheScreen();
    expect(
      StyleSheet.flatten(screen.getByTestId("chat-latest-overlay").props.style)
    ).toMatchObject({ bottom: 76, position: "absolute" });
    expect(screen.getByTestId("chat-latest-overlay").props.pointerEvents).toBe(
      "box-none"
    );
  });

  test("최신 메시지에 도착한 뒤에 자동 추적을 켜고 버튼을 숨긴다", async () => {
    let arrive: (() => void) | undefined;
    mockScrollToOffset.mockImplementationOnce(
      ({ offset }) =>
        new Promise<void>((resolve) => {
          arrive = () => {
            mockListState.scroll = offset;
            resolve();
          };
        })
    );
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    await scrollAwayFromLatest();

    await user.press(screen.getByLabelText(chatLabels.latest));
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    await act(() => arrive?.());
    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("먼 최신 메시지는 헤더 아래 목록에서 입력창을 뺀 마지막 한 화면만 이동한다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(<ChatPanel chat={chatSession()} topInset={100} />);
    await act(() => {
      screen.getByTestId("chat-composer").props.onLayout({
        nativeEvent: { layout: { height: 80 } },
      });
    });
    await scrollAwayFromLatest();
    Object.assign(mockListState, {
      contentLength: 5000,
      scroll: 200,
      scrollLength: 800,
    });
    await user.press(screen.getByLabelText(chatLabels.latest));
    await waitFor(() => expect(mockScrollToOffset).toHaveBeenCalledTimes(2));
    expect(mockScrollToOffset).toHaveBeenNthCalledWith(1, {
      animated: false,
      offset: 3480,
    });
    expect(mockScrollToOffset).toHaveBeenNthCalledWith(2, {
      animated: true,
      offset: 4200,
    });
  });

  test("최신 메시지 버튼은 숨겨도 같은 영역을 유지하고 읽기와 터치를 막는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);
    const motion = screen.getByTestId("chat-latest-motion", {
      includeHiddenElements: true,
    });
    expect(motion.props.pointerEvents).toBe("none");
    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
    await scrollAwayFromLatest();
    expect(screen.getByTestId("chat-latest-motion")).toBe(motion);
    expect(motion.props.pointerEvents).toBe("box-none");
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("먼 이동의 첫 단계에서 답변이 늘어나도 한 화면만 움직인다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(<ChatPanel chat={chatSession()} topInset={100} />);
    await act(() => {
      screen.getByTestId("chat-composer").props.onLayout({
        nativeEvent: { layout: { height: 80 } },
      });
    });
    await scrollAwayFromLatest();
    Object.assign(mockListState, {
      contentLength: 5000,
      scroll: 200,
      scrollLength: 800,
    });
    mockScrollToOffset.mockImplementationOnce(({ offset }) => {
      mockListState.scroll = offset;
      mockListState.contentLength = 5400;
      return Promise.resolve();
    });

    await user.press(screen.getByLabelText(chatLabels.latest));
    await waitFor(() => expect(mockScrollToOffset).toHaveBeenCalledTimes(2));
    expect(mockScrollToOffset).toHaveBeenNthCalledWith(1, {
      animated: false,
      offset: 3480,
    });
    expect(mockScrollToOffset).toHaveBeenNthCalledWith(2, {
      animated: true,
      offset: 4200,
    });
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("최신 메시지 이동 중 손으로 멈추면 늦게 끝나도 추적과 키보드 고정을 풀어 둔다", async () => {
    let finish: (() => void) | undefined;
    mockScrollToOffset.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const user = userEvent.setup();
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);
    await scrollAwayFromLatest();
    await user.press(screen.getByLabelText(chatLabels.latest));
    const list = screen.getByTestId("chat-list");
    await act(() => {
      list.props.onScrollBeginDrag({
        nativeEvent: { contentOffset: { y: 350 } },
      });
    });
    await act(() => finish?.());
    expect(list.props.freeze.get()).toBe(false);
    expect(list.props.maintainScrollAtEnd).toBe(false);
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("최신 메시지로 이동하는 동안 본문이 늘어나면 도착 후 다시 당기지 않는다", async () => {
    let finish: (() => void) | undefined;
    mockScrollToOffset.mockImplementationOnce(
      ({ offset }) =>
        new Promise<void>((resolve) => {
          finish = () => {
            mockListState.scroll = offset;
            resolve();
          };
        })
    );
    const user = userEvent.setup();
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);
    await scrollAwayFromLatest();
    await user.press(screen.getByLabelText(chatLabels.latest));
    mockListState.contentLength = 1800;
    await act(() => finish?.());
    expect(mockScrollToOffset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("사용자가 직접 목록 끝까지 내려오면 자동 추적을 다시 켠다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    await scrollAwayFromLatest();
    const list = screen.getByTestId("chat-list");

    await act(() => {
      list.props.onEndVisible(true);
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("최신 메시지가 보이지 않는다는 신호만으로 자동 추적을 끄지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    const list = screen.getByTestId("chat-list");

    await act(() => {
      list.props.onEndVisible(false);
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
    expect(list.props.maintainScrollAtEnd).toEqual({
      animated: false,
      on: { dataChange: true, itemLayout: true, layout: true },
    });
  });

  test("끝이 보인다는 신호 뒤에 직접 끝까지 내려와도 자동 추적을 다시 켠다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);
    await scrollAwayFromLatest();
    Object.assign(mockListState, {
      contentLength: 2080,
      scroll: 1000,
      scrollLength: 800,
    });
    const list = screen.getByTestId("chat-list");
    await act(() => list.props.onEndVisible(true));
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();

    await act(() => {
      list.props.onScrollBeginDrag({
        nativeEvent: { contentOffset: { y: 1000 } },
      });
      // 목록의 가시성 값은 계속 true여서 도착 때 신호를 다시 보내지 않는다.
      list.props.onScroll({
        nativeEvent: { contentOffset: { y: 1280 } },
      });
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toEqual({
      animated: false,
      on: { dataChange: true, itemLayout: true, layout: true },
    });
  });

  test("사용자가 시작한 관성 스크롤이 끝에 닿아도 자동 추적을 다시 켠다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    await scrollAwayFromLatest();
    const list = screen.getByTestId("chat-list");

    await act(() => {
      list.props.onScrollBeginDrag({
        nativeEvent: { contentOffset: { y: 160 } },
      });
      list.props.onScrollEndDrag({ nativeEvent: {} });
      list.props.onMomentumScrollBegin({ nativeEvent: {} });
      list.props.onEndVisible(true);
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("코드가 시작한 스크롤은 자동 추적 중단으로 보지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [textMessage("assistant-1", "assistant", "답변")],
        })}
      />
    );
    const list = screen.getByTestId("chat-list");

    await act(() => {
      list.props.onMomentumScrollBegin({ nativeEvent: {} });
      list.props.onScroll({
        nativeEvent: {
          contentInset: { bottom: 0 },
          contentOffset: { y: 160 },
          contentSize: { height: 800 },
          layoutMeasurement: { height: 400 },
        },
      });
    });

    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("메시지 id를 가상 목록 키로 사용하고 항목을 재활용하지 않는다", async () => {
    const messages = [
      textMessage("user-stable-id", "user", "같은 내용"),
      textMessage("assistant-stable-id", "assistant", "같은 내용"),
    ];
    await renderWithHeroUI(<ChatPanel chat={chatSession({ messages })} />);
    const list = screen.getByTestId("chat-list");

    expect(list.props.keyExtractor(messages[0])).toBe("user-stable-id");
    expect(list.props.keyExtractor(messages[1])).toBe("assistant-stable-id");
    expect(list.props.recycleItems).toBe(false);
  });

  test("스트리밍 추적은 애니메이션 없이 크기와 새 메시지 변화를 따른다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);
    const list = screen.getByTestId("chat-list");

    expect(list.props.maintainScrollAtEnd).toEqual({
      animated: false,
      on: { dataChange: true, itemLayout: true, layout: true },
    });
    expect(list.props.maintainVisibleContentPosition).toEqual({
      data: false,
      size: true,
    });
    expect(list.props.keyboardLiftBehavior).toBe("whenAtEnd");
    expect(list.props.initialScrollAtEnd).toBe(true);
    expect(list.props.alignItemsAtEnd).toBe(true);
  });

  test("전송하면 질문 뒤에 빈 영역을 만들지 않고 목록 끝으로 이동한다", async () => {
    await renderWithHeroUI(<SendingChat messages={[]} />);
    await userEvent.setup().press(screen.getByLabelText(chatLabels.send));
    expect(
      screen.getByTestId("chat-list").props.anchoredEndSpace
    ).toBeUndefined();
    await waitFor(() => expect(mockScrollToEnd).toHaveBeenCalledTimes(1));
    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  test("키보드가 닫힌 뒤 마지막 내용으로 한 번만 이동한다", async () => {
    let finishDismiss: (() => void) | undefined;
    jest.mocked(KeyboardController.dismiss).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDismiss = resolve;
        })
    );
    await renderWithHeroUI(
      <SendingChat messages={[textMessage("old", "assistant", "이전 답변")]} />
    );
    await userEvent.setup().press(screen.getByLabelText(chatLabels.send));
    expect(finishDismiss).toBeDefined();
    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    await act(() => finishDismiss?.());
    await waitFor(() => expect(mockScrollToEnd).toHaveBeenCalledTimes(1));
    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: true });
    expect(mockScrollToIndex).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("키보드 닫기를 기다리는 중 직접 스크롤하면 전송 뒤 이동을 취소한다", async () => {
    let finishDismiss: (() => void) | undefined;
    jest.mocked(KeyboardController.dismiss).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDismiss = resolve;
        })
    );
    await renderWithHeroUI(<SendingChat messages={[]} />);
    await userEvent.setup().press(screen.getByLabelText(chatLabels.send));
    await scrollAwayFromLatest();
    await act(async () => {
      finishDismiss?.();
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    expect(screen.getByTestId("chat-list").props.freeze.value).toBe(false);
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("전송 중 앱을 나가면 늦은 키보드 신호가 목록을 다시 옮기지 않는다", async () => {
    let onAppState: ((state: AppStateStatus) => void) | undefined;
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_event, listener) => {
        onAppState = listener;
        return { remove: jest.fn() };
      });
    let finishDismiss: (() => void) | undefined;
    jest.mocked(KeyboardController.dismiss).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDismiss = resolve;
        })
    );
    await renderWithHeroUI(<SendingChat messages={[]} />);
    await userEvent.setup().press(screen.getByLabelText(chatLabels.send));
    await act(async () => {
      onAppState?.("background");
      finishDismiss?.();
      onAppState?.("active");
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-list").props.maintainScrollAtEnd).toBe(
      false
    );
    expect(screen.getByTestId("chat-list").props.freeze.value).toBe(false);
  });

  test("키보드 닫힘 신호가 오지 않아도 배치 상태를 계속 유지하지 않는다", async () => {
    jest.useFakeTimers();
    jest
      .mocked(KeyboardController.dismiss)
      .mockImplementationOnce(() => new Promise<void>(() => undefined));
    await renderWithHeroUI(<SendingChat messages={[]} />);
    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .press(screen.getByLabelText(chatLabels.send));
    await act(() => jest.advanceTimersByTime(4000));
    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-list").props.freeze.value).toBe(false);
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("이전 대화를 읽다가 전송하면 끝에 도착한 뒤 자동 추적을 재개한다", async () => {
    await renderWithHeroUI(<EditableChat onSend={jest.fn()} />);
    await scrollAwayFromLatest();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(chatLabels.input), "질문");
    await user.press(screen.getByLabelText(chatLabels.send));
    await waitFor(() => expect(mockScrollToEnd).toHaveBeenCalledTimes(1));
    expect(screen.queryByLabelText(chatLabels.latest)).not.toBeOnTheScreen();
  });

  test("입력과 전송을 채팅 세션에 연결한다", async () => {
    const send = jest.fn();
    const user = userEvent.setup();

    await renderWithHeroUI(<EditableChat onSend={send} />);

    await user.type(screen.getByLabelText(chatLabels.input), "질문");
    expect(screen.getByLabelText(chatLabels.input)).toHaveDisplayValue("질문");

    await user.press(screen.getByLabelText(chatLabels.send));
    expect(send).toHaveBeenCalledTimes(1);
  });

  test("긴 입력을 보내면 입력창 높이를 한 줄로 줄인다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          draft: "여러 줄로 늘어난 긴 질문",
          send: jest.fn(),
        })}
      />
    );
    const input = screen.getByLabelText(chatLabels.input);
    const singleLineHeight = StyleSheet.flatten(input.props.style).height;

    await act(() => {
      input.props.onContentSizeChange({
        nativeEvent: { contentSize: { height: 240, width: 300 } },
      });
    });

    expect(
      StyleSheet.flatten(screen.getByLabelText(chatLabels.input).props.style)
        .height
    ).toBe(120);

    await user.press(screen.getByLabelText(chatLabels.send));

    expect(
      StyleSheet.flatten(screen.getByLabelText(chatLabels.input).props.style)
        .height
    ).toBe(singleLineHeight);
  });

  test("답변을 받는 동안 전송 자리는 중지가 된다", async () => {
    const stop = jest.fn(() => Promise.resolve());
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ draft: "질문", isBusy: true, stop })} />
    );

    expect(screen.queryByLabelText(chatLabels.send)).not.toBeOnTheScreen();

    await user.press(screen.getByLabelText(chatLabels.stop));

    expect(stop).toHaveBeenCalledTimes(1);
  });

  test("중지를 허용하지 않는 대화는 답변을 받는 동안 중지를 내놓지 않는다", async () => {
    const stop = jest.fn(() => Promise.resolve());
    await renderWithHeroUI(
      <ChatPanel
        canStop={false}
        chat={chatSession({ draft: "질문", isBusy: true, stop })}
      />
    );

    expect(screen.queryByLabelText(chatLabels.stop)).not.toBeOnTheScreen();
    expect(screen.getByLabelText(chatLabels.send)).toBeDisabled();
    expect(stop).not.toHaveBeenCalled();
  });

  test("중지한 장면을 저장하는 동안 같은 자리에 진행 상태를 보여 준다", async () => {
    const stop = jest.fn(() => Promise.resolve());
    await renderWithHeroUI(
      <ChatPanel
        busyLabel="진행을 저장하고 있어요"
        canStop={false}
        chat={chatSession({ draft: "질문", isBusy: true, stop })}
      />
    );

    const pendingStop = screen.getByLabelText(chatLabels.stop);

    expect(pendingStop).toBeDisabled();
    expect(pendingStop).toHaveProp("accessibilityState", {
      busy: true,
      disabled: true,
    });
    expect(pendingStop).toHaveProp("accessibilityValue", {
      text: "진행을 저장하고 있어요",
    });
    expect(screen.queryByLabelText(chatLabels.send)).not.toBeOnTheScreen();
    expect(stop).not.toHaveBeenCalled();
  });

  test("중지 저장 상태를 보여 줄 때 답변 대기 문구는 숨긴다", async () => {
    jest.useFakeTimers();
    await renderWithHeroUI(
      <ChatPanel
        busyLabel="진행을 저장하고 있어요"
        canStop={false}
        chat={chatSession({
          isBusy: true,
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryAllByLabelText(chatLabels.waiting)).toHaveLength(0);
    expect(screen.getByLabelText(chatLabels.stop)).toHaveProp(
      "accessibilityValue",
      { text: "진행을 저장하고 있어요" }
    );
  });

  // The two share a place in the tree, so React keeps one instance and only
  // changes its props. On Android a `disabled` that stops being passed is
  // never cleared, and the stop button inherits the send button's disabled
  // state: it draws normally and refuses every touch.
  test("중지는 전송의 비활성 상태를 물려받지 않는다", async () => {
    const { rerender } = await renderWithHeroUI(
      <ChatPanel chat={chatSession({ draft: "", isBusy: false })} />
    );

    expect(screen.getByLabelText(chatLabels.send)).toBeDisabled();

    await rerender(<ChatPanel chat={chatSession({ isBusy: true })} />);

    const stop = screen.getByLabelText(chatLabels.stop);
    expect(stop).toBeEnabled();
    expect(stop.props.accessibilityState).toMatchObject({ disabled: false });
  });

  test("답변을 다 받으면 전송이 돌아온다", async () => {
    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ draft: "질문", isBusy: false })} />
    );

    expect(screen.getByLabelText(chatLabels.send)).toBeOnTheScreen();
    expect(screen.queryByLabelText(chatLabels.stop)).not.toBeOnTheScreen();
  });

  test("요청이 실패하면 오류 문구 옆에 다시 시도를 둔다", async () => {
    const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
    const retry = jest.fn();
    const user = userEvent.setup();

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ error: new Error("network"), retry })} />
    );

    expect(screen.getByText(chatLabels.errorAnnouncement)).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith(chatLabels.errorAnnouncement);

    await user.press(screen.getByLabelText(chatLabels.retry));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  test("중지한 장면을 저장하는 동안 오류의 다시 시도를 막는다", async () => {
    const retry = jest.fn();
    const user = userEvent.setup();

    await renderWithHeroUI(
      <ChatPanel
        busyLabel="진행을 저장하고 있어요"
        canStop={false}
        chat={chatSession({
          error: new Error("network"),
          isBusy: true,
          retry,
        })}
      />
    );

    const retryButton = screen.getByLabelText(chatLabels.retry);

    expect(retryButton).toBeDisabled();
    await user.press(retryButton);
    expect(retry).not.toHaveBeenCalled();
  });

  test("실패하지 않았으면 다시 시도를 두지 않는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.queryByLabelText(chatLabels.retry)).not.toBeOnTheScreen();
  });

  test("수정 중에는 안내와 그만두기를 보여 주고 사라질 범위를 흐리게 그린다", async () => {
    const cancelEdit = jest.fn();
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          cancelEdit,
          draft: "두 번째 질문",
          editingMessageId: "user-2",
          messages: [
            textMessage("user-1", "user", "첫 질문"),
            textMessage("assistant-1", "assistant", "첫 답변"),
            textMessage("user-2", "user", "두 번째 질문"),
            textMessage("assistant-2", "assistant", "두 번째 답변"),
          ],
        })}
      />
    );

    expect(screen.getByText(chatLabels.editNotice)).toBeOnTheScreen();

    const rows = screen.getAllByTestId("chat-message-row");
    expect(
      rows.map((row) => StyleSheet.flatten(row.props.style).opacity)
    ).toEqual([1, 1, 0.38, 0.38]);

    await user.press(screen.getByLabelText(chatLabels.endEdit));

    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });

  test("수정 중이 아니면 안내를 두지 않는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.queryByTestId("chat-edit-notice")).not.toBeOnTheScreen();
  });

  test("수정 중에는 답변의 아이콘 줄을 누를 수 없다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          editingMessageId: "user-1",
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
        })}
      />
    );

    expect(screen.getByLabelText(chatLabels.copyAnswer)).toBeDisabled();
    expect(screen.getByLabelText(chatLabels.regenerate)).toBeDisabled();
  });

  test("입력창과 보내기를 하나의 떠 있는 컨트롤로 묶는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    const surface = screen.getByTestId("chat-composer-surface");
    expect(within(surface).getByLabelText(chatLabels.input)).toBeOnTheScreen();
    expect(within(surface).getByLabelText(chatLabels.send)).toBeOnTheScreen();
    // Nothing paints across the screen behind it, and it takes no row of its
    // own: laid out as a sibling it would shorten the list and the conversation
    // would stop at a straight edge above the control instead of running on
    // under it.
    expect(screen.getByTestId("chat-composer").props.className).not.toContain(
      "bg-"
    );
    expect(
      StyleSheet.flatten(
        screen.getByTestId("chat-composer").parent?.props.style
      )
    ).toMatchObject({ bottom: 0, position: "absolute" });
  });

  test("오류와 수정 안내는 컨트롤 안이 아니라 그 위에 둔다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          editingMessageId: "user-1",
          error: new Error("network"),
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    const surface = screen.getByTestId("chat-composer-surface");
    expect(screen.getByTestId("chat-error")).toBeOnTheScreen();
    expect(screen.getByTestId("chat-edit-notice")).toBeOnTheScreen();
    expect(within(surface).queryByTestId("chat-error")).not.toBeOnTheScreen();
    expect(
      within(surface).queryByTestId("chat-edit-notice")
    ).not.toBeOnTheScreen();
  });

  test("보낸 질문은 말풍선 자체의 진입 애니메이션을 쓰지 않는다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(
      <SendingChat
        messages={[
          textMessage("user-1", "user", "이전 질문"),
          textMessage("assistant-1", "assistant", "이전 답변"),
        ]}
      />
    );

    expect(enteringRows()).toEqual([false, false]);

    await user.press(screen.getByLabelText(chatLabels.send));

    expect(enteringRows()).toEqual([false, false, false]);
  });

  test("과거 대화를 처음 보여 줄 때는 아무 메시지도 움직이지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
        })}
      />
    );

    expect(enteringRows()).toEqual([false, false]);
  });

  test("수정해서 다시 보낸 질문도 자체 진입 애니메이션을 쓰지 않는다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(
      <SendingChat
        editingMessageId="user-2"
        messages={[
          textMessage("user-1", "user", "첫 질문"),
          textMessage("assistant-1", "assistant", "첫 답변"),
          textMessage("user-2", "user", "두 번째 질문"),
          textMessage("assistant-2", "assistant", "두 번째 답변"),
        ]}
      />
    );

    await user.press(screen.getByLabelText(chatLabels.send));

    expect(enteringRows()).toEqual([false, false, false]);
  });

  test("답변을 다시 받는 것은 질문을 움직이지 않는다", async () => {
    const regenerateAnswer = jest.fn();
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
          regenerateAnswer,
        })}
      />
    );

    await user.press(screen.getByLabelText(chatLabels.regenerate));

    expect(enteringRows()).toEqual([false, false]);
  });

  test("답변이 늦으면 그 자리에 대기 표시를 두고 첫 글자가 오면 없앤다", async () => {
    jest.useFakeTimers();
    const { rerender } = await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getAllByLabelText(chatLabels.waiting)).toHaveLength(1);
    // 답변 자리 자체가 본문으로 바뀐다. 목록 바닥의 별도 높이를 걷어내지 않는다.
    const responseRow = screen.getAllByTestId("chat-message-row").at(-1);
    if (!responseRow) {
      throw new Error("답변 자리가 있어야 한다.");
    }
    expect(
      within(responseRow).getByLabelText(chatLabels.waiting)
    ).toBeOnTheScreen();

    await rerender(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "첫"),
          ],
        })}
      />
    );

    expect(screen.queryAllByLabelText(chatLabels.waiting)).toHaveLength(0);
  });

  // Showing it for an answer that is already landing would put a line in the
  // answer's place and take it away before anyone could read it.
  test("첫 글자가 300ms 안에 오면 대기 표시를 한 번도 두지 않는다", async () => {
    jest.useFakeTimers();
    const { rerender } = await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [textMessage("user-1", "user", "질문")],
        })}
      />
    );

    await act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(screen.queryAllByLabelText(chatLabels.waiting)).toHaveLength(0);

    await rerender(
      <ChatPanel
        chat={chatSession({
          isBusy: true,
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "첫"),
          ],
        })}
      />
    );
    await act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryAllByLabelText(chatLabels.waiting)).toHaveLength(0);
  });

  test("답변을 받고 있지 않으면 대기 표시를 두지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          messages: [
            textMessage("user-1", "user", "질문"),
            textMessage("assistant-1", "assistant", "답변"),
          ],
        })}
      />
    );

    expect(screen.queryAllByLabelText(chatLabels.waiting)).toHaveLength(0);
  });

  test("입력창의 return 키로 전송한다", async () => {
    const send = jest.fn();

    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ draft: "질문", send })} />
    );

    fireEvent(screen.getByLabelText(chatLabels.input), "submitEditing");

    expect(send).toHaveBeenCalledTimes(1);
  });

  test("물어보기의 읽기 전용 출처를 목록 앞에 표시한다", async () => {
    const { Text } = require("react-native") as typeof import("react-native");
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession()}
        source={<Text testID="question-source">교정 출처</Text>}
      />
    );
    expect(
      within(screen.getByTestId("chat-list")).getByTestId("question-source")
    ).toHaveTextContent("교정 출처");
  });
});

describe("상황 줄 배너", () => {
  test("배너를 주지 않으면 그 자리를 두지 않는다", async () => {
    await renderWithHeroUI(<ChatPanel chat={chatSession()} />);

    expect(screen.queryByTestId("chat-banner")).not.toBeOnTheScreen();
  });

  // 조건부로 배너를 넘기는 화면은 조건이 어긋날 때 `null`을 준다. 빈 자리를
  // 남기면 목록의 시작점 계산에도 없는 배너가 끼어든다.
  test("배너 자리에 null을 주는 것도 없는 것으로 친다", async () => {
    await renderWithHeroUI(<ChatPanel banner={null} chat={chatSession()} />);

    expect(screen.queryByTestId("chat-banner")).not.toBeOnTheScreen();
  });

  test("상황 줄은 헤더 아래에서 자신의 공간을 차지하고 목록에 겹치지 않는다", async () => {
    const { Text } = require("react-native") as typeof import("react-native");
    await renderWithHeroUI(
      <ChatPanel
        banner={<Text>상황</Text>}
        chat={chatSession()}
        topInset={116}
      />
    );
    const banner = screen.getByTestId("chat-banner");
    expect(StyleSheet.flatten(banner.props.style)?.position).not.toBe(
      "absolute"
    );
    expect(banner.props.onLayout).toBeUndefined();
    expect(
      StyleSheet.flatten(
        screen.getByTestId("chat-list").props.contentContainerStyle
      ).paddingTop
    ).toBe(12);
    expect(screen.getByTestId("chat-panel").props.style.paddingTop).toBe(116);
  });

  test("사건이 끝나도 배너는 그대로 있는다", async () => {
    const { Text } = require("react-native") as typeof import("react-native");

    await renderWithHeroUI(
      <ChatPanel
        banner={<Text testID="panel-banner">상황</Text>}
        chat={chatSession()}
        closing={<Text testID="panel-closing">끝났어요</Text>}
      />
    );

    expect(screen.getByTestId("panel-banner")).toBeOnTheScreen();
    expect(screen.getByTestId("panel-closing")).toBeOnTheScreen();
  });
});

describe("끝난 대화", () => {
  const answered = [
    textMessage("user-1", "user", "질문"),
    textMessage("assistant-1", "assistant", "답변"),
  ];

  // 사건이 끝나면 쓸 자리가 없다. 자리를 대신하는 것이 입력이 닫혔다는 가장
  // 분명한 표시다.
  test("마무리가 들어오면 입력과 오류와 수정 안내가 그 자리를 내준다", async () => {
    const { Text } = require("react-native") as typeof import("react-native");

    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({
          editingMessageId: "user-1",
          error: new Error("실패"),
          messages: answered,
        })}
        closing={<Text testID="panel-closing">끝났어요</Text>}
      />
    );

    expect(screen.getByTestId("panel-closing")).toBeOnTheScreen();
    expect(screen.queryByTestId("chat-input")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("chat-send")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("chat-error")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("chat-edit-notice")).not.toBeOnTheScreen();
  });

  test("마무리가 없으면 입력이 그대로 있다", async () => {
    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: answered })} />
    );

    expect(screen.getByTestId("chat-input")).toBeOnTheScreen();
    expect(screen.queryByTestId("panel-closing")).not.toBeOnTheScreen();
  });

  // 마무리는 입력창보다 크다. 목록이 그대로면 마지막 장면이 그 뒤에 가린 채로
  // 대화가 끝난다.
  test("지난 대화를 읽는 중에는 마무리 높이가 바뀌어도 읽던 위치를 유지한다", async () => {
    const { Text } = require("react-native") as typeof import("react-native");

    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({ messages: answered })}
        closing={<Text testID="panel-closing">끝났어요</Text>}
      />
    );
    await scrollAwayFromLatest();
    mockScrollToEnd.mockClear();

    await act(() => {
      screen.getByTestId("chat-composer").props.onLayout({
        nativeEvent: { layout: { height: 180 } },
      });
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 80)));
    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("아직 열려 있는 대화는 자리 크기가 바뀌어도 당기지 않는다", async () => {
    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: answered })} />
    );
    await scrollAwayFromLatest();
    mockScrollToEnd.mockClear();

    await act(() => {
      screen.getByTestId("chat-composer").props.onLayout({
        nativeEvent: { layout: { height: 180 } },
      });
    });

    expect(mockScrollToEnd).not.toHaveBeenCalled();
    expect(screen.getByLabelText(chatLabels.latest)).toBeOnTheScreen();
  });

  test("빈 자리에 설 문구를 화면이 정한다", async () => {
    await renderWithHeroUI(
      <ChatPanel chat={chatSession()} placeholder="영어로 말해 보세요" />
    );

    expect(screen.getByTestId("chat-input")).toHaveProp(
      "placeholder",
      "영어로 말해 보세요"
    );
  });
});

describe("메시지 하나에 거는 동작", () => {
  const answered = [
    textMessage("user-1", "user", "질문"),
    textMessage("assistant-1", "assistant", "답변"),
  ];

  test("동작을 두지 않는 화면에서는 아이콘 줄도 메뉴도 열리지 않는다", async () => {
    const user = userEvent.setup();
    await renderWithHeroUI(
      <ChatPanel
        chat={chatSession({ messages: answered })}
        hasMessageActions={false}
      />
    );

    expect(screen.queryByTestId("chat-message-actions")).not.toBeOnTheScreen();

    await user.longPress(screen.getByTestId("chat-message-user"));

    expect(screen.queryByTestId("chat-message-menu")).not.toBeOnTheScreen();
  });

  test("따로 끄지 않으면 아이콘 줄이 답변 아래에 있다", async () => {
    await renderWithHeroUI(
      <ChatPanel chat={chatSession({ messages: answered })} />
    );

    expect(screen.getByTestId("chat-message-actions")).toBeOnTheScreen();
  });
});
