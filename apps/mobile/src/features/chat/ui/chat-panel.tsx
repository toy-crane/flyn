import {
  KeyboardAwareLegendList,
  useKeyboardChatComposerInset,
  useKeyboardScrollToEnd,
} from "@legendapp/list/keyboard";
import type {
  AnchoredEndSpaceConfig,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import type { UIMessage } from "ai";
import { setStringAsync } from "expo-clipboard";
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardController,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  ReduceMotion,
  SlideInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ChatSession } from "@/features/chat/state/use-chat-session";
import { Icon } from "@/shared/ui/icon";
import { AssistantMessage } from "./assistant-message";
import { chatLabels } from "./chat-labels";
import { ComposerSurface } from "./composer-surface";
import { LatestMessageButton } from "./latest-message-button";
import { sceneCopyText, sceneOfMessage } from "./scene";
import { SceneMessage } from "./scene-message";
import { SideChatCount, type SideChatEntry } from "./side-chat-count";
import { SideChatSource } from "./side-chat-source";
import { useEnteringMessage } from "./use-entering-message";
import { useLateAnswer } from "./use-late-answer";
import { UserMessage } from "./user-message";
import { WaitingAnswer } from "./waiting-answer";

// biome-ignore lint/performance/noBarrelFile: screens and tests share these accessibility names
export { chatLabels } from "./chat-labels";
export type { SideChatEntry } from "./side-chat-count";

/** What starting a side chat needs to know: the answer, and the words in it. */
export interface AskInSideChat {
  messageId: string;
  phrase: string;
}

const INPUT_MAX_HEIGHT = 120;
const INPUT_MIN_HEIGHT = 48;
const KEYBOARD_INPUT_GAP = 8;
const LATEST_OVERLAY_HEIGHT = 60;
/** The row the side chat count takes when it stacks above the composer too. */
const SIDE_COUNT_OVERLAY_HEIGHT = 44;
const USER_SCROLL_THRESHOLD = 24;
const MESSAGE_TOP_SPACING = 12;
/** Enough to read the messages about to go, not enough to mistake them for staying. */
const DOOMED_OPACITY = 0.38;
/**
 * The button rises out of the composer and tucks back down into it rather than
 * appearing on the spot. Each direction gets the easing that suits it: coming
 * in slows as it settles, going out starts gently and clears away. Leaving
 * stays quicker than arriving, so reaching the newest message feels like the
 * button getting out of the way. Both step aside when the system asks for less
 * motion.
 */
const LATEST_ENTERING = FadeInDown.duration(240)
  .easing(Easing.out(Easing.cubic))
  .reduceMotion(ReduceMotion.System);
const LATEST_EXITING = FadeOutDown.duration(160)
  .easing(Easing.in(Easing.cubic))
  .reduceMotion(ReduceMotion.System);
/**
 * The question the person just sent rises from below the screen into the place
 * the list has already made for it. It sets off quickly and eases to a stop, so
 * the message is readable well before it settles. The list's own placement is
 * untouched: this is only how the row gets there.
 *
 * The curve is the one the button above already uses. An exponential ease-out
 * was tried first and measured on a device: three quarters of the travel was
 * over before the row cleared the keyboard, so what reached the eye was a jump
 * rather than a rise.
 */
const MESSAGE_ENTERING = SlideInDown.duration(400)
  .easing(Easing.out(Easing.cubic))
  .reduceMotion(ReduceMotion.System);

function textOfMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function copyText(text: string) {
  setStringAsync(text).catch(() => {
    // Nothing is announced on success either, so a refused clipboard leaves
    // the same screen behind and the person can try again.
  });
}

/**
 * One message, and what can be done with it.
 *
 * `hasActions` is off for the answer still on its way, which carries no icon
 * row, and for a panel that offers no per-message actions at all; while an
 * answer is arriving no message opens its menu either. `isDoomed` marks the
 * messages an edit in progress would drop. `isEntering` marks the one question
 * that comes in from below, and the row reports back once it has, so the list
 * rebuilding the row later leaves it where it is.
 */
