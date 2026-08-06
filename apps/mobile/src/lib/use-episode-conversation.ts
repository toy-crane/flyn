import { useChat } from "@ai-sdk/react";
import type { DeliveredSentence } from "@flyn/api";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChatController,
  DisplayChatItem,
  DisplayChatMessage,
} from "../components/chat/chat-conversation";
import { createStreamingStore } from "../components/chat/streaming-store";
import { API_BASE_URL } from "./api";
import type {
  Episode,
  EpisodeEndReason,
  EpisodeGoal,
  EpisodeMessage,
} from "./episodes";
import {
  episodeEndReason,
  type GoalAchievement,
  orderedGoals,
  withAchievements,
} from "./episodes";
import {
  findFeedback,
  type MessageFeedback,
  messageMark,
  withArrivedFeedback,
} from "./message-feedback";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";
import { requestJudgment } from "./use-episode-judgment";

interface EpisodeMessageMetadata {
  status: "complete" | "stopped";
}

/**
 * 스트림이 나르는 것은 응답과 전달된 문장뿐이다. 판정과 종료는 나뉜 두 번째
 * 요청의 응답으로 온다.
 */
type EpisodeUiMessage = UIMessage<
  EpisodeMessageMetadata,
  { delivered: DeliveredSentence }
>;

/** 대화 화면이 한 번에 받는 것. 목표는 판정이 도착하는 대로 갱신된다. */
export interface EpisodeConversation {
  chat: ChatController;
  /** 끝났으면 왜 끝났는지. 아직이면 null이고 그동안 composer가 선다. */
  ending: EpisodeEndReason | null;
  goals: EpisodeGoal[];
}

function messageText(message: EpisodeUiMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

function toUiMessages(messages: EpisodeMessage[]): EpisodeUiMessage[] {
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
        role: message.role,
      },
    ];
  });
}

