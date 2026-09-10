import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { randomUUID } from "expo-crypto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ExpressionResult } from "@/features/episode/api/episode-correction";
import { checkEpisodeExpression } from "@/features/episode/api/episode-correction";
import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import type {
  SavedExpressionRef,
  SavedExpressionSpot,
} from "@/features/episode/api/saved-expression";
import {
  type EpisodeCorrectionStore,
  useEpisodeCorrections,
} from "./episode-corrections";
import { type EpisodeEnding, endingOfEpisode } from "./episode-ending";
import { type EpisodeNextUp, nextUpOfEpisode } from "./episode-next-up";
import {
  type SavedExpressions,
  useEpisodeSavedExpressions,
} from "./saved-expressions";

/** How often a scene is let through to React, in milliseconds. */
export const SCENE_UPDATE_INTERVAL_MS = 50;

export interface EpisodeRun {
  /** The scene so far, and the ways of adding to it. */
  chat: UseChatHelpers<UIMessage>;
  /** 이 에피소드에서 지금까지 붙은 배울 표현. */
  corrections: EpisodeCorrectionStore;
  /** Set once the incident is over. Until then the episode is still running. */
  ending: EpisodeEnding | undefined;
  /** What follows the ending: the next episode's preview, or the story's end. */
  nextUp: EpisodeNextUp | undefined;
  /** Asks for the first scene again after it failed to arrive. */
  open: () => void;
  /** 이 에피소드에서 지금까지 담아 둔 표현. */
  saved: SavedExpressions;
}

/**
 * 서버에서 읽은 자리부터 시작하는 에피소드 하나.
 *
 * 화면에 들어오면 아무 말도 싣지 않은 요청을 한 번 보낸다. 서버에게 그 요청은
 * "이 화를 연다"는 뜻이라, 사용자가 입력하기 전에 상대가 먼저 말한다. 서버에
 * 메시지가 있으면 그 목록으로 시작하고 새 첫 장면을 요청하지 않는다. 읽기 전용
 * 기록도 같은 모양을 쓰지만 새 요청은 보내지 않는다.
 *
 * 대화를 저장하는 주체는 서버 하나다. 중지하거나 화면을 나가면 요청만 끊고,
 * 서버는 자기가 만든 데까지를 스스로 남긴다. 그래서 여기에는 저장을 기다리는
 * 상태가 없다.
 *
 * 결말과 예고는 진행 중일 때 장면과 같은 스트림으로 오지만, 끝난 화를 다시 열면
 * 서버가 세션에 실어 보낸 값으로 온다. 저장된 대화가 그 둘을 담지 않기 때문이다.
 */