function PlainTextMessage({
  areActionsDisabled,
  canOpenMenu,
  hasActions,
  isDoomed,
  isEntering,
  message,
  onAskInSideChat,
  onBeginEdit,
  onEntered,
  onRegenerate,
}: {
  areActionsDisabled: boolean;
  canOpenMenu: boolean;
  hasActions: boolean;
  isDoomed: boolean;
  isEntering: boolean;
  message: UIMessage;
  onAskInSideChat: ((input: AskInSideChat) => void) | undefined;
  onBeginEdit: (messageId: string) => void;
  onEntered: () => void;
  onRegenerate: (messageId: string) => void;
}) {
  // 장면 메시지는 화자 순서대로 자르고, 그 밖의 메시지는 지금까지처럼 텍스트
  // 하나로 읽는다. 복사도 같은 갈림을 따라서, 장면은 화자 이름이 살아 있는
  // 각본으로 복사된다.
  const scene =
    message.role === "assistant" ? sceneOfMessage(message) : undefined;
  const text = scene ? sceneCopyText(scene) : textOfMessage(message);
  const copy = useCallback(() => copyText(text), [text]);
  const regenerate = useCallback(
    () => onRegenerate(message.id),
    [message.id, onRegenerate]
  );
  const edit = useCallback(
    () => onBeginEdit(message.id),
    [message.id, onBeginEdit]
  );
  // Added to the system's own selection menu rather than replacing it, so
  // copy, look up and translate stay where they were. It is hidden — not
  // removed — while an answer is arriving or a message is being rewritten,
  // which is the same condition that closes the message menus.
  const selectionMenuItems = useMemo(
    () =>
      onAskInSideChat
        ? [
            {
              onPress: ({ text: phrase }: { text: string }) =>
                onAskInSideChat({ messageId: message.id, phrase }),
              text: chatLabels.askInSideChat,
              visible: canOpenMenu,
            },
          ]
        : undefined,
    [canOpenMenu, message.id, onAskInSideChat]
  );
  // The row keeps the answer it was built with. Reporting back below takes the
  // entry away from every later row, and this row is already on its way in.
  const [playsEntry] = useState(isEntering);

  useEffect(() => {
    if (isEntering) {
      onEntered();
    }
  }, [isEntering, onEntered]);

  if (!text) {
    return null;
  }

  let body = (
    <AssistantMessage
      areActionsDisabled={areActionsDisabled}
      hasActions={hasActions}
      onCopy={copy}
      onRegenerate={regenerate}
      selectionMenuItems={selectionMenuItems}
      text={text}
    />
  );

  if (message.role === "user") {
    body = (
      <UserMessage
        canOpenMenu={canOpenMenu}
        onCopy={copy}
        onEdit={edit}
        text={text}
      />
    );
  } else if (scene) {
    body = (
      <SceneMessage
        areActionsDisabled={areActionsDisabled}
        hasActions={hasActions}
        onCopy={copy}
        onRegenerate={regenerate}
        segments={scene}
        selectionMenuItems={selectionMenuItems}
      />
    );
  }

  return (
    <Animated.View
      className="mb-4"
      entering={playsEntry ? MESSAGE_ENTERING : undefined}
      style={{ opacity: isDoomed ? DOOMED_OPACITY : 1 }}
      testID="chat-message-row"
    >
      {body}
    </Animated.View>
  );
}

function messageKey(message: UIMessage) {
  return message.id;
}

/**
 * The ways back, stacked in one column just above the composer.
 *
 * The newest message and a side chat are both places a person left, and both
 * are reached from the same spot however far back they have read. The count
 * takes itself away when there is nothing to go back into.
 */
