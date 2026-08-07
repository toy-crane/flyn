import Ionicons from "@expo/vector-icons/Ionicons";
import {
  KeyboardAwareLegendList,
  useKeyboardChatComposerInset,
} from "@legendapp/list/keyboard";
import type { LegendListRef } from "@legendapp/list/react-native";
import type { ChatStatus } from "ai";
import {
  Button,
  LinkButton,
  Spinner,
  Surface,
  Typography,
  useThemeColor,
} from "heroui-native";
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardGestureArea,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Reanimated, {
  Keyframe,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MessageMark } from "../../lib/message-feedback";
import { ChatMarkdown } from "./chat-markdown";
import { MessageMarkView } from "./message-mark";
import { StreamingMessage } from "./streaming-message";
import type { StreamingStore } from "./streaming-store";

const COMPOSER_NATIVE_ID = "chat-composer";
const BOTTOM_THRESHOLD = 72;
const COMPOSER_MIN_HEIGHT = 52;
const COMPOSER_MARGIN = 8;
/** safe area가 없는 기기에서도 composer가 화면 끝에 붙지 않게 두는 최소 여백. */
const MIN_COMPOSER_INSET = 8;
const SCROLL_BUTTON_TIMING = {
  duration: 160,
  reduceMotion: ReduceMotion.System,
};
const CHAT_ERROR_ENTERING = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: 6 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
})
  .duration(160)
  .reduceMotion(ReduceMotion.System);
const CHAT_ERROR_EXITING = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  100: {
    opacity: 0,
    transform: [{ translateY: 6 }],
  },
})
  .duration(140)
  .reduceMotion(ReduceMotion.System);
const CHAT_RECOVERY_LAYOUT = LinearTransition.duration(160).reduceMotion(
  ReduceMotion.System
);

/**
 * 가상 목록과 키보드 컴포넌트는 Uniwind가 감싸는 대상이 아니라 `className`을
 * 받지 못한다. 이 네 개만 style로 남고 나머지 표현은 전부 토큰 클래스가 나른다
 * (docs/decisions/uniwind-css-theme.md).
 */
const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stickyComposer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
});

export interface DisplayChatMessage {
  content: string;
  id: string;
  kind: "message";
  /** 판정이 아직 없으면 비어 있다. 자리는 그대로 두고 값만 나중에 채운다. */
  mark?: MessageMark;
  role: "assistant" | "user";
  status: "complete" | "stopped";
}

/**
 * 대화 흐름에 영구히 남는 한 줄. 말풍선이 아니라 기록이라 가운데에 서고 누를
 * 수 없다. 무엇을 적을지는 화면이 정한다.
 */
export interface DisplayChatNote {
  id: string;
  kind: "note";
  text: string;
}

export type DisplayChatItem = DisplayChatMessage | DisplayChatNote;

export interface ChatController {
  error: Error | null;
  input: string;
  messages: DisplayChatItem[];
  onRetry: () => void;
  onSend: () => void;
  setInput: (value: string) => void;
  status: ChatStatus;
  stop: () => void;
  streamingStore: StreamingStore;
}

function messageKey(item: DisplayChatItem) {
  return item.id;
}

function isGeneratingStatus(status: ChatStatus) {
  return status === "submitted" || status === "streaming";
}

/**
 * 말풍선 본문은 누를 것이 아니다. 표시 없는 탭은 발견되지 않으므로 여는 일은
 * 곁의 표시가 맡고, 본문은 애플 메시지처럼 눌러도 아무 일이 없다.
 */
function UserMessage({
  content,
  mark,
  onMarkPress,
}: {
  content: string;
  mark?: MessageMark;
  onMarkPress?: () => void;
}) {
  return (
    <View
      className="mb-3 flex-row items-center justify-end"
      testID="user-message-row"
    >
      {/*
       * 말풍선 곁의 표시는 본문이 아니라 44pt 고정 열에 둔다. 판정이 늦게
       * 도착해 표시가 나중에 채워져도 말풍선은 제자리에 있다.
       */}
      <View className="size-11" testID="user-message-mark">
        {mark ? <MessageMarkView mark={mark} onPress={onMarkPress} /> : null}
      </View>
      <View
        className="max-w-3/4 rounded-3xl bg-default px-4 py-3"
        testID="user-message"
      >
        <Typography selectable>{content}</Typography>
      </View>
    </View>
  );
}

