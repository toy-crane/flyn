import { LegendList, type LegendListRef } from "@legendapp/list/react-native";
import type { ChatStatus } from "ai";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { type ReactNode, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../theme/app-theme";
import { ChatMarkdown } from "./chat-markdown";
import { StreamingMessage } from "./streaming-message";
import type { StreamingStore } from "./streaming-store";

const COMPOSER_NATIVE_ID = "chat-composer";
const BOTTOM_THRESHOLD = 72;
const COMPOSER_MIN_HEIGHT = 52;
const COMPOSER_MARGIN = 8;

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
  return (
    <View
      className="mb-3 max-w-[80%] self-end rounded-[20px] bg-user-bubble px-4 py-3"
      testID="user-message"
    >
      <Text
        className="text-base text-user-bubble-foreground leading-[22px]"
        selectable
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
  return (
    <View className="mb-4 w-full" testID="assistant-message">
      {streaming ? (
        <StreamingMessage store={streamingStore} />
      ) : (
        <ChatMarkdown>{content}</ChatMarkdown>
      )}
      {status === "stopped" ? (
        <Text className="mt-1 text-[12px] text-muted-foreground">중단됨</Text>
      ) : null}
    </View>
  );
}

function ComposerSurface({ children }: { children: ReactNode }) {
  const style = {
    alignItems: "flex-end" as const,
    borderRadius: 24,
    flexDirection: "row" as const,
    minHeight: 52,
    overflow: "hidden" as const,
  };

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={style}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView intensity={72} style={style} tint="systemChromeMaterial">
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
  const theme = useAppTheme();
  const canSend = chat.input.trim().length > 0;
  const isGenerating = isGeneratingStatus(chat.status);
  const actionLabel = isGenerating ? "응답 중단" : "메시지 보내기";
  const disabled = !(isGenerating || canSend);
  const handleAction = isGenerating ? chat.stop : chat.onSend;

  return (
    <View
      style={{
        paddingBottom: Math.max(bottomInset, 8),
        paddingHorizontal: 12,
        paddingTop: 8,
      }}
    >
      {chat.error ? (
        <View className="mb-2 flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3">
          <Text className="flex-1 text-[13px] text-foreground">
            응답을 만들지 못했어요.
          </Text>
          <Pressable
            accessibilityLabel="다시 시도"
            accessibilityRole="button"
            className="min-h-11 justify-center px-2"
            onPress={chat.onRetry}
          >
            <Text className="font-semibold text-[13px] text-foreground">
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ComposerSurface>
        <TextInput
          accessibilityLabel="메시지"
          className="max-h-28 min-h-[52px] flex-1 px-4 py-[14px] text-base text-foreground leading-[22px]"
          cursorColor={theme.foreground}
          maxLength={4000}
          multiline
          nativeID={COMPOSER_NATIVE_ID}
          onChangeText={chat.setInput}
          placeholder="메시지 보내기"
          placeholderTextColor={theme.placeholder}
          selectionColor={theme.foreground}
          textAlignVertical="top"
          value={chat.input}
        />
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          className="m-1 min-h-11 min-w-11 items-center justify-center rounded-full"
          disabled={disabled}
          onPress={handleAction}
          style={{
            backgroundColor: disabled ? theme.disabled : theme.primary,
            opacity: disabled ? 0.7 : 1,
          }}
        >
          {chat.status === "submitted" ? (
            <ActivityIndicator
              accessible={false}
              color={theme.primaryForeground}
              size="small"
              testID="composer-submit-spinner"
            />
          ) : (
            <SymbolView
              name={chat.status === "streaming" ? "stop.fill" : "arrow.up"}
              size={17}
              tintColor={
                disabled ? theme.disabledForeground : theme.primaryForeground
              }
              weight="semibold"
            />
          )}
        </Pressable>
      </ComposerSurface>
    </View>
  );
}

export function ChatConversation({ chat }: { chat: ChatController }) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const listRef = useRef<LegendListRef>(null);
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const maintainScrollAtEndThreshold =
    listViewportHeight > 0
      ? Math.min(1, BOTTOM_THRESHOLD / listViewportHeight)
      : 0.1;

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setListViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distance =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const nextAtBottom = distance <= BOTTOM_THRESHOLD;

      setShowScrollButton(!nextAtBottom);
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
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Math.max(insets.bottom - COMPOSER_MARGIN, 0)}
        style={{ flex: 1 }}
        testID="chat-keyboard-layout"
      >
        <KeyboardGestureArea
          interpolator="ios"
          offset={COMPOSER_MIN_HEIGHT}
          style={{ flex: 1 }}
          textInputNativeID={COMPOSER_NATIVE_ID}
        >
          <View
            className="min-h-0 flex-1"
            onLayout={handleViewportLayout}
            testID="chat-message-viewport"
          >
            <LegendList
              contentContainerStyle={{
                paddingBottom: 16,
                paddingHorizontal: 16,
                paddingTop: 16,
              }}
              data={chat.messages}
              estimatedItemSize={84}
              initialScrollAtEnd
              keyboardDismissMode="interactive"
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
              style={{ flex: 1, minHeight: 0 }}
              testID="chat-message-list"
            />

            {chat.messages.length === 0 ? (
              <View
                className="absolute inset-0 items-center justify-center gap-2 px-6"
                pointerEvents="none"
                testID="chat-empty-state"
              >
                <Text className="font-semibold text-[22px] text-foreground">
                  무엇이든 물어보세요
                </Text>
                <Text className="text-center text-[15px] text-muted-foreground leading-6">
                  메시지는 이 채팅방에 안전하게 저장돼요.
                </Text>
              </View>
            ) : null}

            {showScrollButton ? (
              <Pressable
                accessibilityLabel="맨 아래로"
                accessibilityRole="button"
                className="absolute min-h-11 min-w-11 items-center justify-center rounded-full bg-surface"
                onPress={scrollToBottom}
                style={{
                  bottom: 16,
                  left: "50%",
                  transform: [{ translateX: -22 }],
                }}
              >
                <SymbolView
                  name="chevron.down"
                  size={16}
                  tintColor={theme.mutedForeground}
                  weight="semibold"
                />
              </Pressable>
            ) : null}
          </View>

          <Composer bottomInset={insets.bottom} chat={chat} />
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </View>
  );
}
