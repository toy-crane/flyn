import {
  KeyboardAwareLegendList,
  useKeyboardChatComposerInset,
} from "@legendapp/list/keyboard";
import type {
  AnchoredEndSpaceConfig,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import type { UIMessage } from "ai";
import {
  type ComponentType,
  type ReactElement,
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
  AppState,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  KeyboardController,
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import type { ChatSession } from "@/features/chat/state/use-conversation";
import { Icon } from "@/shared/ui/icon";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { AssistantMessage } from "./assistant-message";
import { chatLabels } from "./chat-labels";
import { ComposerBackdrop } from "./composer-backdrop";
import { COMPOSER_BACKDROP_FADE_HEIGHT } from "./composer-backdrop-layout";
import { ComposerSurface } from "./composer-surface";
import { LatestMessageButton } from "./latest-message-button";
import { copyToClipboard } from "./message-actions";
import { sceneCopyText, sceneOfMessage } from "./scene";
import { SceneMessage, type UtteranceAddon } from "./scene-message";
import { useLateAnswer } from "./use-late-answer";
import { UserMessage } from "./user-message";
import { WaitingAnswer } from "./waiting-answer";

// biome-ignore lint/performance/noBarrelFile: screens and tests share these accessibility names
export { chatLabels } from "./chat-labels";

const INPUT_MAX_HEIGHT = 120;
const INPUT_MIN_HEIGHT = 48;
const KEYBOARD_INPUT_GAP = 8;
const LATEST_OVERLAY_HEIGHT = 60;
const USER_SCROLL_THRESHOLD = 24;
const MESSAGE_TOP_SPACING = 12;
// 닫힘 신호나 스크롤 완료 신호가 빠져도 입력과 읽기를 계속할 수 있다.
const SCROLL_MOTION_TIMEOUT_MS = 4000;
// 서버 메시지가 아직 없을 때만 목록의 답변 자리를 확보한다.
// 채팅 세션이나 서버 요청에는 포함하지 않는다.
const WAITING_MESSAGE: UIMessage = {
  id: "flyn-waiting-answer",
  parts: [],
  role: "assistant",
};
/** Enough to read the messages about to go, not enough to mistake them for staying. */
const DOOMED_OPACITY = 0.38;
function textOfMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** 메시지 본문과 동작. 이동은 목록에서만 처리한다. */
function PlainTextMessage({
  areActionsDisabled,
  areActionsVisible,
  canOpenMenu,
  hasActions,
  isArriving,
  isDoomed,
  isWaiting,
  message,
  MessageAddon,
  onBeginEdit,
  onRegenerate,
  utteranceAddon,
}: {
  areActionsDisabled: boolean;
  areActionsVisible: boolean;
  canOpenMenu: boolean;
  hasActions: boolean;
  isArriving: boolean;
  isDoomed: boolean;
  isWaiting: boolean;
  message: UIMessage;
  MessageAddon: ComponentType<{ message: UIMessage }> | undefined;
  onBeginEdit: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  utteranceAddon: UtteranceAddon | undefined;
}) {
  // 장면 메시지는 화자 순서대로 자르고, 그 밖의 메시지는 지금까지처럼 텍스트
  // 하나로 읽는다. 복사도 같은 갈림을 따라서, 장면은 화자 이름이 살아 있는
  // 각본으로 복사된다.
  const scene = useMemo(
    () => (message.role === "assistant" ? sceneOfMessage(message) : undefined),
    [message]
  );
  const text = scene ? sceneCopyText(scene) : textOfMessage(message);
  const copy = useCallback(() => copyToClipboard(text), [text]);
  const regenerate = useCallback(
    () => onRegenerate(message.id),
    [message.id, onRegenerate]
  );
  const edit = useCallback(
    () => onBeginEdit(message.id),
    [message.id, onBeginEdit]
  );
  if (!text) {
    return isWaiting ? (
      <View className="mb-4" testID="chat-message-row">
        <WaitingAnswer />
      </View>
    ) : null;
  }

  let body = (
    <AssistantMessage
      areActionsDisabled={areActionsDisabled}
      areActionsVisible={areActionsVisible}
      hasActions={hasActions}
      onCopy={copy}
      onRegenerate={regenerate}
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
        areActionsVisible={areActionsVisible}
        hasActions={hasActions}
        isArriving={isArriving}
        messageId={message.id}
        onCopy={copy}
        onRegenerate={regenerate}
        segments={scene}
        utteranceAddon={utteranceAddon}
      />
    );
  }

  return (
    <Animated.View
      className="mb-4"
      style={{ opacity: isDoomed ? DOOMED_OPACITY : 1 }}
      testID="chat-message-row"
    >
      {body}
      {/*
        메시지에 매달리는 것이 있으면 말풍선 바로 아래에 선다. 무엇이 매달리는지
        이 자리는 알지 못한다. 매달린 것은 자기 상태를 스스로 읽으므로, 그것이
        생기거나 바뀌어도 목록이 이 행을 다시 만들지 않는다.
      */}
      {MessageAddon ? <MessageAddon message={message} /> : null}
    </Animated.View>
  );
}

function messageKey(message: UIMessage) {
  return message.id;
}

/** 입력창 바로 위에서 최신 메시지로 돌아가는 버튼. */
function ReturnControls({
  isFollowingLatest,
  onMoveToLatest,
}: {
  isFollowingLatest: boolean;
  onMoveToLatest: () => void;
}) {
  const isReducedMotion = useReducedMotion();
  const progress = useSharedValue(isFollowingLatest ? 0 : 1);
  const [isRendered, setIsRendered] = useState(!isFollowingLatest);
  const followingLatestRef = useRef(isFollowingLatest);
  const hideButton = useCallback(() => {
    if (followingLatestRef.current) {
      setIsRendered(false);
    }
  }, []);
  useEffect(() => {
    followingLatestRef.current = isFollowingLatest;
    const target = isFollowingLatest ? 0 : 1;
    if (!isFollowingLatest) {
      setIsRendered(true);
    }
    if (isReducedMotion) {
      progress.set(target);
      setIsRendered(!isFollowingLatest);
      return;
    }
    progress.set(
      withTiming(
        target,
        {
          duration: isFollowingLatest ? 160 : 200,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished && target === 0) {
            scheduleOnRN(hideButton);
          }
        }
      )
    );
  }, [hideButton, isFollowingLatest, isReducedMotion, progress]);
  const motionStyle = useAnimatedStyle(() => ({
    // 부모 opacity가 0이면 네이티브 Glass 재질도 사라진다.
    // 이동이 끝난 뒤 버튼을 제거하며 재질과 부모의 투명도는 바꾸지 않는다.
    transform: [{ translateY: (1 - progress.get()) * LATEST_OVERLAY_HEIGHT }],
  }));
  return (
    <View
      className="h-full items-center justify-end gap-2 pb-2"
      pointerEvents="box-none"
    >
      <Animated.View
        accessibilityElementsHidden={isFollowingLatest}
        importantForAccessibility={
          isFollowingLatest ? "no-hide-descendants" : "auto"
        }
        pointerEvents={isFollowingLatest ? "none" : "box-none"}
        style={motionStyle}
        testID="chat-latest-motion"
      >
        {isRendered ? <LatestMessageButton onPress={onMoveToLatest} /> : null}
      </Animated.View>
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
  busyLabel,
  canSend,
  canStop,
  chat,
  inputHeight,
  maxInputHeight,
  inputRef,
  onResize,
  onSend,
  onStop,
  placeholder,
}: {
  busyLabel: string | undefined;
  canSend: boolean;
  canStop: boolean;
  chat: ChatSession;
  inputHeight: number;
  maxInputHeight: number;
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
  let action = (
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
  );

  if (chat.isBusy && canStop) {
    action = (
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
    );
  } else if (chat.isBusy && busyLabel) {
    action = (
      <Pressable
        accessibilityLabel={chatLabels.stop}
        accessibilityRole="button"
        accessibilityState={{ busy: true, disabled: true }}
        accessibilityValue={{ text: busyLabel }}
        className="h-11 w-11 items-center justify-center rounded-full bg-accent"
        disabled
        testID="chat-send"
      >
        <LoadingSpinner color="accent-foreground" />
      </Pressable>
    );
  }

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
            accessibilityState={{ disabled: chat.isBusy }}
            className={
              chat.isBusy
                ? "flex-row items-center gap-1 rounded-full border border-border px-3 py-1.5 opacity-40"
                : "flex-row items-center gap-1 rounded-full border border-border px-3 py-1.5"
            }
            disabled={chat.isBusy}
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
          style={{ height: inputHeight, maxHeight: maxInputHeight }}
          submitBehavior="submit"
          testID="chat-input"
          value={chat.draft}
        />
        {/*
          One place, two jobs. While an answer is arriving that place ends it
          when this conversation allows stopping; the rest of the time it
          sends what has been typed. A conversation that must finish a server
          write keeps the Stop button there and replaces its icon with progress.

          Both say whether they are disabled rather than leaving it out. The
          two sit at the same place in the tree, so React keeps one instance
          and only changes its props; on Android a `disabled` that stops being
          passed is never cleared on the native view, and the stop button
          inherits the send button's disabled state — it draws normally and
          refuses every touch.
        */}
        {action}
      </ComposerSurface>
    </>
  );
}