/**
 * 흐름에 남는 기록 한 줄. 스크롤만으로 언제 있었는지 되짚을 수 있어야 하므로
 * 말풍선 사이에 그대로 선다.
 */
function ConversationNote({ text }: { text: string }) {
  const onSuccess = useThemeColor("success-foreground");

  return (
    <View
      className="mb-3 flex-row items-center justify-center gap-2 py-1"
      testID="conversation-note"
    >
      <View
        className="size-4 items-center justify-center rounded-full bg-success"
        testID="conversation-note-check"
      >
        {/* 줄 전체가 이미 무슨 일이 있었는지 말한다 — 매핑되지 않은 글리프가
            정지점을 만들지 않게 체크는 트리에서 숨긴다
            (docs/decisions/apple-hig-with-app-theme.md). */}
        <Ionicons
          accessibilityElementsHidden
          color={onSuccess}
          name="checkmark"
          size={9}
        />
      </View>
      <Typography className="text-success" type="body-xs">
        {text}
      </Typography>
    </View>
  );
}

function AssistantMessage({
  content,
  status,
  streamingStore,
  streaming,
}: {
  content: string;
  status: DisplayChatMessage["status"];
  streaming: boolean;
  streamingStore: StreamingStore;
}) {
  return (
    <View className="mb-4 w-full" testID="assistant-message">
      {streaming ? (
        <StreamingMessage store={streamingStore} />
      ) : (
        <ChatMarkdown>{content}</ChatMarkdown>
      )}
      {status === "stopped" ? (
        <Typography className="mt-1" color="muted" type="body-xs">
          중단됨
        </Typography>
      ) : null}
    </View>
  );
}

/**
 * 오류 배너. composer와의 공간 관계를 유지하며 나타나고 사라진다
 * (docs/decisions/native-motion.md). 새 입력은 그대로 보낼 수 있으므로 배너는
 * composer를 막지 않고 그 위에 얹힌다.
 */
function ChatErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <Reanimated.View
      entering={CHAT_ERROR_ENTERING}
      exiting={CHAT_ERROR_EXITING}
      layout={CHAT_RECOVERY_LAYOUT}
      testID="chat-error-banner"
    >
      {/* 반지름은 HeroUI 스케일에서 고른다 — `--radius-2xl`이 곧 16pt다. */}
      <Surface
        className="mb-2 flex-row items-center gap-3 rounded-2xl px-4 py-3"
        testID="chat-error-surface"
      >
        <Typography className="flex-1" type="body-xs">
          응답을 만들지 못했어요.
        </Typography>
        {/* 손가락이 닿을 44pt를 세로로 확보한다 — LinkButton은 높이·padding을
            스스로 0으로 두므로 min-height로만 늘린다. */}
        <LinkButton
          accessibilityLabel="다시 시도"
          className="min-h-11"
          onPress={onRetry}
          size="sm"
        >
          <LinkButton.Label>다시 시도</LinkButton.Label>
        </LinkButton>
      </Surface>
    </Reanimated.View>
  );
}

