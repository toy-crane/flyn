import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  EpisodeCorrection,
  ExpressionResult,
} from "@/features/episode/api/episode-correction";

export type ExpressionState =
  | { status: "pending"; retrying: boolean }
  | { status: "error" | "natural" | "unclear" }
  | { status: "corrected"; correction: EpisodeCorrection };
type CheckExpression = (
  messageId: string,
  signal: AbortSignal
) => Promise<ExpressionResult>;
export interface EpisodeCorrections {
  ask: (correction: EpisodeCorrection) => void;
  byMessageId: Record<string, EpisodeCorrection>;
  retry: (messageId: string) => void;
  states: Record<string, ExpressionState>;
}
export interface EpisodeCorrectionStore
  extends Omit<EpisodeCorrections, "ask"> {
  begin: (messageId: string) => void;
  check: (messageId: string) => void;
  failWaiting: () => void;
  retain: (messageIds: Set<string>) => void;
}
const EpisodeCorrectionsContext = createContext<EpisodeCorrections>({
  ask: () => undefined,
  byMessageId: {},
  retry: () => undefined,
  states: {},
});
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
export function useCorrections() {
  return useContext(EpisodeCorrectionsContext);
}
// 서버의 30초 판정 제한에 요청과 응답 전달 시간을 더한다.
const CHECK_TIMEOUT_MS = 35_000;
export function useEpisodeCorrections(
  saved: readonly ExpressionResult[] | undefined,
  request: CheckExpression,
  initialMessageIds: readonly string[] = []
): EpisodeCorrectionStore {
  const [states, setStates] = useState<Record<string, ExpressionState>>(() =>
    Object.fromEntries([
      ...initialMessageIds.map((id) => [
        id,
        { retrying: false, status: "pending" },
      ]),
      ...(saved ?? []).map((result) => [
        result.messageId,
        result.status === "corrected"
          ? { correction: result.correction, status: "corrected" }
          : { status: result.status },
      ]),
    ])
  );
  const current = useRef(states);
  const checker = useRef(request);
  checker.current = request;
  const running = useRef(new Map<string, AbortController>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const publish = useCallback((next: Record<string, ExpressionState>) => {
    current.current = next;
    setStates(next);
  }, []);
  const clearTimer = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);
  const startPending = useCallback(
    (id: string, retrying: boolean) => {
      clearTimer(id);
      publish({ ...current.current, [id]: { retrying, status: "pending" } });
      timers.current.set(
        id,
        setTimeout(() => {
          running.current.get(id)?.abort();
          running.current.delete(id);
          timers.current.delete(id);
          if (current.current[id]?.status === "pending") {
            publish({ ...current.current, [id]: { status: "error" } });
          }
        }, CHECK_TIMEOUT_MS)
      );
    },
    [clearTimer, publish]
  );
  const begin = useCallback(
    (id: string) => {
      if (!current.current[id]) {
        startPending(id, false);
      }
    },
    [startPending]
  );
  const run = useCallback(
    (id: string, retrying: boolean) => {
      if (running.current.has(id)) {
        return;
      }
      const previous = current.current[id];
      if (
        retrying
          ? previous?.status !== "error"
          : previous && previous.status !== "pending"
      ) {
        return;
      }
      startPending(id, retrying);
      const controller = new AbortController();
      running.current.set(id, controller);
      const finish = (next: ExpressionState) => {
        if (running.current.get(id) !== controller) {
          return;
        }
        running.current.delete(id);
        clearTimer(id);
        publish({ ...current.current, [id]: next });
      };
      checker.current(id, controller.signal).then(
        (result) =>
          finish(
            result.status === "corrected"
              ? { correction: result.correction, status: "corrected" }
              : { status: result.status }
          ),
        () => finish({ status: "error" })
      );
    },
    [clearTimer, publish, startPending]
  );
  const check = useCallback((id: string) => run(id, false), [run]);
  const retry = useCallback((id: string) => run(id, true), [run]);
  const retain = useCallback(
    (ids: Set<string>) => {
      const next = { ...current.current };
      let changed = false;
      for (const id of Object.keys(next)) {
        if (ids.has(id)) {
          continue;
        }
        running.current.get(id)?.abort();
        running.current.delete(id);
        clearTimer(id);
        delete next[id];
        changed = true;
      }
      if (changed) {
        publish(next);
      }
    },
    [clearTimer, publish]
  );
  const failWaiting = useCallback(() => {
    const next = { ...current.current };
    let changed = false;
    for (const [id, state] of Object.entries(next)) {
      if (state.status === "pending" && !running.current.has(id)) {
        clearTimer(id);
        next[id] = { status: "error" };
        changed = true;
      }
    }
    if (changed) {
      publish(next);
    }
  }, [clearTimer, publish]);
  useEffect(() => {
    const requests = running.current;
    const pendingTimers = timers.current;
    return () => {
      for (const controller of requests.values()) {
        controller.abort();
      }
      requests.clear();
      for (const timer of pendingTimers.values()) {
        clearTimeout(timer);
      }
      pendingTimers.clear();
    };
  }, []);
  const byMessageId = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(states).flatMap(([id, state]) =>
          state.status === "corrected" ? [[id, state.correction]] : []
        )
      ),
    [states]
  );
  return useMemo(
    () => ({ begin, byMessageId, check, failWaiting, retain, retry, states }),
    [begin, byMessageId, check, failWaiting, retain, retry, states]
  );
}
