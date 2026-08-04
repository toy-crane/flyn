import {
  KeyboardAwareLegendList,
  useKeyboardChatComposerInset,
} from "@legendapp/list/keyboard";
import type { LegendListRef } from "@legendapp/list/react-native";
import type { ChatStatus } from "ai";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardGestureArea,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
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
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";
import { ChatMarkdown } from "./chat-markdown";
import { StreamingMessage } from "./streaming-message";
import type { StreamingStore } from "./streaming-store";

const COMPOSER_NATIVE_ID = "chat-composer";
const BOTTOM_THRESHOLD = 72;
const COMPOSER_MIN_HEIGHT = 52;
const COMPOSER_MARGIN = 8;
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

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: 22,
    justifyContent: "center",
    margin: spacing.xxs,
    minHeight: 44,
    minWidth: 44,
  },
  assistantMessage: {
    marginBottom: spacing.md,
    width: "100%",
  },
  composer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  composerInput: {
    flex: 1,
    maxHeight: 112,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  composerSurface: {
    alignItems: "flex-end",
    borderRadius: 24,
    flexDirection: "row",
    minHeight: 52,
    overflow: "hidden",
  },
  emptyDescription: {
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    bottom: 0,
    gap: spacing.xs,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: spacing.xl,
    position: "absolute",
    right: 0,
    top: 0,
  },
  errorBanner: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  retryAction: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  retryText: {
    fontWeight: "600",
  },
  screen: {
    flex: 1,
  },
  scrollButton: {
    alignItems: "center",
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  scrollButtonAnchor: {
    left: "50%",
    position: "absolute",
    top: -60,
    transform: [{ translateX: -22 }],
    zIndex: 1,
  },
  stickyComposer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  stopped: {
    fontSize: 12,
    marginTop: spacing.xxs,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderRadius: 20,
    marginBottom: spacing.sm,
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewport: {
    flex: 1,
    minHeight: 0,
  },
});

export interface DisplayChatMessage {
  content: string;
  id: string;
  role: "assistant" | "user";
  status: "complete" | "stopped";
}

export interface ChatController {
  error: Error | null;
  input: string;
  messages: DisplayChatMessage[];
  onRetry: () => void;
  onSend: () => void;
  setInput: (value: string) => void;
  status: ChatStatus;
  stop: () => void;
  streamingStore: StreamingStore;
}

function messageKey(message: DisplayChatMessage) {
  return message.id;
}

function isGeneratingStatus(status: ChatStatus) {
  return status === "submitted" || status === "streaming";
}

function UserMessage({ content }: { content: string }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[styles.userMessage, { backgroundColor: colors.userBubble }]}
      testID="user-message"
    >
      <Text
        selectable
        style={[
          typography.message,
          {
            color: colors.onUserBubble,
            lineHeight: 22,
          },
        ]}
      >
        {content}
      </Text>
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
  const { colors } = useTheme();

  return (
    <View style={styles.assistantMessage} testID="assistant-message">
      {streaming ? (
        <StreamingMessage store={streamingStore} />
      ) : (
        <ChatMarkdown>{content}</ChatMarkdown>
      )}
      {status === "stopped" ? (
        <Text style={[styles.stopped, { color: colors.secondaryText }]}>
          중단됨
        </Text>
      ) : null}
    </View>
  );
}

function ComposerSurface({ children }: { children: ReactNode }) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        style={styles.composerSurface}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      intensity={72}
      style={styles.composerSurface}
      tint="systemChromeMaterial"
    >
      {children}
    </BlurView>
  );
}