function Composer({
  chat,
  bottomInset,
  placeholder,
}: {
  bottomInset: number;
  chat: ChatController;
  placeholder: string;
}) {
  const [foreground, onAccent, placeholderColor] = useThemeColor([
    "foreground",
    "accent-foreground",
    "field-placeholder",
  ]);
  const canSend = chat.input.trim().length > 0;
  const isGenerating = isGeneratingStatus(chat.status);
  const actionLabel = isGenerating ? "응답 중단" : "메시지 보내기";
  const disabled = !(isGenerating || canSend);
  const handleAction = isGenerating ? chat.stop : chat.onSend;

  return (
    <View
      className="px-3 pt-2"
      // safe area는 런타임 값이라 토큰으로 접을 수 없는 자리다.
      style={{ paddingBottom: Math.max(bottomInset, MIN_COMPOSER_INSET) }}
    >
      {chat.error ? <ChatErrorBanner onRetry={chat.onRetry} /> : null}

      <View
        className="min-h-13 flex-row items-end overflow-hidden rounded-3xl bg-field"
        testID="chat-composer-surface"
      >
        <TextInput
          accessibilityLabel="메시지"
          // 글자 크기는 `text-base`가 아니라 짝 line-height가 없는 앱 토큰을
          // 쓴다. 고정 line-height는 큰 Dynamic Type에서 글자를 자른다
          // (apps/mobile/global.css).
          className="max-h-28 min-h-13 flex-1 px-4 py-3.5 text-composer text-field-foreground"
          cursorColor={foreground}
          maxLength={4000}
          multiline
          nativeID={COMPOSER_NATIVE_ID}
          onChangeText={chat.setInput}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          selectionColor={foreground}
          textAlignVertical="top"
          value={chat.input}
        />
        <Button
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          className="m-1 size-11 rounded-full"
          isDisabled={disabled}
          isIconOnly
          onPress={handleAction}
        >
          {chat.status === "submitted" ? (
            // 눌러서 시작된 일이라 이 progress는 action의 전경색을 따른다
            // (docs/decisions/apple-hig-with-app-theme.md).
            <Spinner
              accessible={false}
              color={onAccent}
              size="sm"
              testID="composer-submit-spinner"
            />
          ) : (
            // 보낼 수 없는 상태는 라이브러리가 버튼 전체를 흐리게 만든다.
            // 그 위에 회색 글리프를 얹으면 대비만 잃는다.
            <Ionicons
              accessibilityElementsHidden
              color={onAccent}
              name={chat.status === "streaming" ? "stop" : "arrow-up"}
              size={17}
            />
          )}
        </Button>
      </View>
    </View>
  );
}

/**
 * 스트리밍 대화 표면. 목록 머리와 composer 위 자리는 화면이 채운다 —
 * 무엇이 대화 위에 얹히는지는 이 컴포넌트가 정하지 않는다
 * (docs/decisions/ai-chat-experience.md).
 */
