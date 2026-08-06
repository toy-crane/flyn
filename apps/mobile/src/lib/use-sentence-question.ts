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
import type { SentenceQuestionMessage } from "./sentence-question";
import { supabase } from "./supabase";

interface SentenceQuestionMetadata {
  status: "complete" | "stopped";
}

type SentenceQuestionUiMessage = UIMessage<SentenceQuestionMetadata>;

function messageText(message: SentenceQuestionUiMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

export function toUiMessages(
  messages: SentenceQuestionMessage[]
): SentenceQuestionUiMessage[] {
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
        parts: [{ text: message.content, type: "text" as const }],
        role: message.role as "assistant" | "user",
      },
    ];
  });
}

/**
 * 문장 질문에는 말풍선 곁의 표시가 없다. 첨삭은 대화 화면의 몫이고 여기서 오간
 * 말은 판정 대상이 아니다.
 */
export function toDisplayMessages({
  isGenerating,
  messages,
  stoppedMessageIds,
  threadId,
}: {
  isGenerating: boolean;
  messages: SentenceQuestionUiMessage[];
  stoppedMessageIds: Set<string>;
  threadId: string;
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

      return [
        {
          content: streaming ? "" : content,
          id: message.id,
          kind: "message" as const,
          role: message.role,
          status:
            message.metadata?.status === "stopped" ||
            stoppedMessageIds.has(message.id)
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
      id: `pending-answer-${lastMessage?.id ?? threadId}`,
      kind: "message",
      role: "assistant",
      status: "complete",
    });
  }

  return displayMessages;
}

function createTransport(episodeId: string, messageId: string) {
  return new DefaultChatTransport<SentenceQuestionUiMessage>({
    api: `${API_BASE_URL}/episodes/${encodeURIComponent(episodeId)}/messages/${encodeURIComponent(messageId)}/questions`,
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
        throw new Error("보낼 질문이 없습니다.");
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

/**
 * 문장 하나를 두고 묻는 자리의 대화 표면. 나갔다 같은 문장에서 다시 열면 저장된
 * 내용이 초기 메시지로 들어와 이어서 나오고, 문장마다 자리를 나눠 두어 다른
 * 문장에서 연 질문과 섞이지 않는다.
 */
export function useSentenceQuestion(
  episodeId: string,
  messageId: string,
  storedMessages: SentenceQuestionMessage[]
): { chat: ChatController } {
  const queryClient = useQueryClient();
  const threadId = `${episodeId}:${messageId}`;
  const initialMessages = useMemo(
    () => toUiMessages(storedMessages),
    [storedMessages]
  );
  const transport = useMemo(
    () => createTransport(episodeId, messageId),
    [episodeId, messageId]
  );
  const streamingStore = useMemo(() => createStreamingStore(), []);
  const [input, setInput] = useState("");
  const [stoppedMessageIds, setStoppedMessageIds] = useState(
    () => new Set<string>()
  );

  const refreshStoredQuestion = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.sentenceQuestion(episodeId, messageId),
    });
  }, [episodeId, messageId, queryClient]);

  const chat = useChat<SentenceQuestionUiMessage>({
    id: threadId,
    messages: initialMessages,
    onError: refreshStoredQuestion,
    onFinish: ({ isAbort, isError, message }) => {
      if ((isAbort || isError) && messageText(message).length > 0) {
        setStoppedMessageIds((current) => {
          const next = new Set(current);
          next.add(message.id);
          return next;
        });
      }
      refreshStoredQuestion();
    },
    throttle: 32,
    transport,
  });
  const isGenerating =
    chat.status === "submitted" || chat.status === "streaming";
  const lastMessage = chat.messages.at(-1);
  const activeAnswer =
    lastMessage?.role === "assistant" ? lastMessage : undefined;
  const lastAnswer = chat.messages.findLast(
    (message) => message.role === "assistant"
  );

  useEffect(() => {
    if (isGenerating) {
      streamingStore.set(activeAnswer ? messageText(activeAnswer) : "");
    }
  }, [activeAnswer, isGenerating, streamingStore]);

  const messages = useMemo(
    () =>
      toDisplayMessages({
        isGenerating,
        messages: chat.messages,
        stoppedMessageIds,
        threadId,
      }),
    [chat.messages, isGenerating, stoppedMessageIds, threadId]
  );

  const onSend = useCallback(() => {
    const content = input.trim();

    if (!content || isGenerating) {
      return;
    }

    chat.clearError();
    streamingStore.set("");
    setInput("");
    chat.sendMessage({ text: content });
  }, [chat, input, isGenerating, streamingStore]);

  const onRetry = useCallback(() => {
    streamingStore.set("");
    if (lastAnswer) {
      setStoppedMessageIds((current) => {
        if (!current.has(lastAnswer.id)) {
          return current;
        }

        const next = new Set(current);
        next.delete(lastAnswer.id);
        return next;
      });
    }
    chat.regenerate();
  }, [chat, lastAnswer, streamingStore]);

  const stop = useCallback(() => {
    chat.stop();
  }, [chat]);

  return {
    chat: {
      error: chat.error ?? null,
      input,
      messages,
      onRetry,
      onSend,
      setInput,
      status: chat.status,
      stop,
      streamingStore,
    },
  };
}