function Composer({
  chat,
  bottomInset,
}: {
  bottomInset: number;
  chat: ChatController;
}) {
  const { colors, typography } = useTheme();
  const canSend = chat.input.trim().length > 0;
  const isGenerating = isGeneratingStatus(chat.status);
  const actionLabel = isGenerating ? "응답 중단" : "메시지 보내기";
  const disabled = !(isGenerating || canSend);
  const handleAction = isGenerating ? chat.stop : chat.onSend;

  return (
    <View
      style={[
        styles.composer,
        { paddingBottom: Math.max(bottomInset, spacing.xs) },
      ]}
    >
      {chat.error ? (
        <Reanimated.View
          entering={CHAT_ERROR_ENTERING}
          exiting={CHAT_ERROR_EXITING}
          layout={CHAT_RECOVERY_LAYOUT}
          style={[styles.errorBanner, { backgroundColor: colors.surface }]}
          testID="chat-error-banner"
        >
          <Text
            style={[
              styles.errorText,
              typography.caption,
              { color: colors.text },
            ]}
          >
            응답을 만들지 못했어요.
          </Text>
          <Pressable
            accessibilityLabel="다시 시도"
            accessibilityRole="button"
            onPress={chat.onRetry}
            style={styles.retryAction}
          >
            <Text
              style={[
                styles.retryText,
                typography.caption,
                { color: colors.text },
              ]}
            >
              다시 시도
            </Text>
          </Pressable>
        </Reanimated.View>
      ) : null}

      <View testID="chat-composer-surface">
        <ComposerSurface>
          <TextInput
            accessibilityLabel="메시지"
            cursorColor={colors.text}
            maxLength={4000}
            multiline
            nativeID={COMPOSER_NATIVE_ID}
            onChangeText={chat.setInput}
            placeholder="메시지 보내기"
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.text}
            style={[
              styles.composerInput,
              typography.message,
              {
                color: colors.text,
                lineHeight: undefined,
              },
            ]}
            textAlignVertical="top"
            value={chat.input}
          />
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            disabled={disabled}
            onPress={handleAction}
            style={[
              styles.action,
              {
                backgroundColor: disabled ? colors.disabled : colors.primary,
                opacity: disabled ? 0.7 : 1,
              },
            ]}
          >
            {chat.status === "submitted" ? (
              <ActivityIndicator
                accessible={false}
                color={colors.onPrimary}
                size="small"
                testID="composer-submit-spinner"
              />
            ) : (
              <SymbolView
                name={chat.status === "streaming" ? "stop.fill" : "arrow.up"}
                size={17}
                tintColor={disabled ? colors.disabledText : colors.onPrimary}
                weight="semibold"
              />
            )}
          </Pressable>
        </ComposerSurface>
      </View>
    </View>
  );
}

export function ChatConversation({ chat }: { chat: ChatController }) {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const listRef = useRef<LegendListRef>(null);
  const composerRef = useRef<View>(null);
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { contentInsetEndAdjustment, onComposerLayout } =
    useKeyboardChatComposerInset(listRef, composerRef);
  const { height: keyboardHeight, progress: keyboardProgress } =
    useReanimatedKeyboardAnimation();
  const keyboardOffset = Math.max(insets.bottom - COMPOSER_MARGIN, 0);
  const emptyStateStyle = useAnimatedStyle(() => ({
    bottom:
      contentInsetEndAdjustment.value -
      keyboardHeight.value -
      keyboardProgress.value * keyboardOffset,
  }));
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
    scrollButtonProgress.value = withTiming(showScrollButton ? 1 : 0, {
      duration: 160,
      reduceMotion: ReduceMotion.System,
    });
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
    ({ item, index }: { index: number; item: DisplayChatMessage }) => {
      if (item.role === "user") {
        return <UserMessage content={item.content} />;
      }

      const streaming =
        isGeneratingStatus(chat.status) &&
        index === chat.messages.length - 1 &&
        item.content.length === 0;

      return (
        <AssistantMessage
          content={item.content}
          status={item.status}
          streaming={streaming}
          streamingStore={chat.streamingStore}
        />
      );
    },
    [chat.messages.length, chat.status, chat.streamingStore]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardGestureArea
        interpolator="ios"
        offset={COMPOSER_MIN_HEIGHT}
        style={styles.keyboardArea}
        testID="chat-keyboard-layout"
        textInputNativeID={COMPOSER_NATIVE_ID}
      >
        <View
          onLayout={handleViewportLayout}
          style={styles.viewport}
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

          {chat.messages.length === 0 ? (
            <Reanimated.View
              pointerEvents="none"
              style={[styles.emptyState, emptyStateStyle]}
              testID="chat-empty-state"
            >
              <Text style={[typography.title, { color: colors.text }]}>
                무엇이든 물어보세요
              </Text>
              <Text
                style={[
                  styles.emptyDescription,
                  typography.supporting,
                  { color: colors.secondaryText },
                ]}
              >
                메시지는 이 채팅방에 안전하게 저장돼요.
              </Text>
            </Reanimated.View>
          ) : null}
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
            <View
              accessibilityElementsHidden={!showScrollButton}
              importantForAccessibility={
                showScrollButton ? "auto" : "no-hide-descendants"
              }
              pointerEvents={showScrollButton ? "auto" : "none"}
              style={styles.scrollButtonAnchor}
              testID="chat-scroll-to-bottom-anchor"
            >
              <Reanimated.View
                style={scrollButtonStyle}
                testID="chat-scroll-to-bottom-motion"
              >
                <Pressable
                  accessibilityLabel="맨 아래로"
                  accessibilityRole="button"
                  onPress={scrollToBottom}
                  style={[
                    styles.scrollButton,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <SymbolView
                    name="chevron.down"
                    size={16}
                    tintColor={colors.secondaryText}
                    weight="semibold"
                  />
                </Pressable>
              </Reanimated.View>
            </View>
            <Composer bottomInset={insets.bottom} chat={chat} />
          </View>
        </KeyboardStickyView>
      </KeyboardGestureArea>
    </View>
  );
}