export function ChatConversation({
  chat,
  dock,
  ending,
  listHeader,
  onMarkPress,
  placeholder = "메시지 보내기",
}: {
  chat: ChatController;
  dock?: ReactNode;
  /**
   * 대화가 끝났을 때 composer 자리에 대신 서는 것. 있으면 목표 바와 입력이 함께
   * 사라진다 — 더 보낼 수 없는 자리에 입력만 비워 두면 무엇이 끝났는지 말하지
   * 못한다. 위의 대화는 그대로 남는다.
   */
  ending?: ReactNode;
  listHeader?: ReactElement | null;
  /** 표시를 눌렀을 때 무엇이 열리는지는 화면이 정한다. */
  onMarkPress?: (messageId: string) => void;
  placeholder?: string;
}) {
  const insets = useSafeAreaInsets();
  const muted = useThemeColor("muted");
  const listRef = useRef<LegendListRef>(null);
  const composerRef = useRef<View>(null);
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { contentInsetEndAdjustment, onComposerLayout } =
    useKeyboardChatComposerInset(listRef, composerRef);
  const keyboardOffset = Math.max(insets.bottom - COMPOSER_MARGIN, 0);
  const showScrollButton = !isAtBottom;
  const maintainScrollAtEndThreshold =
    listViewportHeight > 0
      ? Math.min(1, BOTTOM_THRESHOLD / listViewportHeight)
      : 0.1;
  const scrollButtonProgress = useSharedValue(showScrollButton ? 1 : 0);
  const scrollButtonStyle = useAnimatedStyle(() => ({
    opacity: scrollButtonProgress.value,
    transform: [{ translateY: 6 * (1 - scrollButtonProgress.value) }],
  }));

  useEffect(() => {
    scrollButtonProgress.value = withTiming(
      showScrollButton ? 1 : 0,
      SCROLL_BUTTON_TIMING
    );
  }, [scrollButtonProgress, showScrollButton]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setListViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentInset, contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distance =
        contentSize.height +
        (contentInset?.bottom ?? 0) -
        layoutMeasurement.height -
        contentOffset.y;
      const nextAtBottom = distance <= BOTTOM_THRESHOLD;

      setIsAtBottom(nextAtBottom);
    },
    []
  );

  const renderMessage = useCallback(
    ({ item }: { item: DisplayChatItem }) => {
      if (item.kind === "note") {
        return <ConversationNote text={item.text} />;
      }

      if (item.role === "user") {
        return (
          <UserMessage
            content={item.content}
            mark={item.mark}
            onMarkPress={onMarkPress ? () => onMarkPress(item.id) : undefined}
          />
        );
      }

      // 본문이 빈 AI 메시지는 지금 받고 있는 응답 하나뿐이다. 늦게 도착한
      // 기록이 목록 끝에 붙어도 어느 것이 스트리밍인지 흔들리지 않는다.
      return (
        <AssistantMessage
          content={item.content}
          status={item.status}
          streaming={
            isGeneratingStatus(chat.status) && item.content.length === 0
          }
          streamingStore={chat.streamingStore}
        />
      );
    },
    [chat.status, chat.streamingStore, onMarkPress]
  );

  return (
    <View className="flex-1 bg-background">
      <KeyboardGestureArea
        interpolator="ios"
        offset={COMPOSER_MIN_HEIGHT}
        style={styles.keyboardArea}
        testID="chat-keyboard-layout"
        textInputNativeID={COMPOSER_NATIVE_ID}
      >
        <View
          className="min-h-0 flex-1"
          onLayout={handleViewportLayout}
          testID="chat-message-viewport"
        >
          <KeyboardAwareLegendList
            contentContainerStyle={styles.listContent}
            contentInsetEndAdjustment={contentInsetEndAdjustment}
            data={chat.messages}
            estimatedItemSize={84}
            initialScrollAtEnd
            keyboardDismissMode="interactive"
            keyboardLiftBehavior={isAtBottom ? "always" : "never"}
            keyboardOffset={keyboardOffset}
            keyboardShouldPersistTaps="handled"
            keyExtractor={messageKey}
            ListHeaderComponent={listHeader}
            maintainScrollAtEnd={{
              animated: false,
              on: {
                dataChange: true,
                itemLayout: true,
                layout: true,
              },
            }}
            maintainScrollAtEndThreshold={maintainScrollAtEndThreshold}
            onScroll={handleScroll}
            recycleItems
            ref={listRef}
            renderItem={renderMessage}
            scrollEventThrottle={16}
            style={styles.list}
            testID="chat-message-list"
          />
        </View>

        <KeyboardStickyView
          offset={{
            opened: keyboardOffset,
          }}
          style={styles.stickyComposer}
          testID="chat-composer-sticky"
        >
          <View
            onLayout={onComposerLayout}
            ref={composerRef}
            testID="chat-composer-layout"
          >
            {/*
             * 버튼을 composer 위 가운데에 세우는 자리다. 전체 폭을 덮으므로
             * 스스로 터치를 받으면 안 된다 — 버튼이 보이는 때는 사용자가
             * 스크롤을 올린 때뿐이라, 여기서 터치를 삼키면 목록 드래그와
             * 말풍선 곁 표시 탭이 막힌다. `box-none`은 자식만 터치 대상으로
             * 남기고 나머지는 아래 목록으로 흘려보낸다.
             */}
            <View
              accessibilityElementsHidden={!showScrollButton}
              className="absolute inset-x-0 -top-15 z-10 items-center"
              importantForAccessibility={
                showScrollButton ? "auto" : "no-hide-descendants"
              }
              pointerEvents={showScrollButton ? "box-none" : "none"}
              testID="chat-scroll-to-bottom-anchor"
            >
              <Reanimated.View
                style={scrollButtonStyle}
                testID="chat-scroll-to-bottom-motion"
              >
                <Button
                  accessibilityLabel="맨 아래로"
                  accessibilityRole="button"
                  // 목록 위에 떠 있는 버튼이라 배경과 갈라지는 surface를 쓴다 —
                  // secondary의 `default`는 background와 거의 같은 회색이다.
                  className="size-11 rounded-full bg-surface"
                  isIconOnly
                  onPress={scrollToBottom}
                  variant="secondary"
                >
                  <Ionicons
                    accessibilityElementsHidden
                    color={muted}
                    name="chevron-down"
                    size={16}
                  />
                </Button>
              </Reanimated.View>
            </View>
            {ending ?? (
              <>
                {dock}
                <Composer
                  bottomInset={insets.bottom}
                  chat={chat}
                  placeholder={placeholder}
                />
              </>
            )}
          </View>
        </KeyboardStickyView>
      </KeyboardGestureArea>
    </View>
  );
}