export function ChatPanel({
  banner,
  busyLabel,
  canStop = true,
  chat,
  closing,
  hasMessageActions = true,
  inputRef,
  messageAddon,
  placeholder = "메시지를 입력하세요",
  source,
  topInset = 0,
  utteranceAddon,
}: {
  /**
   * What sits fixed just below the header, in view no matter how far the
   * conversation is scrolled or whether it has closed. Left out, no space is
   * reserved for it and the messages start right under the header.
   */
  banner?: ReactNode;
  /** Status read while the current action remains in the Stop button's place. */
  busyLabel?: string;
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
   * What hangs under one message, when a screen has something to hang there.
   *
   * A component rather than a rendered node: the panel places one per message
   * and never looks inside. Given a stable identity, what it draws can change
   * without the list rebuilding the row it sits in — which is how a correction
   * arriving mid-scene reaches one bubble instead of the whole conversation.
   */
  messageAddon?: ComponentType<{ message: UIMessage }>;
  /** What stands in the empty input. */
  placeholder?: string;
  /** The read-only source a side conversation started from, above its list. */
  source?: ReactElement;
  topInset?: number;
  /**
   * 인물 말풍선 하나를 감싸는 자리. 화면이 그 곁에 둘 것이 있을 때만 넘긴다.
   *
   * `messageAddon`과 같은 이유로 그려진 노드가 아니라 컴포넌트다. 패널은 말풍선
   * 하나마다 이것을 놓고 안을 들여다보지 않으므로, 곁에 붙은 것이 바뀌어도
   * 목록이 그 행을 다시 만들지 않는다.
   */
  utteranceAddon?: UtteranceAddon;
}) {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const minInputHeight = Math.max(
    INPUT_MIN_HEIGHT,
    Math.ceil(24 * fontScale + 20)
  );
  const maxInputHeight = Math.max(INPUT_MAX_HEIGHT, minInputHeight);
  const isReducedMotion = useReducedMotion();
  const keyboardHeight = useKeyboardState((state) => state.height);
  const listRef = useRef<LegendListRef | null>(null);
  const composerRef = useRef<View | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number | undefined>();
  const [anchorSpace, setAnchorSpace] = useState(0);
  const [isFollowingLatest, setIsFollowingLatest] = useState(true);
  const [isPositioningQuestion, setIsPositioningQuestion] = useState(false);
  const [isMovingToLatest, setIsMovingToLatest] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);
  const pendingAnchorIndex = useRef<number | undefined>(undefined);
  const questionMotionActive = useRef(false);
  const motionGeneration = useRef(0);
  const userMomentum = useRef<true | undefined>(undefined);
  const userScrollStart = useRef<number | undefined>(undefined);
  const canSend = chat.draft.trim().length > 0 && !chat.isBusy;
  const composerBottomPadding = Math.max(insets.bottom, 12);
  const hasBanner = banner !== undefined && banner !== null;
  const lastMessage = chat.messages.at(-1);
  const doomedFromIndex = chat.editingMessageId
    ? chat.messages.findIndex((message) => message.id === chat.editingMessageId)
    : -1;
  // The answer is still on its way from the moment the question goes until its
  // first character lands, which is either before any answer exists or while an
  // answer exists with nothing in it yet. Only a wait long enough to notice
  // puts a line in the answer's place; a quick one shows nothing at all.
  const isWaitingForAnswer =
    busyLabel === undefined &&
    chat.isBusy &&
    (lastMessage?.role !== "assistant" || textOfMessage(lastMessage) === "");
  const isAnswerLate = useLateAnswer(isWaitingForAnswer);
  const listMessages = useMemo(
    () =>
      isAnswerLate && lastMessage?.role !== "assistant"
        ? [...chat.messages, WAITING_MESSAGE]
        : chat.messages,
    [chat.messages, isAnswerLate, lastMessage?.role]
  );
  const { contentInsetEndAdjustment, onComposerLayout } =
    useKeyboardChatComposerInset(listRef, composerRef);
  const freeze = useSharedValue(false);
  const bottomOcclusion =
    composerHeight + Math.max(0, keyboardHeight - insets.bottom);
  const hasReachedEnd = useCallback((offset?: number) => {
    const state = listRef.current?.getState();
    return (
      state !== undefined &&
      Math.max(0, state.contentLength - state.scrollLength) -
        (offset ?? state.scroll) <=
        2
    );
  }, []);

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

  const cancelScrollMotion = useCallback(() => {
    motionGeneration.current += 1;
    pendingAnchorIndex.current = undefined;
    questionMotionActive.current = false;
    setIsPositioningQuestion(false);
    setIsMovingToLatest(false);
    freeze.set(false);
  }, [freeze]);

  useEffect(() => {
    if (!(isPositioningQuestion || isMovingToLatest)) {
      return;
    }
    const timeout = setTimeout(() => {
      cancelScrollMotion();
      setIsFollowingLatest(false);
    }, SCROLL_MOTION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [cancelScrollMotion, isMovingToLatest, isPositioningQuestion]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        const wasMoving = freeze.get() || questionMotionActive.current;
        cancelScrollMotion();
        if (wasMoving) {
          setIsFollowingLatest(false);
        }
      }
    });
    return () => {
      subscription.remove();
      motionGeneration.current += 1;
      freeze.set(false);
    };
  }, [cancelScrollMotion, freeze]);

  const beginUserScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      userMomentum.current = undefined;
      userScrollStart.current = event.nativeEvent.contentOffset.y;
      if (isPositioningQuestion || isMovingToLatest) {
        cancelScrollMotion();
        setIsFollowingLatest(false);
      }
    },
    [cancelScrollMotion, isMovingToLatest, isPositioningQuestion]
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

      // 끝이 보인다는 신호는 실제 끝에 도착하기 전에 한 번만 올 수 있다.
      // 사용자의 스크롤은 현재 이벤트 좌표로 도착 여부를 계속 확인한다.
      if (
        !(isPositioningQuestion || isMovingToLatest) &&
        hasReachedEnd(contentOffset.y)
      ) {
        setIsFollowingLatest(true);
      } else if (startOffset - contentOffset.y >= USER_SCROLL_THRESHOLD) {
        setIsFollowingLatest(false);
      }
    },
    [hasReachedEnd, isMovingToLatest, isPositioningQuestion]
  );
  const moveToLatest = useCallback(async () => {
    cancelScrollMotion();
    const generation = motionGeneration.current;
    const list = listRef.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: 네이티브 ref는 화면을 닫는 동안 null이 된다
    if (!list) {
      return;
    }
    setIsMovingToLatest(true);
    setIsFollowingLatest(false);
    freeze.set(true);
    try {
      const state = list.getState();
      const end = Math.max(0, state.contentLength - state.scrollLength);
      const viewport = Math.max(1, state.scrollLength - bottomOcclusion);
      if (!isReducedMotion && end - state.scroll > viewport) {
        await list.scrollToOffset({ animated: false, offset: end - viewport });
      }
      if (generation !== motionGeneration.current) {
        return;
      }
      // 첫 이동을 기다리는 동안 본문이 자라도 출발점과 같은 끝 좌표를 쓴다.
      await list.scrollToOffset({
        animated: !isReducedMotion,
        offset: end,
      });
    } catch {
      // 실패하거나 손으로 멈추면 버튼으로 다시 이동할 수 있다.
    } finally {
      if (generation === motionGeneration.current) {
        freeze.set(false);
        setIsMovingToLatest(false);
        setIsFollowingLatest(hasReachedEnd());
      }
    }
  }, [
    bottomOcclusion,
    cancelScrollMotion,
    freeze,
    hasReachedEnd,
    isReducedMotion,
  ]);
  const handleEndVisible = useCallback(
    (visible: boolean) => {
      if (
        visible &&
        !(isPositioningQuestion || isMovingToLatest) &&
        hasReachedEnd()
      ) {
        setIsFollowingLatest(true);
      }
    },
    [hasReachedEnd, isMovingToLatest, isPositioningQuestion]
  );
  const resizeInput = useCallback(
    (
      event: NativeSyntheticEvent<{
        contentSize: { height: number; width: number };
      }>
    ) => {
      setInputHeight(
        Math.min(
          maxInputHeight,
          Math.max(minInputHeight, event.nativeEvent.contentSize.height)
        )
      );
    },
    [maxInputHeight, minInputHeight]
  );
  const updateComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onComposerLayout(event);
      setComposerHeight(event.nativeEvent.layout.height);
    },
    [onComposerLayout]
  );
  const positionQuestion = useCallback<
    NonNullable<AnchoredEndSpaceConfig["onReady"]>
  >(
    async ({ anchorIndex: readyAnchorIndex }) => {
      if (
        readyAnchorIndex === undefined ||
        readyAnchorIndex !== pendingAnchorIndex.current
      ) {
        return;
      }

      pendingAnchorIndex.current = undefined;
      const generation = motionGeneration.current;
      try {
        await KeyboardController.dismiss({ animated: !isReducedMotion });
        if (generation !== motionGeneration.current) {
          return;
        }
        // 닫힘 신호 다음에 입력창 인셋과 목록의 배치를 반영한다.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });
        if (generation !== motionGeneration.current) {
          return;
        }
        await listRef.current?.scrollToIndex({
          animated: !isReducedMotion,
          index: readyAnchorIndex,
          viewOffset: MESSAGE_TOP_SPACING,
          viewPosition: 0,
        });
      } catch {
        // 사용자가 다음 동작으로 읽을 위치를 정할 수 있다.
      } finally {
        if (generation === motionGeneration.current) {
          questionMotionActive.current = false;
          setIsPositioningQuestion(false);
          setIsFollowingLatest(hasReachedEnd());
        }
      }
    },
    [hasReachedEnd, isReducedMotion]
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
    cancelScrollMotion();
    setAnchorIndex(nextAnchorIndex);
    setIsFollowingLatest(true);
    setInputHeight(minInputHeight);
    if (!isFirstQuestion) {
      pendingAnchorIndex.current = nextAnchorIndex;
      questionMotionActive.current = true;
      setIsPositioningQuestion(true);
    }
    chat.send();

    if (isFirstQuestion) {
      requestAnimationFrame(() => {
        KeyboardController.dismiss();
      });
    }
  }, [cancelScrollMotion, canSend, chat, doomedFromIndex, minInputHeight]);
  const stopAnswer = useCallback(() => {
    chat.stop().catch(() => {
      // The answer stays where it stopped either way.
    });
  }, [chat]);
  // Named fields rather than the session itself: the session is a new object
  // on every keystroke, and every message in view would be redrawn with it.
  const { beginEdit, isBusy, regenerateAnswer } = chat;
  const isEditing = chat.editingMessageId !== undefined;
  const messageCount = listMessages.length;
  // The list redraws a row when the messages change or when this does, and a
  // fresh `renderItem` alone does not reach it. Everything a row reads beyond
  // its own message belongs here: without it the icon row never appears, since
  // the last answer arrives while the request is still open and nothing
  // changes in the list when it closes.
  const rowState = `${isBusy}|${isEditing}|${doomedFromIndex}|${isAnswerLate}`;
  const renderMessage = useCallback(
    ({ index, item }: LegendListRenderItemProps<UIMessage>) => (
      <PlainTextMessage
        areActionsDisabled={isEditing}
        areActionsVisible={!(isBusy && index === messageCount - 1)}
        canOpenMenu={hasMessageActions && !(isBusy || isEditing)}
        hasActions={hasMessageActions}
        /*
          아직 도착하는 중인 답변. 그 메시지는 서버가 다 흘린 뒤에 저장하므로,
          흐르는 동안 담으려 하면 계정에 없는 자리를 가리켜 실패한다. 곁에 무엇을
          매다는 자리가 이것을 받아 그동안 무엇을 할지 정한다.
        */
        isArriving={isBusy && index === messageCount - 1}
        isDoomed={doomedFromIndex >= 0 && index >= doomedFromIndex}
        isWaiting={isAnswerLate && index === messageCount - 1}
        MessageAddon={messageAddon}
        message={item}
        onBeginEdit={beginEdit}
        onRegenerate={regenerateAnswer}
        utteranceAddon={utteranceAddon}
      />
    ),
    [
      beginEdit,
      doomedFromIndex,
      hasMessageActions,
      isAnswerLate,
      isBusy,
      isEditing,
      messageAddon,
      messageCount,
      regenerateAnswer,
      utteranceAddon,
    ]
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: topInset }}
      testID="chat-panel"
    >
      {hasBanner ? (
        <View pointerEvents="none" testID="chat-banner">
          {banner}
        </View>
      ) : null}
      <KeyboardAwareLegendList
        anchoredEndSpace={
          anchorIndex === undefined
            ? undefined
            : {
                anchorIndex,
                anchorOffset: MESSAGE_TOP_SPACING,
                onReady: anchorIndex === 0 ? undefined : positionQuestion,
                onSizeChanged: setAnchorSpace,
              }
        }
        applyWorkaroundForContentInsetHitTestBug
        contentContainerStyle={{
          paddingBottom:
            closing !== undefined && Platform.OS === "ios"
              ? COMPOSER_BACKDROP_FADE_HEIGHT
              : 0,
          paddingHorizontal: 20,
          paddingTop: MESSAGE_TOP_SPACING,
        }}
        contentInsetAdjustmentBehavior="never"
        contentInsetEndAdjustment={contentInsetEndAdjustment}
        data={listMessages}
        extraData={rowState}
        freeze={freeze}
        initialScrollAtEnd
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardLiftBehavior={
          isPositioningQuestion ? "persistent" : "whenAtEnd"
        }
        keyboardOffset={insets.bottom}
        keyboardShouldPersistTaps="handled"
        keyExtractor={messageKey}
        ListHeaderComponent={source ?? undefined}
        maintainScrollAtEnd={
          isFollowingLatest &&
          !isPositioningQuestion &&
          !isMovingToLatest &&
          anchorSpace <= bottomOcclusion
            ? {
                animated: false,
                on: { dataChange: true, itemLayout: true, layout: true },
              }
            : false
        }
        // 추적 여부는 사용자 동작으로 정한다. 글자나 상황 줄이 커진 거리는
        // 추적을 끄는 이유가 아니므로 목록 내부의 거리 기준은 제한하지 않는다.
        maintainScrollAtEndThreshold={Number.POSITIVE_INFINITY}
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

      {/* 흐림은 대화에만 적용하고 최신 메시지 버튼은 그 위에 그린다. */}
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: composerBottomPadding - KEYBOARD_INPUT_GAP,
        }}
        pointerEvents="none"
        style={{ bottom: 0, left: 0, position: "absolute", right: 0 }}
      >
        <ComposerBackdrop
          height={composerHeight}
          variant={closing === undefined ? "composer" : "closing"}
        />
      </KeyboardStickyView>

      {/* 입력창보다 먼저 그려 버튼이 입력창 뒤로 내려간다. */}
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: composerBottomPadding - KEYBOARD_INPUT_GAP,
        }}
        pointerEvents="box-none"
        style={{
          bottom: composerHeight,
          height: LATEST_OVERLAY_HEIGHT,
          left: 0,
          overflow: "hidden",
          position: "absolute",
          right: 0,
        }}
        testID="chat-latest-overlay"
      >
        <ReturnControls
          isFollowingLatest={isFollowingLatest}
          onMoveToLatest={moveToLatest}
        />
      </KeyboardStickyView>

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
              busyLabel={busyLabel}
              canSend={canSend}
              canStop={canStop}
              chat={chat}
              inputHeight={Math.max(minInputHeight, inputHeight)}
              inputRef={inputRef}
              maxInputHeight={maxInputHeight}
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
    </View>
  );
}
