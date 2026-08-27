import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import { type EpisodeEnding, endingOfEpisode } from "./episode-ending";
import { type EpisodeNextUp, nextUpOfEpisode } from "./episode-next-up";

/** How often a scene is let through to React, in milliseconds. */
export const SCENE_UPDATE_INTERVAL_MS = 50;

export interface EpisodeRun {
  /** The scene so far, and the ways of adding to it. */
  chat: UseChatHelpers<UIMessage>;
  /** Set once the incident is over. Until then the episode is still running. */
  ending: EpisodeEnding | undefined;
  /** What follows the ending: the next episode's preview, or the season's end. */
  nextUp: EpisodeNextUp | undefined;
  /** Asks for the first scene again after it failed to arrive. */
  open: () => void;
}

/**
 * One episode. It lives while this screen does and is saved nowhere.
 *
 * 화면에 들어오면 아무 말도 싣지 않은 요청을 한 번 보낸다. 서버에게 그 요청은
 * "이 화를 연다"는 뜻이라, 사용자가 입력하기 전에 상대가 먼저 말한다. 나갔다
 * 들어오면 이 훅이 다시 만들어지므로 진행하던 장면은 남지 않고, 같은 화가
 * 처음부터 다시 열린다. 끝난 화의 진행은 서버가 들고 있어 그대로 남는다.
 */
export function useEpisodeRun(
  accessToken: string | undefined,
  episode: number | undefined
): EpisodeRun {
  const currentToken = useRef(accessToken);
  const currentEpisode = useRef(episode);

  currentToken.current = accessToken;
  currentEpisode.current = episode;

  const transport = useMemo(
    () =>
      createEpisodeTransport(
        () => currentToken.current,
        () => currentEpisode.current
      ),
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

  // 로그인 없이 보낸 요청은 첫 장면 대신 오류만 받고, 어떤 화인지 모르는 채로
  // 보낸 요청은 화면과 다른 화를 열 수 있다. 둘 다 준비된 뒤에 한 번만 연다.
  // 다시 여는 것은 실패한 뒤 사용자가 고르는 일이다.
  useEffect(() => {
    if (hasOpened || !accessToken || episode === undefined) {
      return;
    }

    setHasOpened(true);
    open();
  }, [accessToken, episode, hasOpened, open]);

  return {
    chat,
    ending: endingOfEpisode(chat.messages),
    nextUp: nextUpOfEpisode(chat.messages),
    open,
  };
}
