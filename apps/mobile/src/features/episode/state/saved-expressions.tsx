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
  type SavedExpressionRef,
  type SavedExpressionSpot,
  spotKey,
  spotOfRef,
} from "@/features/episode/api/saved-expression";

/**
 * 한 자리의 책갈피가 지금 어떤 상태인지.
 *
 * 아무 상태도 없으면 담지 않은 것이다. `error`는 담으려다 실패한 자리이며, 그
 * 자리에만 실패 줄이 선다. 취소가 실패하면 담긴 상태로 돌아가므로 실패로 남지
 * 않는다. 담아 둔 것이 사라지지 않았다는 것이 화면에 보이는 사실이기 때문이다.
 */
export type SavedExpressionState =
  | { status: "saved"; id: string }
  | { status: "saving" }
  | { status: "erasing"; id: string }
  | { status: "error" };

type SaveExpression = (
  spot: SavedExpressionSpot,
  signal: AbortSignal
) => Promise<SavedExpressionRef>;
type EraseExpression = (id: string, signal: AbortSignal) => Promise<void>;

export interface SavedExpressions {
  states: Record<string, SavedExpressionState>;
  /** 담았으면 도로 놓고, 담지 않았으면 담는다. 실패한 자리는 다시 담는다. */
  toggle: (spot: SavedExpressionSpot) => void;
}

export interface SavedExpressionStore extends SavedExpressions {
  /** 다시 받기와 수정으로 사라진 메시지의 자리를 함께 버린다. */
  retain: (messageIds: Set<string>) => void;
}

const SavedExpressionsContext = createContext<SavedExpressions>({
  states: {},
  toggle: () => undefined,
});

export function SavedExpressionsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SavedExpressions;
}) {
  return (
    <SavedExpressionsContext.Provider value={value}>
      {children}
    </SavedExpressionsContext.Provider>
  );
}

export function useSavedExpressions() {
  return useContext(SavedExpressionsContext);
}

/**
 * 이 대화에서 담아 둔 표현.
 *
 * 교정과 같은 모양을 쓴다. 자리마다 상태를 따로 들고, 상태를 읽는 자리가 스스로
 * 자기 것만 읽으므로, 책갈피 하나를 눌러도 흐르는 장면이 다시 그려지지 않는다.
 *
 * 담는 동안에는 그 자리의 요청을 하나로 묶는다. 인물 대사는 서버가 한국어 뜻을
 * 만드느라 곧바로 끝나지 않으므로, 두 번 눌러 두 항목이 생기는 길을 막는다.
 */
export function useEpisodeSavedExpressions(
  saved: readonly SavedExpressionRef[] | undefined,
  save: SaveExpression,
  erase: EraseExpression,
  /** 계정에 담긴 것이 바뀌었을 때. 담았으면 참, 도로 놓았으면 거짓이다. */
  onChanged: (isSaved: boolean) => void
): SavedExpressionStore {
  const [states, setStates] = useState<Record<string, SavedExpressionState>>(
    () =>
      Object.fromEntries(
        (saved ?? []).map((ref) => [
          spotKey(spotOfRef(ref)),
          { id: ref.id, status: "saved" as const },
        ])
      )
  );
  const current = useRef(states);
  const saver = useRef(save);
  const eraser = useRef(erase);
  const announce = useRef(onChanged);

  saver.current = save;
  eraser.current = erase;
  announce.current = onChanged;

  const running = useRef(new Map<string, AbortController>());
  const publish = useCallback((next: Record<string, SavedExpressionState>) => {
    current.current = next;
    setStates(next);
  }, []);
  const settle = useCallback(
    (key: string, next: SavedExpressionState | undefined) => {
      const merged = { ...current.current };

      if (next) {
        merged[key] = next;
      } else {
        delete merged[key];
      }

      publish(merged);
    },
    [publish]
  );
  const toggle = useCallback(
    (spot: SavedExpressionSpot) => {
      const key = spotKey(spot);

      if (running.current.has(key)) {
        return;
      }

      const state = current.current[key];
      const controller = new AbortController();

      running.current.set(key, controller);

      const finish = (next: SavedExpressionState | undefined) => {
        if (running.current.get(key) !== controller) {
          return;
        }

        running.current.delete(key);
        settle(key, next);
      };

      if (state?.status === "saved") {
        settle(key, { id: state.id, status: "erasing" });
        eraser.current(state.id, controller.signal).then(
          () => {
            const kept = running.current.get(key) === controller;

            finish(undefined);

            if (kept) {
              announce.current(false);
            }
          },
          () => finish({ id: state.id, status: "saved" })
        );

        return;
      }

      settle(key, { status: "saving" });
      saver.current(spot, controller.signal).then(
        (ref) => {
          const kept = running.current.get(key) === controller;

          finish({ id: ref.id, status: "saved" });

          if (kept) {
            announce.current(true);
          }
        },
        () => finish({ status: "error" })
      );
    },
    [settle]
  );
  const retain = useCallback(
    (messageIds: Set<string>) => {
      const next = { ...current.current };
      let changed = false;

      for (const key of Object.keys(next)) {
        if (messageIds.has(key.slice(0, key.lastIndexOf(":")))) {
          continue;
        }

        running.current.get(key)?.abort();
        running.current.delete(key);
        delete next[key];
        changed = true;
      }

      if (changed) {
        publish(next);
      }
    },
    [publish]
  );

  useEffect(() => {
    const requests = running.current;

    return () => {
      for (const controller of requests.values()) {
        controller.abort();
      }

      requests.clear();
    };
  }, []);

  return useMemo(() => ({ retain, states, toggle }), [retain, states, toggle]);
}
