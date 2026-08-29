import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";

/** 대화가 소유하는 교정 상태. 어느 화면도 이것을 직접 그리지 않는다. */
export interface EpisodeCorrectionStore {
  /** 다시 보내기를 누른 교정을 기억해 둔다. 실제로 보내야 표시가 남는다. */
  beginResend: (messageId: string) => void;
  /** 메시지 ID로 찾는 교정. */
  byMessageId: Record<string, EpisodeCorrection>;
  /** 입력창의 말을 보냈다. 직전에 고른 배울 표현이 있으면 보냈다고 적는다. */
  confirmResend: () => void;
  /** 서버에서 온 교정을 받아 둔다. */
  receive: (correction: EpisodeCorrection) => void;
  /** 이미 다시 보낸 교정의 메시지 ID. */
  resent: Record<string, true>;
}

/** 말풍선 아래의 한 줄이 읽는 것. 화면이 상태와 두 동작을 여기에 모아 준다. */
export interface EpisodeCorrections {
  /** 배울 표현 하나를 두고 한국어로 묻는 자리를 연다. */
  ask: (correction: EpisodeCorrection) => void;
  byMessageId: Record<string, EpisodeCorrection>;
  /** 고친 문장을 본 채팅 입력창에 담는다. */
  resend: (correction: EpisodeCorrection) => void;
  resent: Record<string, true>;
}

const NO_CORRECTIONS: EpisodeCorrections = {
  ask: () => undefined,
  byMessageId: {},
  resend: () => undefined,
  resent: {},
};

/**
 * 이 에피소드가 지금까지 받은 배울 표현.
 *
 * 교정은 계정에 남는다. 화면을 나갔다 와도 서버가 세션에 실어 보낸 것으로 같은
 * 자리에 다시 붙는다.
 */
const EpisodeCorrectionsContext =
  createContext<EpisodeCorrections>(NO_CORRECTIONS);

/**
 * 교정 하나가 도착해도 장면 목록 전체를 다시 그리지 않게 하는 자리.
 *
 * 말풍선 아래에 매달리는 한 줄은 이 값을 직접 읽는다. 목록이 그 행을 다시
 * 만들지 않아도 문맥이 바뀌면 그 한 줄만 다시 그려지므로, 흐르는 장면이 교정
 * 때문에 멈추지 않는다.
 */
export function EpisodeCorrectionsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: EpisodeCorrections;
}) {
  return (
    <EpisodeCorrectionsContext.Provider value={value}>
      {children}
    </EpisodeCorrectionsContext.Provider>
  );
}

export function useCorrections(): EpisodeCorrections {
  return useContext(EpisodeCorrectionsContext);
}

/**
 * 한 에피소드의 교정 상태. 서버가 세션에 실어 보낸 것으로 시작한다.
 *
 * 대화를 굴리는 훅이 이 상태를 소유한다. 흐르는 응답에서 교정이 도착하는 자리가
 * 그 대화 안에 있기 때문이다.
 */
export function useEpisodeCorrections(
  saved: readonly EpisodeCorrection[] = []
): EpisodeCorrectionStore {
  const [byMessageId, setByMessageId] = useState<
    Record<string, EpisodeCorrection>
  >(() =>
    Object.fromEntries(
      saved.map((correction) => [correction.messageId, correction])
    )
  );
  const [resent, setResent] = useState<Record<string, true>>({});
  // 다시 보내기를 누른 배울 표현. 보내기 전까지는 아직 보낸 것이 아니다.
  const pendingResend = useRef<string | undefined>(undefined);

  const receive = useCallback((correction: EpisodeCorrection) => {
    setByMessageId((current) => ({
      ...current,
      [correction.messageId]: correction,
    }));
  }, []);

  const beginResend = useCallback((messageId: string) => {
    pendingResend.current = messageId;
  }, []);

  const confirmResend = useCallback(() => {
    const messageId = pendingResend.current;

    if (messageId === undefined) {
      return;
    }

    pendingResend.current = undefined;
    setResent((current) => ({ ...current, [messageId]: true }));
  }, []);

  return useMemo(
    () => ({ beginResend, byMessageId, confirmResend, receive, resent }),
    [beginResend, byMessageId, confirmResend, receive, resent]
  );
}
