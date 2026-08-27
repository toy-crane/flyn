import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import { type EpisodeEnding, endingOfEpisode } from "./episode-ending";
import { type EpisodeNextUp, nextUpOfEpisode } from "./episode-next-up";
import { useEpisodeStopSave } from "./use-episode-stop-save";

/** How often a scene is let through to React, in milliseconds. */
export const SCENE_UPDATE_INTERVAL_MS = 50;

export interface EpisodeRun {
  /** The scene so far, and the ways of adding to it. */
  chat: UseChatHelpers<UIMessage>;
  /** Set once the incident is over. Until then the episode is still running. */
  ending: EpisodeEnding | undefined;
  /** Whether a stopped scene is being matched with the server record. */
  isSaving: boolean;
  /** What follows the ending: the next episode's preview, or the story's end. */
  nextUp: EpisodeNextUp | undefined;
  /** Asks for the first scene again after it failed to arrive. */
  open: () => void;
  /** Stops the current response and saves the final scene left on screen. */
  stopAndSave: () => Promise<void>;
}

/**
 * 서버에서 읽은 자리부터 시작하는 에피소드 하나.
 *
 * 화면에 들어오면 아무 말도 싣지 않은 요청을 한 번 보낸다. 서버에게 그 요청은
 * "이 화를 연다"는 뜻이라, 사용자가 입력하기 전에 상대가 먼저 말한다. 서버에
 * 메시지가 있으면 그 목록으로 시작하고 새 첫 장면을 요청하지 않는다. 읽기 전용
 * 기록도 같은 모양을 쓰지만 새 요청은 보내지 않는다.
 */
export function useEpisodeRun(
  accessToken: string | undefined,
  episodeId: string,
  initialMessages: UIMessage[],
  readOnly: boolean
): EpisodeRun {
  const currentToken = useRef(accessToken);
  const currentEpisodeId = useRef(episodeId);

  currentToken.current = accessToken;
  currentEpisodeId.current = episodeId;

  const transport = useMemo(
    () =>
      createEpisodeTransport(
        () => currentToken.current,
        () => currentEpisodeId.current
      ),
    []
  );
  const chat = useChat({
    messages: initialMessages,
    throttle: SCENE_UPDATE_INTERVAL_MS,
    transport,
  });
  const { sendMessage } = chat;
  const open = useCallback(() => {
    if (readOnly) {
      return;
    }

    sendMessage().catch(() => {
      // 실패는 `chat.error`로 남고, 화면이 그 자리에 다시 시도를 내놓는다.
    });
  }, [readOnly, sendMessage]);
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

  const { isSaving, stopAndSave } = useEpisodeStopSave({
    accessToken,
    episodeId,
    messages: chat.messages,
    status: chat.status,
    stop: chat.stop,
  });

  return {
    chat,
    ending: endingOfEpisode(chat.messages),
    isSaving,
    nextUp: nextUpOfEpisode(chat.messages),
    open,
    stopAndSave,
  };
}
