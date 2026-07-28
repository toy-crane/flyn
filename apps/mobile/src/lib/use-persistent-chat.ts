import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChatController,
  DisplayChatMessage,
} from "../components/chat/chat-conversation";
import { createStreamingStore } from "../components/chat/streaming-store";
import { API_BASE_URL } from "./api";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";
import type { StoredChatMessage } from "./use-chat-rooms";

interface ChatMessageMetadata {
  status: "complete" | "stopped";
}

type ChatUiMessage = UIMessage<ChatMessageMetadata>;

function messageText(message: ChatUiMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

function toUiMessages(messages: StoredChatMessage[]): ChatUiMessage[] {
  return messages.flatMap((message) => {
    if (message.role !== "assistant" && message.role !== "user") {
      return [];
    }

    return [
      {
        id: message.id,
        metadata: {
          status: message.status === "stopped" ? "stopped" : "complete",
        },
        parts: [{ text: message.content, type: "text" }],
        role: message.role,
      },
    ];
  });
}

function createTransport(roomId: string) {
  return new DefaultChatTransport<ChatUiMessage>({
    api: `${API_BASE_URL}/chats/${encodeURIComponent(roomId)}/messages`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    headers: async (): Promise<Record<string, string>> => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    prepareSendMessagesRequest: ({ messages }) => {
      const lastUserMessage = messages.findLast(
        (message) => message.role === "user"
      );

      if (!lastUserMessage) {
        throw new Error("보낼 사용자 메시지가 없습니다.");
      }

      return {
        body: {
          content: messageText(lastUserMessage),
          id: lastUserMessage.id,
        },
      };
    },
  });
}

function toDisplayMessages({
  isGenerating,
  messages,
  roomId,
  stoppedMessageIds,
}: {
  isGenerating: boolean;
  messages: ChatUiMessage[];
  roomId: string;
  stoppedMessageIds: Set<string>;
}): DisplayChatMessage[] {
  const displayMessages = messages.flatMap<DisplayChatMessage>(
    (message, index) => {
      if (message.role !== "assistant" && message.role !== "user") {
        return [];
      }

      const streaming =
        isGenerating &&
        message.role === "assistant" &&
        index === messages.length - 1;
      const content = messageText(message);

      if (message.role === "assistant" && !streaming && content.length === 0) {
        return [];
      }

      const storedStatus = message.metadata?.status;

      return [
        {
          content: streaming ? "" : content,
          id: message.id,
          role: message.role,
          status:
            storedStatus === "stopped" || stoppedMessageIds.has(message.id)
              ? "stopped"
              : "complete",
        },
      ];
    }
  );
  const lastMessage = displayMessages.at(-1);

  if (isGenerating && (!lastMessage || lastMessage.role === "user")) {
    displayMessages.push({
      content: "",
      id: `pending-assistant-${lastMessage?.id ?? roomId}`,
      role: "assistant",
      status: "complete",
    });
  }

  return displayMessages;
}

export function usePersistentChat(
  roomId: string,
  userId: string,
  storedMessages: StoredChatMessage[]
): ChatController {
  const queryClient = useQueryClient();
  const initialMessages = useMemo(
    () => toUiMessages(storedMessages),
    [storedMessages]
  );
  const transport = useMemo(() => createTransport(roomId), [roomId]);
  const streamingStore = useMemo(() => createStreamingStore(), []);
  const [input, setInput] = useState("");
  const [stoppedMessageIds, setStoppedMessageIds] = useState(
    () => new Set<string>()
  );

  const refreshStoredChat = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.chatMessages(roomId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.chatRoom(roomId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.chatRooms(userId),
    });
  }, [queryClient, roomId, userId]);

  const chat = useChat<ChatUiMessage>({
    id: roomId,
    messages: initialMessages,
    onError: refreshStoredChat,
    onFinish: ({ isAbort, isError, message }) => {
      if ((isAbort || isError) && messageText(message).length > 0) {
        setStoppedMessageIds((current) => {
          const next = new Set(current);
          next.add(message.id);
          return next;
        });
      }
      refreshStoredChat();
    },
    throttle: 32,
    transport,
  });
  const isGenerating =
    chat.status === "submitted" || chat.status === "streaming";
  const lastAssistant = chat.messages.findLast(
    (message) => message.role === "assistant"
  );

  useEffect(() => {
    if (isGenerating) {
      streamingStore.set(lastAssistant ? messageText(lastAssistant) : "");
    }
  }, [isGenerating, lastAssistant, streamingStore]);

  const messages = useMemo(
    () =>
      toDisplayMessages({
        isGenerating,
        messages: chat.messages,
        roomId,
        stoppedMessageIds,
      }),
    [chat.messages, isGenerating, roomId, stoppedMessageIds]
  );

  const onSend = useCallback(() => {
    const content = input.trim();

    if (!content || isGenerating) {
      return;
    }

    chat.clearError();
    setInput("");
    chat.sendMessage({ text: content });
  }, [chat, input, isGenerating]);

  const onRetry = useCallback(() => {
    chat.regenerate();
  }, [chat]);

  const stop = useCallback(() => {
    chat.stop();
  }, [chat]);

  return {
    error: chat.error ?? null,
    input,
    isGenerating,
    messages,
    onRetry,
    onSend,
    setInput,
    stop,
    streamingStore,
  };
}