function createTransport(episodeId: string) {
  return new DefaultChatTransport<EpisodeUiMessage>({
    api: `${API_BASE_URL}/episodes/${encodeURIComponent(episodeId)}/messages`,
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

/**
 * 말풍선에는 언제나 **실제로 전달된 문장**이 남는다. 한글을 쓰면 서버가 번역해
 * 보내므로, 방금 보낸 말풍선은 스트림이 알려준 전달본으로 바꿔 그린다.
 */
function toDisplayMessages({
  delivered,
  episodeId,
  feedback,
  isGenerating,
  messages,
  stoppedMessageIds,
}: {
  delivered: Record<string, string>;
  episodeId: string;
  feedback: MessageFeedback[];
  isGenerating: boolean;
  messages: EpisodeUiMessage[];
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
      const content =
        message.role === "user"
          ? (delivered[message.id] ?? messageText(message))
          : messageText(message);

      if (message.role === "assistant" && !streaming && content.length === 0) {
        return [];
      }

      const storedStatus = message.metadata?.status;
      // 판정이 아직 없는 발화에는 표시가 없다. 행이 없음이 곧 판정 전이다.
      const judged =
        message.role === "user" ? findFeedback(feedback, message.id) : null;

      return [
        {
          content: streaming ? "" : content,
          id: message.id,
          kind: "message" as const,
          ...(judged ? { mark: messageMark(judged) } : {}),
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
      id: `pending-assistant-${lastMessage?.id ?? episodeId}`,
      kind: "message",
      role: "assistant",
      status: "complete",
    });
  }

  return displayMessages;
}

function toNote(goal: EpisodeGoal): DisplayChatItem {
  return {
    id: `goal-${goal.position}`,
    kind: "note",
    text: `${goal.sentence} 완료`,
  };
}

/**
 * 완료 줄은 목표를 이룬 발화의 **턴 끝**에 선다. 상대의 대답까지 나와야 목표가
 * 이뤄지므로 응답 뒤가 그 발화의 자리이고, 다음 발화 바로 앞이 곧 턴의 끝이다.
 * 자리를 정하는 값이 저장돼 있어 다시 들어와도 같은 곳에 남는다.
 */
function withGoalNotes(
  messages: DisplayChatMessage[],
  goals: EpisodeGoal[]
): DisplayChatItem[] {
  const achieved = goals.filter((goal) => goal.achieved_message_id !== null);

  if (achieved.length === 0) {
    return messages;
  }

  const items: DisplayChatItem[] = [];
  let anchored: EpisodeGoal[] = [];

  for (const message of messages) {
    if (message.role === "user" && anchored.length > 0) {
      items.push(...anchored.map(toNote));
      anchored = [];
    }

    items.push(message);
    anchored = [
      ...anchored,
      ...achieved.filter((goal) => goal.achieved_message_id === message.id),
    ];
  }

  return [...items, ...anchored.map(toNote)];
}

export function useEpisodeConversation(
  episode: Episode,
  userId: string,
  storedMessages: EpisodeMessage[],
  feedback: MessageFeedback[]
): EpisodeConversation {
  const episodeId = episode.id;
  const queryClient = useQueryClient();
  const initialMessages = useMemo(
    () => toUiMessages(storedMessages),
    [storedMessages]
  );
  const transport = useMemo(() => createTransport(episodeId), [episodeId]);
  const streamingStore = useMemo(() => createStreamingStore(), []);
  const [input, setInput] = useState("");
  const [delivered, setDelivered] = useState<Record<string, string>>({});
  const [achievements, setAchievements] = useState<
    Record<number, GoalAchievement>
  >({});
  const [stoppedMessageIds, setStoppedMessageIds] = useState(
    () => new Set<string>()
  );
  // 종료는 판정 응답이 나른다. 저장을 다시 읽기를 기다리면 끝난 대화 앞에서
  // composer가 한 박자 더 서 있는다.
  const [judgedEnding, setJudgedEnding] = useState<EpisodeEndReason | null>(
    null
  );

  /**
   * 한 턴이 끝난 뒤의 판정. 실패해도 대화 화면에는 아무것도 알리지 않는다 —
   * 못 채운 발화는 다음 턴의 판정이 함께 판정해 조용히 메운다.
   */
  const judge = useCallback(() => {
    requestJudgment(episodeId)
      .then((result) => {
        setAchievements((current) => {
          const next = { ...current };

          for (const goal of result.goals) {
            next[goal.position] ??= goal;
          }

          return next;
        });
        // 표시와 첨삭 시트가 같은 자리를 읽는다. 저장을 다시 읽기 전에 여기에
        // 얹어야 시트가 지금 도착한 판정도 부르지 않고 연다.
        queryClient.setQueryData<MessageFeedback[]>(
          queryKeys.episodeFeedback(episodeId),
          (current = []) => withArrivedFeedback(current, result.sentences)
        );

        if (result.ending) {
          setJudgedEnding(result.ending);
          queryClient.invalidateQueries({
            queryKey: queryKeys.episode(episodeId),
          });
        }
      })
      .catch(() => {
        // 판정만 실패하면 대화 화면에는 아무것도 알리지 않는다. 다만 판정이
        // 실패해도 턴 상한 종료는 저장되므로, 저장을 다시 읽어 끝났는지 본다.
        queryClient.invalidateQueries({
          queryKey: queryKeys.episode(episodeId),
        });
      });
  }, [episodeId, queryClient]);

  const refreshStoredEpisode = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.episodeMessages(episodeId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.episodeFeedback(episodeId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.episode(episodeId),
    });
    // 대화를 이어간 에피소드가 홈에서 가장 최근이 된다.
    queryClient.invalidateQueries({
      queryKey: queryKeys.episodes(userId),
    });
  }, [episodeId, queryClient, userId]);

  const chat = useChat<EpisodeUiMessage>({
    id: episodeId,
    messages: initialMessages,
    onData: (part) => {
      if (part.type === "data-delivered") {
        const { messageId, text } = part.data;

        setDelivered((current) => ({ ...current, [messageId]: text }));
      }
    },
    onError: refreshStoredEpisode,
    onFinish: ({ isAbort, isError, message }) => {
      if ((isAbort || isError) && messageText(message).length > 0) {
        setStoppedMessageIds((current) => {
          const next = new Set(current);
          next.add(message.id);
          return next;
        });
      }
      refreshStoredEpisode();

      // 판정은 응답이 끝난 **뒤에** 따로 부른다. 같은 요청에 얹으면 응답이 끝나도
      // 스트림이 닫히지 않아 그동안 다음 발화를 보낼 수 없다. 나눈 덕에 판정이
      // 이번 턴의 상대 답까지 보고 판단한다.
      judge();
    },
    throttle: 32,
    transport,
  });
  const isGenerating =
    chat.status === "submitted" || chat.status === "streaming";
  const lastMessage = chat.messages.at(-1);
  const activeAssistant =
    lastMessage?.role === "assistant" ? lastMessage : undefined;
  const lastAssistant = chat.messages.findLast(
    (message) => message.role === "assistant"
  );

  useEffect(() => {
    if (isGenerating) {
      streamingStore.set(activeAssistant ? messageText(activeAssistant) : "");
    }
  }, [activeAssistant, isGenerating, streamingStore]);

  const goals = useMemo(
    () => withAchievements(orderedGoals(episode), achievements),
    [achievements, episode]
  );
  const messages = useMemo(
    () =>
      withGoalNotes(
        toDisplayMessages({
          delivered,
          episodeId,
          feedback,
          isGenerating,
          messages: chat.messages,
          stoppedMessageIds,
        }),
        goals
      ),
    [
      chat.messages,
      delivered,
      episodeId,
      feedback,
      goals,
      isGenerating,
      stoppedMessageIds,
    ]
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
    if (lastAssistant) {
      setStoppedMessageIds((current) => {
        if (!current.has(lastAssistant.id)) {
          return current;
        }

        const next = new Set(current);
        next.delete(lastAssistant.id);
        return next;
      });
    }
    chat.regenerate();
  }, [chat, lastAssistant, streamingStore]);

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
    // 저장된 상태가 먼저다. 판정 응답이 알려 온 것은 그 저장이 다시 읽히기
    // 전까지의 자리를 메운다.
    ending: episodeEndReason(episode) ?? judgedEnding,
    goals,
  };
}
