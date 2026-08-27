import type { ChatStatus, UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type EpisodeStopMode,
  saveStoppedEpisodeSession,
} from "@/features/episode/api/episode-session";

/** 중지, 마지막 렌더와 보정 저장을 모두 기다리는 최대 시간. */
export const EPISODE_STOP_SAVE_TIMEOUT_MS = 5000;

interface PendingStopSave {
  accessToken: string | undefined;
  controller: AbortController;
  episodeId: string;
  mode: EpisodeStopMode;
  promise: Promise<void>;
  resolve: () => void;
  saveStarted: boolean;
  timeout: ReturnType<typeof setTimeout>;
}

interface EpisodeStopSaveInput {
  accessToken: string | undefined;
  episodeId: string;
  messages: UIMessage[];
  mode: EpisodeStopMode;
  status: ChatStatus;
  stop: () => Promise<void>;
}

/**
 * 진행 중인 응답을 멈추고 화면에 마지막으로 그려진 장면을 보정 저장한다.
 *
 * AI SDK의 `stop`은 요청을 취소한 직후 돌아오며, 마지막 응답 조각은 그 뒤
 * React 렌더에 들어올 수 있다. 따라서 `ready`나 `error` 렌더를 본 뒤 최신
 * 메시지를 읽는다. 어느 단계가 멎어도 같은 제한 시간이 지나면 대기를 풀어
 * 중지와 뒤로 가기가 화면을 가두지 않는다.
 */
export function useEpisodeStopSave({
  accessToken,
  episodeId,
  messages,
  mode,
  status,
  stop,
}: EpisodeStopSaveInput) {
  const latestInput = useRef({
    accessToken,
    episodeId,
    messages,
    mode,
    status,
    stop,
  });
  const pendingSave = useRef<PendingStopSave | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStopReturned, setHasStopReturned] = useState(false);

  latestInput.current = {
    accessToken,
    episodeId,
    messages,
    mode,
    status,
    stop,
  };

  const finish = useCallback(
    (pending: PendingStopSave, shouldAbort = false) => {
      if (pendingSave.current !== pending) {
        return;
      }

      clearTimeout(pending.timeout);
      if (shouldAbort) {
        pending.controller.abort();
      }
      pendingSave.current = undefined;
      setHasStopReturned(false);
      setIsSaving(false);
      pending.resolve();
    },
    []
  );

  const stopAndSave = useCallback((): Promise<void> => {
    const activeSave = pendingSave.current;
    if (activeSave !== undefined) {
      return activeSave.promise;
    }

    const input = latestInput.current;
    if (input.status !== "streaming" && input.status !== "submitted") {
      return Promise.resolve();
    }

    let resolve: () => void = () => undefined;
    const promise = new Promise<void>((finishPromise) => {
      resolve = finishPromise;
    });
    const pending: PendingStopSave = {
      accessToken: input.accessToken,
      controller: new AbortController(),
      episodeId: input.episodeId,
      mode: input.mode,
      promise,
      resolve,
      saveStarted: false,
      timeout: undefined as unknown as ReturnType<typeof setTimeout>,
    };

    pending.timeout = setTimeout(() => {
      finish(pending, true);
    }, EPISODE_STOP_SAVE_TIMEOUT_MS);
    pendingSave.current = pending;
    setHasStopReturned(false);
    setIsSaving(true);

    Promise.resolve()
      .then(input.stop)
      .catch(() => undefined)
      .finally(() => {
        if (pendingSave.current !== pending) {
          return;
        }

        setHasStopReturned(true);
      });

    return promise;
  }, [finish]);

  useEffect(() => {
    const pending = pendingSave.current;
    if (
      pending === undefined ||
      pending.saveStarted ||
      !hasStopReturned ||
      status === "streaming" ||
      status === "submitted"
    ) {
      return;
    }

    pending.saveStarted = true;
    if (!pending.accessToken) {
      finish(pending);
      return;
    }

    saveStoppedEpisodeSession(
      pending.accessToken,
      pending.episodeId,
      latestInput.current.messages,
      pending.mode,
      pending.controller.signal
    )
      .catch(() => undefined)
      .finally(() => {
        finish(pending);
      });
  }, [finish, hasStopReturned, status]);

  useEffect(
    () => () => {
      const pending = pendingSave.current;
      if (pending === undefined) {
        return;
      }

      clearTimeout(pending.timeout);
      pending.controller.abort();
      pendingSave.current = undefined;
      pending.resolve();
    },
    []
  );

  return { isSaving, stopAndSave };
}
