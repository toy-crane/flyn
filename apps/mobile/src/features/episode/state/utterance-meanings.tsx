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
import {
  type MeaningRequest,
  meaningKey,
  type UtteranceMeaning,
  type UtteranceSpot,
} from "@/features/episode/api/utterance-meaning";
import { trackPendingUserWork } from "@/shared/state/pending-user-work";

// React Native의 AbortSignal은 throwIfAborted 메서드를 제공하지 않는다.
function assertAvailable(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("The utterance is no longer available.");
  }
}

export type MeaningState =
  | { status: "pending" | "error" }
  | { status: "ready"; meaning: string; shown: boolean };
export function useUtteranceMeanings(
  initial: readonly UtteranceMeaning[] | undefined,
  storyPlayId: string | undefined,
  request: MeaningRequest
) {
  const [states, setStates] = useState<Record<string, MeaningState>>(() =>
    Object.fromEntries(
      (initial ?? []).map((item) => [
        meaningKey(item),
        { meaning: item.meaning, shown: true, status: "ready" },
      ])
    )
  );
  const known = useRef(
    new Map((initial ?? []).map((item) => [meaningKey(item), item]))
  );
  const persisted = useRef(new Set((initial ?? []).map(meaningKey)));
  const running = useRef(
    new Map<
      string,
      { controller: AbortController; work: Promise<UtteranceMeaning> }
    >()
  );
  const current = useRef(states);
  const requester = useRef(request);
  const play = useRef(storyPlayId);
  requester.current = request;
  if (storyPlayId !== undefined) {
    play.current = storyPlayId;
  }
  const publish = useCallback((key: string, state: MeaningState) => {
    current.current = { ...current.current, [key]: state };
    setStates(current.current);
  }, []);
  const start = useCallback(
    (spot: UtteranceSpot, supplied?: string) => {
      const key = meaningKey(spot);
      const existing = running.current.get(key);
      if (existing) {
        return existing.work;
      }
      const controller = new AbortController();
      const beganWithPlay = play.current;
      const timer = setTimeout(() => controller.abort(), 35_000);
      const aborted = new Promise<never>((_, reject) => {
        controller.signal.addEventListener(
          "abort",
          () => reject(new Error("The utterance meaning request was aborted.")),
          { once: true }
        );
      });
      publish(key, { status: "pending" });
      const work = (async () => {
        try {
          let result = await Promise.race([
            requester.current(spot, beganWithPlay, supplied, controller.signal),
            aborted,
          ]);
          assertAvailable(controller.signal);
          known.current.set(key, result);
          if (!beganWithPlay && play.current) {
            result = await Promise.race([
              requester.current(
                spot,
                play.current,
                result.meaning,
                controller.signal
              ),
              aborted,
            ]);
            assertAvailable(controller.signal);
            known.current.set(key, result);
          }
          if (play.current) {
            persisted.current.add(key);
          }
          publish(key, {
            meaning: result.meaning,
            shown: true,
            status: "ready",
          });
          return result;
        } catch (error) {
          if (running.current.get(key)?.controller === controller) {
            publish(key, { status: "error" });
          }
          throw error;
        } finally {
          clearTimeout(timer);
          if (running.current.get(key)?.controller === controller) {
            running.current.delete(key);
          }
        }
      })();
      running.current.set(key, { controller, work });
      return trackPendingUserWork(work);
    },
    [publish]
  );
  const toggle = useCallback(
    (spot: UtteranceSpot) => {
      const key = meaningKey(spot);
      const state = current.current[key];
      if (state?.status === "pending") {
        return;
      }
      if (state?.status === "ready") {
        publish(key, { ...state, shown: !state.shown });
        return;
      }
      start(
        spot,
        play.current ? known.current.get(key)?.meaning : undefined
      ).catch(() => undefined);
    },
    [publish, start]
  );
  const forSave = useCallback(async (spot: UtteranceSpot) => {
    const key = meaningKey(spot);
    const pending = running.current.get(key);
    if (pending) {
      await pending.work.catch(() => undefined);
    }
    return known.current.get(key)?.meaning;
  }, []);
  const attachPlay = useCallback(
    (id: string) => {
      play.current = id;
      for (const [key, item] of known.current) {
        if (!(persisted.current.has(key) || running.current.has(key))) {
          start(item, item.meaning).catch(() => undefined);
        }
      }
    },
    [start]
  );
  const retain = useCallback((ids: Set<string>) => {
    const next = { ...current.current };
    let changed = false;
    for (const key of Object.keys(next)) {
      if (ids.has(key.slice(0, key.lastIndexOf(":")))) {
        continue;
      }
      const pending = running.current.get(key);
      running.current.delete(key);
      pending?.controller.abort();
      known.current.delete(key);
      persisted.current.delete(key);
      delete next[key];
      changed = true;
    }
    if (changed) {
      current.current = next;
      setStates(next);
    }
  }, []);
  const openingMeanings = useCallback(() => [...known.current.values()], []);
  useEffect(
    () => () => {
      const pending = [...running.current.values()];
      running.current.clear();
      for (const item of pending) {
        item.controller.abort();
      }
    },
    []
  );
  return useMemo(
    () => ({ attachPlay, forSave, openingMeanings, retain, states, toggle }),
    [states, toggle, attachPlay, forSave, openingMeanings, retain]
  );
}

export interface UtteranceSource extends UtteranceMeaning {
  position?: number;
  speaker: string;
  text: string;
}
interface MeaningsView {
  ask: (source: UtteranceSource) => void;
  states: Record<string, MeaningState>;
  toggle: (spot: UtteranceSpot) => void;
}
const Context = createContext<MeaningsView>({
  ask: () => undefined,
  states: {},
  toggle: () => undefined,
});
export function UtteranceMeaningsProvider({
  value,
  children,
}: {
  value: MeaningsView;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useMeaningView = () => useContext(Context);