function ReturnControls({
  isEditing,
  isFollowingLatest,
  onMoveToLatest,
  onOpenSideChat,
  sideChats,
}: {
  isEditing: boolean;
  isFollowingLatest: boolean;
  onMoveToLatest: () => void;
  onOpenSideChat: ((id: string) => void) | undefined;
  sideChats: SideChatEntry[] | undefined;
}) {
  return (
    <View
      className="h-full items-center justify-end gap-2 pb-2"
      pointerEvents="box-none"
    >
      {isFollowingLatest ? null : (
        <Animated.View
          entering={LATEST_ENTERING}
          exiting={LATEST_EXITING}
          pointerEvents="box-none"
        >
          <LatestMessageButton onPress={onMoveToLatest} />
        </Animated.View>
      )}
      {sideChats && onOpenSideChat ? (
        <SideChatCount
          chats={sideChats}
          // Pressing it during an edit would leave the notice above a composer
          // that is no longer the one it is about.
          isDisabled={isEditing}
          onOpen={onOpenSideChat}
        />
      ) : null}
    </View>
  );
}

/**
 * What a conversation offers to write with, and what it has to say about the
 * last attempt.
 *
 * The error and the edit notice belong to the same block as the input: all
 * three are about the message being written, and a conversation that is over
 * replaces the three of them together.
 */
function Composer({
  canSend,
  canStop,
  chat,
  inputHeight,
  inputRef,
  onResize,
  onSend,
  onStop,
  placeholder,
}: {
  canSend: boolean;
  canStop: boolean;
  chat: ChatSession;
  inputHeight: number;
  inputRef?: Ref<TextInput>;
  onResize: (
    event: NativeSyntheticEvent<{
      contentSize: { height: number; width: number };
    }>
  ) => void;
  onSend: () => void;
  onStop: () => void;
  placeholder: string;
}) {
  return (
    <>
      {chat.error ? (
        <View className="flex-row items-center gap-2">
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            className="flex-1 text-danger text-sm"
            testID="chat-error"
          >
            {chatLabels.errorAnnouncement}
          </Text>
          <Pressable
            accessibilityLabel={chatLabels.retry}
            accessibilityRole="button"
            className="flex-row items-center gap-1 rounded-full border border-border px-3 py-1.5"
            onPress={chat.retry}
            testID="chat-retry"
          >
            <Icon name="regenerate" size="sm" />
            <Text className="text-foreground text-sm">{chatLabels.retry}</Text>
          </Pressable>
        </View>
      ) : null}

      {chat.editingMessageId ? (
        <View className="flex-row items-center gap-2" testID="chat-edit-notice">
          <Icon name="edit" size="sm" tone="muted" />
          <Text className="flex-1 text-muted text-xs leading-5">
            {chatLabels.editNotice}
          </Text>
          <Pressable
            accessibilityLabel={chatLabels.endEdit}
            accessibilityRole="button"
            hitSlop={8}
            onPress={chat.cancelEdit}
            testID="chat-edit-cancel"
          >
            <Icon name="close" size="sm" tone="muted" />
          </Pressable>
        </View>
      ) : null}

      <ComposerSurface>
        <TextInput
          accessibilityLabel={chatLabels.input}
          className="flex-1 px-3 py-2.5 text-base text-foreground"
          multiline
          onChangeText={chat.setDraft}
          onContentSizeChange={onResize}
          onSubmitEditing={onSend}
          placeholder={placeholder}
          ref={inputRef}
          returnKeyType="send"
          style={{ height: inputHeight, maxHeight: INPUT_MAX_HEIGHT }}
          submitBehavior="submit"
          testID="chat-input"
          value={chat.draft}
        />
        {/*
          One place, two jobs. While an answer is arriving that place ends it
          when this conversation allows stopping; the rest of the time it
          sends what has been typed. A conversation that must finish a server
          write keeps the disabled send button in that place instead.

          Both say whether they are disabled rather than leaving it out. The
          two sit at the same place in the tree, so React keeps one instance
          and only changes its props; on Android a `disabled` that stops being
          passed is never cleared on the native view, and the stop button
          inherits the send button's disabled state — it draws normally and
          refuses every touch.
        */}
        {chat.isBusy && canStop ? (
          <Pressable
            accessibilityLabel={chatLabels.stop}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
            className="h-11 w-11 items-center justify-center rounded-full bg-accent"
            disabled={false}
            onPress={onStop}
            testID="chat-send"
          >
            <Icon filled name="stop" size="sm" tone="accentForeground" />
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel={chatLabels.send}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
            className={
              canSend
                ? "h-11 w-11 items-center justify-center rounded-full bg-accent"
                : "h-11 w-11 items-center justify-center rounded-full bg-accent opacity-40"
            }
            disabled={!canSend}
            onPress={onSend}
            testID="chat-send"
          >
            <Icon name="send" tone="accentForeground" />
          </Pressable>
        )}
      </ComposerSurface>
    </>
  );
}

