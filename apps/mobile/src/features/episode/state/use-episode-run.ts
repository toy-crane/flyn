import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import { type EpisodeEnding, endingOfEpisode } from "./episode-ending";

/** How often a scene is let through to React, in milliseconds. */
export const SCENE_UPDATE_INTERVAL_MS = 50;

export interface EpisodeRun {
  /** The scene so far, and the ways of adding to it. */
  chat: UseChatHelpers<UIMessage>;
  /** Set once the incident is over. Until then the episode is still running. */
  ending: EpisodeEnding | undefined;
  /** Asks for the first scene again after it failed to arrive. */
  open: () => void;
}

/**
 * 에피소드 하나. 이 화면이 살아 있는 동안만 있고 어디에도 저장하지 않는다.
 *
 * 화면에 들어오면 아무 말도 싣지 않은 요청을 한 번 보낸다. 서버에게 그 요청은
 * "에피소드를 새로 연다"는 뜻이라, 사용자가 입력하기 전에 상대가 먼저 말한다.
 * 나갔다 들어오면 이 훅이 다시 만들어지므로 지난 에피소드는 남지 않는다.
 */
export function useEpisodeRun(accessToken: string | undefined): EpisodeRun {
  const currentToken = useRef(accessToken);

  currentToken.current = accessToken;

  const transport = useMemo(
    () => createEpisodeTransport(() => currentToken.current),
    []
  );
  const chat = useChat({
    throttle: SCENE_UPDATE_INTERVAL_MS,
    transport,
  });
  const { sendMessage } = chat;
  const open = useCallback(() => {
    sendMessage().catch(() => {
      // 실패는 `chat.error`로 남고, 화면이 그 자리에 다시 시도를 내놓는다.
    });
  }, [sendMessage]);
  const [hasOpened, setHasOpened] = useState<boolean>(false);

  // 로그인 없이 보낸 요청은 첫 장면 대신 오류만 받는다. 토큰이 준비된 뒤에
  // 한 번만 연다. 다시 여는 것은 실패한 뒤 사용자가 고르는 일이다.
  useEffect(() => {
    if (hasOpened || !accessToken) {
      return;
    }

    setHasOpened(true);
    open();
  }, [accessToken, hasOpened, open]);

  return { chat, ending: endingOfEpisode(chat.messages), open };
}