export function useEpisodeStoryPlay(
  accessToken: string | undefined,
  episodeId: string,
  initialMessages: UIMessage[],
  readOnly: boolean,
  storyId: string | undefined,
  storyPlayId: string | undefined,
  onStoryPlayStarted: (storyPlayId: string) => void,
  recordedEnding?: EpisodeEnding,
  recordedNextUp?: EpisodeNextUp,
  savedResults?: readonly ExpressionResult[],
  savedExpressions?: readonly SavedExpressionRef[],
  /** 담긴 것이 바뀌었을 때 화면이 할 일. 할 것이 없는 자리는 넘기지 않는다. */
  onExpressionChanged: (isSaved: boolean) => void = () => undefined
): EpisodeRun {
  const currentToken = useRef(accessToken);
  const currentEpisodeId = useRef(episodeId);
  const currentStoryId = useRef(storyId);
  // 새 대화는 회차 없이 시작해 첫 응답에서 회차를 받는다. 그 뒤의 턴과 표현
  // 확인은 이 ref가 가리키는 회차를 쓴다.
  const currentStoryPlayId = useRef(storyPlayId);
  const corrections = useEpisodeCorrections(
    savedResults,
    (messageId, signal) =>
      checkEpisodeExpression(
        currentToken.current,
        currentStoryPlayId.current ?? "",
        currentEpisodeId.current,
        messageId,
        signal
      ),
    initialMessages
      .filter((message) => message.role === "user")
      .map((message) => message.id)
  );
  const restored = useRef(false);
  useEffect(() => {
    if (!accessToken || restored.current) {
      return;
    }
    restored.current = true;
    for (const message of initialMessages) {
      if (message.role === "user") {
        corrections.check(message.id);
      }
    }
  }, [accessToken, corrections.check, initialMessages]);
  const { hydrate, retain, states, toggle } = useEpisodeSavedExpressions();
  const changed = useRef(onExpressionChanged);

  changed.current = onExpressionChanged;

  const saved = useMemo(
    () => ({
      states,
      toggle: (spot: SavedExpressionSpot) =>
        toggle(spot, (isSaved) => changed.current(isSaved)),
    }),
    [states, toggle]
  );

  // 서버가 아는 자리를 위 층의 저장소에 가져다 놓는다. 표현 돌아보기도 같은
  // 것을 하므로, 어느 쪽에서 담았든 다른 쪽이 채워진 책갈피를 본다.
  useEffect(() => {
    hydrate({ episodeId, saved: savedExpressions, storyPlayId });
  }, [episodeId, hydrate, savedExpressions, storyPlayId]);
  // 대화는 한 번만 만들어지므로 그때의 함수가 그대로 붙잡힌다. 지금 상태를
  // 읽는 자리는 ref 하나로 남겨 둔다.
  const currentCorrections = useRef(corrections);

  currentToken.current = accessToken;
  currentEpisodeId.current = episodeId;
  currentStoryId.current = storyId;
  currentCorrections.current = corrections;
  const startedStoryPlay = useRef(onStoryPlayStarted);

  startedStoryPlay.current = onStoryPlayStarted;

  if (storyPlayId !== undefined) {
    currentStoryPlayId.current = storyPlayId;
  }

  const transport = useMemo(
    () =>
      createEpisodeTransport(
        () => currentToken.current,
        () => currentEpisodeId.current,
        () => currentStoryPlayId.current,
        () => currentStoryId.current
      ),
    []
  );
  const chat = useChat({
    // 사용자가 쓴 말도 한 행으로 남고, 그 열은 uuid다. SDK 기본 생성기가 만드는
    // 짧은 문자열은 들어가지 못하므로 앱도 서버와 같은 모양으로 만든다.
    generateId: () => randomUUID(),
    messages: initialMessages,
    onData: (part) => {
      // 회차가 방금 생겼다. 다음 턴부터 이 회차를 이어가고, 뒤로 가기와 다음
      // 화도 이 회차를 따라간다.
      if (part.type === "data-story-play-started") {
        const data = part.data as { storyPlayId?: unknown } | null;
        if (typeof data?.storyPlayId === "string") {
          currentStoryPlayId.current = data.storyPlayId;
          startedStoryPlay.current(data.storyPlayId);
        }
        return;
      }
      if (part.type !== "data-expression-ready") {
        return;
      }
      const data = part.data as { messageId?: unknown } | null;
      if (typeof data?.messageId === "string") {
        currentCorrections.current.check(data.messageId);
      }
    },
    throttle: SCENE_UPDATE_INTERVAL_MS,
    transport,
  });
  const knownMessages = useRef(
    new Set(initialMessages.map((message) => message.id))
  );
  const previousStatus = useRef(chat.status);
  useEffect(() => {
    const userIds = new Set(
      chat.messages
        .filter((message) => message.role === "user")
        .map((message) => message.id)
    );
    corrections.retain(userIds);
    for (const id of userIds) {
      if (!(knownMessages.current.has(id) || readOnly)) {
        corrections.begin(id);
      }
    }
    // 담아 둔 표현은 항목으로 남지만 책갈피는 그 메시지의 것이다. 다시 받기로
    // 사라진 메시지의 표시까지 들고 있으면 새 장면에 남의 자리 표시가 붙는다.
    retain(new Set(chat.messages.map((message) => message.id)));
    knownMessages.current = new Set(chat.messages.map((message) => message.id));
    const wasSending =
      previousStatus.current === "submitted" ||
      previousStatus.current === "streaming";
    previousStatus.current = chat.status;
    if (wasSending && (chat.status === "ready" || chat.status === "error")) {
      corrections.failWaiting();
    }
  }, [
    chat.messages,
    chat.status,
    corrections.begin,
    corrections.failWaiting,
    corrections.retain,
    readOnly,
    retain,
  ]);
  const open = useCallback(() => {
    if (readOnly) {
      return;
    }

    chat.sendMessage().catch(() => {
      // 실패는 `chat.error`로 남고, 화면이 그 자리에 다시 시도를 내놓는다.
    });
  }, [chat.sendMessage, readOnly]);
  const [hasOpened, setHasOpened] = useState<boolean>(
    readOnly || initialMessages.length > 0
  );

  // 로그인 없이 보낸 요청은 첫 장면 대신 오류만 받는다. 토큰이 준비된 뒤에
  // 한 번만 연다. 다시 여는 것은 실패한 뒤 사용자가 고르는 일이다.
  useEffect(() => {
    if (hasOpened || !accessToken) {
      return;
    }

    setHasOpened(true);
    open();
  }, [accessToken, hasOpened, open]);

  return {
    chat,
    corrections,
    ending: endingOfEpisode(chat.messages) ?? recordedEnding,
    nextUp: nextUpOfEpisode(chat.messages) ?? recordedNextUp,
    open,
    saved,
  };
}
