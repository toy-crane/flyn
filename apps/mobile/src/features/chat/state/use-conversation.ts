import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useMemo, useRef, useState } from "react";

import { trackPendingUserWork } from "@/shared/state/pending-user-work";

/** How often a stream is let through to React, in milliseconds. */
export const STREAM_UPDATE_INTERVAL_MS = 50;

export interface ChatSession {
  /** Puts a message's own words in the composer to ask it again. */
  beginEdit: (messageId: string) => void;
  /** Leaves the conversation alone and gives the stashed draft back. */
  cancelEdit: () => void;
  /**
   * Whether pressing send now would send. False while an answer is arriving,
   * while the last request is still settling or when there is no session to
   * send with, so the button never takes a press that does nothing.
   */
  canSend: boolean;
  draft: string;
  /** The message being rewritten, and with it everything from there on. */
  editingMessageId: string | undefined;
  error: Error | undefined;
  isBusy: boolean;
  messages: UIMessage[];
  /** Drops this answer and everything after it, then asks again. */
  regenerateAnswer: (messageId: string) => void;
  /** Sends the failed question again without the person retyping it. */
  retry: () => void;
  /**
   * Sends what the input last reported and empties the draft. Says whether
   * anything went, so the panel only moves the list for a message that did.
   */
  send: () => boolean;
  setDraft: (value: string) => void;
  /** Ends the answer where it is and keeps what already arrived. */
  stop: () => Promise<void>;
}

/**
 * Where a conversation keeps what has been typed but not sent.
 *
 * A conversation on a screen of its own keeps this in the screen, and it goes
 * when the screen does. Asking about a correction keeps it above the sheet instead, so
 * closing the sheet leaves the half-written question and the edit in progress
 * where they were.
 */
export interface ChatDrafts {
  draft: string;
  editingMessageId: string | undefined;
  setDraft: (value: string) => void;
  setEditingMessageId: (value: string | undefined) => void;
  /** The words put aside while a message is being rewritten. */
  stashedDraft: { current: string };
}

function textOfMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** Drafts that live and die with the screen holding them. */
export function useLocalChatDrafts(): ChatDrafts {
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string>();
  const stashedDraft = useRef("");

  return useMemo(
    () => ({
      draft,
      editingMessageId,
      setDraft,
      setEditingMessageId,
      stashedDraft,
    }),
    [draft, editingMessageId]
  );
}

/**
 * What a conversation offers a screen, whichever chat is behind it.
 *
 * The chat itself and the drafts are handed in: the screen's own conversation
 * builds both here, and an episode question brings a chat that outlives its sheet and
 * drafts that are kept with it.
 */
export function useConversation(
  chat: UseChatHelpers<UIMessage>,
  drafts: ChatDrafts,
  accessToken: string | undefined,
  prepareMessage?: (text: string) => string,
  requestLock?: { current: boolean },
  onReplaceMessage?: (messageId: string) => void
): ChatSession {
  const [requestError, setRequestError] = useState<Error | undefined>();
  const {
    draft,
    editingMessageId,
    setDraft: storeDraft,
    setEditingMessageId,
    stashedDraft,
  } = drafts;
  const currentToken = useRef(accessToken);
  /*
    What the input last reported, ahead of the render that shows it.

    The last keystroke and the press on send can reach JavaScript in one batch,
    before React draws the draft the keystroke set. Reading the rendered draft
    then sends the message without its last character. Every write goes through
    `setDraft` below, so this is never behind the input.

    It also keeps starting an edit from being rebuilt on every keystroke: that
    is handed to every message in the list, and a new one each time would redraw
    them all while someone is typing.
  */
  const latestDraft = useRef(draft);

  currentToken.current = accessToken;

  const setDraft = useCallback(
    (value: string) => {
      latestDraft.current = value;
      storeDraft(value);
    },
    [storeDraft]
  );

  const { clearError, error, messages, regenerate, sendMessage, status, stop } =
    chat;
  const isBusy = status === "submitted" || status === "streaming";
  const localSending = useRef(false);
  // 카드 저장 등 대화 밖의 요청도 같은 잠금을 확인할 수 있다.
  const sending = requestLock ?? localSending;
  /*
    The lock above as something a render can see. An answer ends before the
    request that carried it settles, and in between the send button would look
    ready while every press on it did nothing.
  */
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  // Every path that reaches the server reports the same way: a rejected
  // request becomes the one error the screen shows, and the guard against a
  // second request in the same frame is released either way.
  const runRequest = useCallback(
    (request: Promise<void>) => {
      sending.current = true;
      setIsRequestOpen(true);
      setRequestError(undefined);

      trackPendingUserWork(request)
        .catch((cause: unknown) => {
          setRequestError(
            cause instanceof Error ? cause : new Error(String(cause))
          );
        })
        .finally(() => {
          sending.current = false;
          setIsRequestOpen(false);
        });
    },
    [sending]
  );

  const canStartRequest = useCallback(
    () => Boolean(currentToken.current) && !(isBusy || sending.current),
    [isBusy, sending]
  );

  const send = useCallback(() => {
    const trimmed = latestDraft.current.trim();
    const text = prepareMessage ? prepareMessage(trimmed) : trimmed;

    if (!(text && canStartRequest())) {
      return false;
    }

    setDraft("");

    // The SDK replaces this user message in place and drops everything after
    // it. Keeping its id lets the stored study fact still name the same act.
    if (editingMessageId) {
      onReplaceMessage?.(editingMessageId);
      setEditingMessageId(undefined);
      stashedDraft.current = "";
    }

    runRequest(sendMessage({ messageId: editingMessageId, text }));
    return true;
  }, [
    canStartRequest,
    editingMessageId,
    onReplaceMessage,
    prepareMessage,
    runRequest,
    sendMessage,
    setDraft,
    setEditingMessageId,
    stashedDraft,
  ]);

  const regenerateAnswer = useCallback(
    (messageId: string) => {
      if (!canStartRequest()) {
        return;
      }

      runRequest(regenerate({ messageId }));
    },
    [canStartRequest, regenerate, runRequest]
  );

  const retry = useCallback(() => {
    // With no message to regenerate the SDK throws, and a failed request that
    // never reached the list leaves exactly that.
    if (messages.length === 0 || !canStartRequest()) {
      return;
    }

    runRequest(regenerate());
  }, [canStartRequest, messages.length, regenerate, runRequest]);

  const beginEdit = useCallback(
    (messageId: string) => {
      const target = messages.find((message) => message.id === messageId);

      if (!target) {
        return;
      }

      // A failure from the last question goes with it. Leaving it up would
      // put "try again" beside the edit notice, and pressing it would restart
      // the conversation somewhere other than where the edit says it will.
      clearError();
      setRequestError(undefined);
      stashedDraft.current = latestDraft.current;
      setEditingMessageId(messageId);
      setDraft(textOfMessage(target));
    },
    [clearError, messages, setDraft, setEditingMessageId, stashedDraft]
  );

  const cancelEdit = useCallback(() => {
    setEditingMessageId(undefined);
    setDraft(stashedDraft.current);
    stashedDraft.current = "";
  }, [setDraft, setEditingMessageId, stashedDraft]);

  return {
    beginEdit,
    cancelEdit,
    canSend:
      Boolean(accessToken) &&
      !(isBusy || isRequestOpen) &&
      draft.trim().length > 0,
    draft,
    editingMessageId,
    error: error ?? requestError,
    isBusy,
    messages,
    regenerateAnswer,
    retry,
    send,
    setDraft,
    stop,
  };
}