export function ChatPanel({
  banner,
  canStop = true,
  chat,
  closing,
  hasMessageActions = true,
  inputRef,
  onAskInSideChat,
  onOpenSideChat,
  placeholder = "메시지를 입력하세요",
  sideChats,
  source,
  topInset = 0,
}: {
  /**
   * What sits fixed just below the header, in view no matter how far the
   * conversation is scrolled or whether it has closed. Left out, no space is
   * reserved for it and the messages start right under the header.
   */
  banner?: ReactNode;
  /** Whether an answer still arriving can be ended from this panel. */
  canStop?: boolean;
  chat: ChatSession;
  /**
   * What stands where the composer was once there is nothing left to write.
   * Given, it replaces the input, the error and the edit notice together: the
   * conversation is over, so nothing there can be acted on any more.
   */
  closing?: ReactNode;
  /**
   * Whether one message carries actions of its own: copy, edit and asking for
   * the answer again. Off leaves the messages to be read.
   */
  hasMessageActions?: boolean;
  /**
   * Handed down by the screen, which decides when the input should take the
   * caret. The panel only says which control that is.
   */
  inputRef?: Ref<TextInput>;
  /**
   * What selecting part of a finished answer offers. Left out inside a side
   * chat, which is what keeps a side chat from starting another one.
   */
  onAskInSideChat?: (input: AskInSideChat) => void;
  onOpenSideChat?: (id: string) => void;
  /** What stands in the empty input. */
  placeholder?: string;
  /** The side chats to get back into, newest first. */
  sideChats?: SideChatEntry[];
  /** The read-only phrase a side chat started from. */
  source?: string;
  topInset?: number;
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<LegendListRef | null>(null);
  const composerRef = useRef<View | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number | undefined>();
  const [isFollowingLatest, setIsFollowingLatest] = useState(true);
  const [isPositioningQuestion, setIsPositioningQuestion] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);
  const pendingAnchorIndex = useRef<number | undefined>(undefined);
  const userMomentum = useRef<true | undefined>(undefined);
  const userScrollStart = useRef<number | undefined>(undefined);
  const canSend = chat.draft.trim().length > 0 && !chat.isBusy;
  const isClosed = closing !== undefined;
  const composerBottomPadding = Math.max(insets.bottom, 12);
  // 배너가 없는 화면은 자리도 요구하지 않는다. 있으면 잰 높이만큼 헤더 아래
  // 목록의 시작점을 더 내린다. 조건부로 배너를 넘기는 화면이 `null`을 주는
  // 것도 없는 것으로 친다.
  const hasBanner = banner !== undefined && banner !== null;
  const contentTopInset = topInset + (hasBanner ? bannerHeight : 0);
  const hasSideChats = sideChats !== undefined && sideChats.length > 0;
  const lastMessage = chat.messages.at(-1);
  const doomedFromIndex = chat.editingMessageId
    ? chat.messages.findIndex((message) => message.id === chat.editingMessageId)
    : -1;
  // The answer is still on its way from the moment the question goes until its
  // first character lands, which is either before any answer exists or while an
  // answer exists with nothing in it yet. Only a wait long enough to notice
  // puts a line in the answer's place; a quick one shows nothing at all.
  const isWaitingForAnswer =
    chat.isBusy &&
    (lastMessage?.role !== "assistant" || textOfMessage(lastMessage) === "");
  const isAnswerLate = useLateAnswer(isWaitingForAnswer);
  const { enteringMessageId, markEntered, markSent } = useEnteringMessage(
    chat.messages
  );
  const { contentInsetEndAdjustment, onComposerLayout } =
    useKeyboardChatComposerInset(listRef, composerRef);
  const { freeze, scrollMessageToEnd } = useKeyboardScrollToEnd({ listRef });

  const announcedError = useRef<Error | undefined>(undefined);

  useEffect(() => {
    if (!chat.error) {
      announcedError.current = undefined;
      return;
    }

    if (announcedError.current === chat.error) {
      return;
    }

    announcedError.current = chat.error;
    AccessibilityInfo.announceForAccessibility(chatLabels.errorAnnouncement);
  }, [chat.error]);

  // 마무리는 입력창보다 크다. 그 자리가 커지는 만큼 목록의 끝도 아래로
  // 내려가야 하는데, 자리의 높이가 바뀌었다고 목록이 스스로 따라가지는
  // 않는다. 그대로 두면 마지막 장면이 마무리 뒤에 가려진 채로 대화가 끝난다.
  // 잰 높이가 바뀔 때마다 끝으로 당기므로, 마무리가 자리를 잡은 뒤에 한 번 더
  // 맞춘다.
  useEffect(() => {
    // 아직 재지 않은 자리로는 끝을 계산할 수 없다.
    if (!isClosed || composerHeight === 0) {
      return;
    }

    setIsFollowingLatest(true);

    const frame = requestAnimationFrame(() => {
      scrollMessageToEnd({ animated: true, closeKeyboard: false }).catch(
        () => undefined
      );
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [composerHeight, isClosed, scrollMessageToEnd]);

  const beginUserScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      userMomentum.current = undefined;
      userScrollStart.current = event.nativeEvent.contentOffset.y;
    },
    []
  );
  const endUserScroll = useCallback(() => {
    userMomentum.current = undefined;
    userScrollStart.current = undefined;
  }, []);
  const endUserDrag = useCallback(() => {
    requestAnimationFrame(() => {
      if (userMomentum.current === undefined) {
        endUserScroll();
      }
    });
  }, [endUserScroll]);
  const beginUserMomentum = useCallback(() => {
    if (userScrollStart.current !== undefined) {
      userMomentum.current = true;
    }
  }, []);
  const updateScrollPosition = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const startOffset = userScrollStart.current;
      if (startOffset === undefined) {
        return;
      }

      const { contentOffset } = event.nativeEvent;
      if (contentOffset.y < 0) {
        return;
      }

      if (startOffset - contentOffset.y >= USER_SCROLL_THRESHOLD) {
        setIsFollowingLatest(false);
      }
    },
    []
  );
  const moveToLatest = useCallback(() => {
    setIsFollowingLatest(true);
    scrollMessageToEnd({ animated: true, closeKeyboard: false }).catch(
      () => undefined
    );
  }, [scrollMessageToEnd]);
  const handleEndVisible = useCallback((visible: boolean) => {
    if (visible) {
      setIsFollowingLatest(true);
    }
  }, []);
  const resizeInput = useCallback(
    (
      event: NativeSyntheticEvent<{
        contentSize: { height: number; width: number };
      }>
    ) => {
      setInputHeight(
        Math.min(
          INPUT_MAX_HEIGHT,
          Math.max(INPUT_MIN_HEIGHT, event.nativeEvent.contentSize.height)
        )
      );
    },
    []
  );
  const updateComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onComposerLayout(event);
      setComposerHeight(event.nativeEvent.layout.height);
    },
    [onComposerLayout]
  );
  const updateBannerLayout = useCallback((event: LayoutChangeEvent) => {
    setBannerHeight(event.nativeEvent.layout.height);
  }, []);
  const positionQuestion = useCallback<
    NonNullable<AnchoredEndSpaceConfig["onReady"]>
  >(
    async ({ anchorIndex: readyAnchorIndex }) => {
      if (readyAnchorIndex !== pendingAnchorIndex.current) {
        return;
      }

      pendingAnchorIndex.current = undefined;
      try {
        await new Promise<void>((resolve, reject) => {
          requestAnimationFrame(() => {
            scrollMessageToEnd({ animated: true, closeKeyboard: true }).then(
              resolve,
              reject
            );
          });
        });
      } catch {
        // The next user action can still recover the scroll position.
      } finally {
        setIsPositioningQuestion(false);
      }
    },
    [scrollMessageToEnd]
  );
  const send = useCallback(() => {
    if (!canSend) {
      return;
    }

    // Sending from the edit state drops the message it started from and
    // everything after it, so the new question lands where that message was.
    const nextAnchorIndex =
      doomedFromIndex >= 0 ? doomedFromIndex : chat.messages.length;
    const isFirstQuestion = nextAnchorIndex === 0;
    setAnchorIndex(nextAnchorIndex);
    setIsFollowingLatest(true);
    setInputHeight(INPUT_MIN_HEIGHT);
    if (!isFirstQuestion) {
      pendingAnchorIndex.current = nextAnchorIndex;
      setIsPositioningQuestion(true);
    }
    markSent();
    chat.send();

    if (isFirstQuestion) {
      requestAnimationFrame(() => {
        KeyboardController.dismiss();
      });
    }
  }, [canSend, chat, doomedFromIndex, markSent]);
  const stopAnswer = useCallback(() => {
    chat.stop().catch(() => {
      // The answer stays where it stopped either way.
    });
  }, [chat]);
  // Named fields rather than the session itself: the session is a new object
  // on every keystroke, and every message in view would be redrawn with it.
  const { beginEdit, isBusy, regenerateAnswer } = chat;
  const isEditing = chat.editingMessageId !== undefined;
  const messageCount = chat.messages.length;
  // The list redraws a row when the messages change or when this does, and a
  // fresh `renderItem` alone does not reach it. Everything a row reads beyond
  // its own message belongs here: without it the icon row never appears, since
  // the last answer arrives while the request is still open and nothing
  // changes in the list when it closes.
  const rowState = `${isBusy}|${isEditing}|${doomedFromIndex}`;
  const renderMessage = useCallback(
    ({ index, item }: LegendListRenderItemProps<UIMessage>) => (
      <PlainTextMessage
        areActionsDisabled={isEditing}
        canOpenMenu={hasMessageActions && !(isBusy || isEditing)}
        hasActions={
          hasMessageActions && !(isBusy && index === messageCount - 1)
        }
        isDoomed={doomedFromIndex >= 0 && index >= doomedFromIndex}
        isEntering={item.id === enteringMessageId}
        message={item}
        onAskInSideChat={onAskInSideChat}
        onBeginEdit={beginEdit}
        onEntered={markEntered}
        onRegenerate={regenerateAnswer}
      />
    ),
    [
      beginEdit,
      doomedFromIndex,
      enteringMessageId,
      hasMessageActions,
      isBusy,
      isEditing,
      markEntered,
      messageCount,
      onAskInSideChat,
      regenerateAnswer,
    ]
  );

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareLegendList
        anchoredEndSpace={
          anchorIndex === undefined
            ? undefined
            : {
                anchorIndex,
                anchorOffset: contentTopInset + MESSAGE_TOP_SPACING,
                onReady: anchorIndex === 0 ? undefined : positionQuestion,
              }
        }
        applyWorkaroundForContentInsetHitTestBug
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: contentTopInset + MESSAGE_TOP_SPACING,
        }}
        contentInsetAdjustmentBehavior="never"
        contentInsetEndAdjustment={contentInsetEndAdjustment}
        data={chat.messages}
        extraData={rowState}
        freeze={freeze}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardLiftBehavior="whenAtEnd"
        keyboardOffset={insets.bottom}
        keyboardShouldPersistTaps="handled"
        keyExtractor={messageKey}
        ListFooterComponent={isAnswerLate ? <WaitingAnswer /> : undefined}
        ListHeaderComponent={
          source === undefined ? undefined : <SideChatSource phrase={source} />
        }
        maintainScrollAtEnd={
          isFollowingLatest && !isPositioningQuestion
            ? {
                animated: false,
                on: { dataChange: true, itemLayout: true },
              }
            : false
        }
        maintainScrollAtEndThreshold={0.05}
        maintainVisibleContentPosition={{ data: false, size: true }}
        onEndVisible={handleEndVisible}
        onMomentumScrollBegin={beginUserMomentum}
        onMomentumScrollEnd={endUserScroll}
        onScroll={updateScrollPosition}
        onScrollBeginDrag={beginUserScroll}
        onScrollEndDrag={endUserDrag}
        recycleItems={false}
        ref={listRef}
        renderItem={renderMessage}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        testID="chat-list"
      />

      {/*
        Fixed at the same spot the header ends, on iOS or Android alike, so it
        never scrolls away and never sits under the header. Nothing in it is
        pressable, so touches fall through to the list underneath.
      */}
      {hasBanner ? (
        <View
          onLayout={updateBannerLayout}
          pointerEvents="none"
          style={{ left: 0, position: "absolute", right: 0, top: topInset }}
          testID="chat-banner"
        >
          {banner}
        </View>
      ) : null}

      {/*
        The composer floats over the list rather than taking a row of its own
        below it. Laid out as a sibling it would shorten the list, and the
        conversation would stop at a straight edge above the control instead of
        running on under it — with nothing behind the glass to show through.
        What keeps the messages clear of it is the end inset the list already
        reports from this composer's measured height.
      */}
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: composerBottomPadding - KEYBOARD_INPUT_GAP,
        }}
        style={{ bottom: 0, left: 0, position: "absolute", right: 0 }}
      >
        {/*
          No background of its own either: a band across the screen would cut
          the list off just as surely. The notice and the error sit on the same
          open ground, just above the control rather than inside it.
        */}
        <View
          className="gap-2 px-5 pt-2"
          onLayout={updateComposerLayout}
          ref={composerRef}
          style={{ paddingBottom: composerBottomPadding }}
          testID="chat-composer"
        >
          {/*
            사건이 끝난 대화는 쓸 자리를 남기지 않는다. 입력만 지우면 오류와
            수정 안내가 위에 뜬 채로 남으므로, 이 자리를 통째로 내준다.
          */}
          {closing === undefined ? (
            <Composer
              canSend={canSend}
              canStop={canStop}
              chat={chat}
              inputHeight={inputHeight}
              inputRef={inputRef}
              onResize={resizeInput}
              onSend={send}
              onStop={stopAnswer}
              placeholder={placeholder}
            />
          ) : (
            closing
          )}
        </View>
      </KeyboardStickyView>

      {/*
        The overlay stays mounted so that the button leaving has something to
        animate inside. Only the button itself comes and goes, which is also
        what keeps it out of the accessibility tree while the newest message
        is already in view.

        The way back to the newest message and the way back into a side chat
        stack here in one column: both are ways back, and both belong just
        above the composer wherever the person is reading.
      */}
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: composerBottomPadding - KEYBOARD_INPUT_GAP,
        }}
        pointerEvents="box-none"
        style={{
          bottom: composerHeight,
          height:
            LATEST_OVERLAY_HEIGHT +
            (hasSideChats ? SIDE_COUNT_OVERLAY_HEIGHT : 0),
          left: 0,
          position: "absolute",
          right: 0,
        }}
        testID="chat-latest-overlay"
      >
        <ReturnControls
          isEditing={isEditing}
          isFollowingLatest={isFollowingLatest}
          onMoveToLatest={moveToLatest}
          onOpenSideChat={onOpenSideChat}
          sideChats={sideChats}
        />
      </KeyboardStickyView>
    </View>
  );
}
