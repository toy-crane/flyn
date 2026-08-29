import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { randomUUID } from "expo-crypto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { correctionOfData } from "@/features/episode/api/episode-correction";
import { createEpisodeTransport } from "@/features/episode/api/episode-transport";
import {
  type EpisodeCorrectionStore,
  useEpisodeCorrections,
} from "./episode-corrections";
import { type EpisodeEnding, endingOfEpisode } from "./episode-ending";
import { type EpisodeNextUp, nextUpOfEpisode } from "./episode-next-up";

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
export function useEpisodeRun(
  accessToken: string | undefined,
  episodeId: string,
  initialMessages: UIMessage[],
  readOnly: boolean,
  recordedEnding?: EpisodeEnding,
  recordedNextUp?: EpisodeNextUp,
  savedCorrections?: readonly EpisodeCorrection[]
): EpisodeRun {
  const currentToken = useRef(accessToken);
  const currentEpisodeId = useRef(episodeId);
  const corrections = useEpisodeCorrections(savedCorrections);
  // 대화는 한 번만 만들어지므로 그때의 함수가 그대로 붙잡힌다. 지금 상태를
  // 읽는 자리는 ref 하나로 남겨 둔다.
  const currentCorrections = useRef(corrections);

  currentToken.current = accessToken;
  currentEpisodeId.current = episodeId;
  currentCorrections.current = corrections;

  const transport = useMemo(
    () =>
      createEpisodeTransport(
        () => currentToken.current,
        () => currentEpisodeId.current
      ),
    []
  );
  const chat = useChat({
    // 사용자가 쓴 말도 한 행으로 남고, 그 열은 uuid다. SDK 기본 생성기가 만드는
    // 짧은 문자열은 들어가지 못하므로 앱도 서버와 같은 모양으로 만든다.
    generateId: () => randomUUID(),
    messages: initialMessages,
    // 교정은 장면 메시지에 들어가지 않는 transient part로 온다. 받는 자리가
    // 여기뿐이라, 저장되는 대화 기록은 교정이 붙기 전과 똑같이 남는다.
    onData: (part) => {
      if (part.type !== "data-correction") {
        return;
      }

      const correction = correctionOfData(part.data);

      if (correction) {
        currentCorrections.current.receive(correction);
      }
    },
    throttle: SCENE_UPDATE_INTERVAL_MS,
    transport,
  });
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
  };
}
