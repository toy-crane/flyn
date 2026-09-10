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
  eraseSavedExpression,
  type SavedExpressionRef,
  type SavedExpressionSpot,
  saveExpression,
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

/** 지금 담고 있는 대화. 담는 길이 이 둘로 정해진다. */
export interface SavedExpressionSource {
  episodeId: string;
  /** 이 화에서 이미 담아 둔 자리. 서버가 들고 있는 진실이다. */
  saved: readonly SavedExpressionRef[] | undefined;
  /** 아직 첫 메시지를 보내지 않은 대화에는 없다. */
  storyPlayId: string | undefined;
}

type SaveExpression = (
  spot: SavedExpressionSpot,
  source: SavedExpressionSource,
  signal: AbortSignal
) => Promise<SavedExpressionRef>;
type EraseExpression = (id: string, signal: AbortSignal) => Promise<void>;

export interface SavedExpressions {
  states: Record<string, SavedExpressionState>;
  /** 담았으면 도로 놓고, 담지 않았으면 담는다. 실패한 자리는 다시 담는다. */
  toggle: (spot: SavedExpressionSpot) => void;
}

export interface SavedExpressionStore {
  /**
   * 서버가 아는 자리를 가져다 놓는다.
   *
   * 다른 대화로 옮겨 가면 통째로 갈아치우고, 같은 대화면 아직 모르는 자리만
   * 더한다. 담는 중이거나 놓는 중인 자리를 덮어쓰지 않는다.
   */
  hydrate: (source: SavedExpressionSource) => void;
  /** 다시 받기와 수정으로 사라진 메시지의 자리를 함께 버린다. */
  retain: (messageIds: Set<string>) => void;
  states: Record<string, SavedExpressionState>;
  /** 담거나 도로 놓는다. 끝나면 부른 화면이 넘긴 자리로 알린다. */
  toggle: (
    spot: SavedExpressionSpot,
    onChanged: (isSaved: boolean) => void
  ) => void;
}

function sourceKey(source: SavedExpressionSource): string {
  return `${source.storyPlayId ?? ""}:${source.episodeId}`;
}

function savedStates(
  saved: readonly SavedExpressionRef[] | undefined
): Record<string, SavedExpressionState> {
  return Object.fromEntries(
    (saved ?? []).map((ref) => [
      spotKey(spotOfRef(ref)),
      { id: ref.id, status: "saved" as const },
    ])
  );
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
 * 한 대화에서 담아 둔 표현.
 *
 * 교정과 같은 모양을 쓴다. 자리마다 상태를 따로 들고, 상태를 읽는 자리가 스스로
 * 자기 것만 읽으므로, 책갈피 하나를 눌러도 흐르는 장면이 다시 그려지지 않는다.
 *
 * 담는 동안에는 그 자리의 요청을 하나로 묶는다. 인물 대사는 서버가 한국어 뜻을
 * 만드느라 곧바로 끝나지 않으므로, 두 번 눌러 두 항목이 생기는 길을 막는다.
 *
 * 대화 화면과 표현 돌아보기가 이 하나를 나눠 쓴다. 두 화면은 나란한 스택이라
 * 서로의 상태를 볼 수 없고, 대화 화면은 돌아왔을 때 다시 그려지지도 않는다.
 * 그래서 저장소를 두 화면 위의 층에 두고 각자 `hydrate`로 서버가 아는 자리를
 * 가져다 놓는다.
 */
export function useSavedExpressionStore(
  save: SaveExpression,
  erase: EraseExpression
): SavedExpressionStore {
  const [states, setStates] = useState<Record<string, SavedExpressionState>>(
    {}
  );
  const current = useRef(states);
  const source = useRef<SavedExpressionSource>({
    episodeId: "",
    saved: undefined,
    storyPlayId: undefined,
  });
  const saver = useRef(save);
  const eraser = useRef(erase);

  saver.current = save;
  eraser.current = erase;

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
  const hydrate = useCallback(
    (next: SavedExpressionSource) => {
      const isSameSource = sourceKey(next) === sourceKey(source.current);

      source.current = next;

      const merged = isSameSource
        ? { ...savedStates(next.saved), ...current.current }
        : savedStates(next.saved);

      if (
        isSameSource &&
        Object.keys(merged).length === Object.keys(current.current).length
      ) {
        return;
      }

      publish(merged);
    },
    [publish]
  );
  const toggle = useCallback(
    (spot: SavedExpressionSpot, onChanged: (isSaved: boolean) => void) => {
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
              onChanged(false);
            }
          },
          () => finish({ id: state.id, status: "saved" })
        );

        return;
      }

      settle(key, { status: "saving" });
      saver.current(spot, source.current, controller.signal).then(
        (ref) => {
          const kept = running.current.get(key) === controller;

          finish({ id: ref.id, status: "saved" });

          if (kept) {
            onChanged(true);
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

  return useMemo(
    () => ({ hydrate, retain, states, toggle }),
    [hydrate, retain, states, toggle]
  );
}

const StoreContext = createContext<SavedExpressionStore>({
  hydrate: () => undefined,
  retain: () => undefined,
  states: {},
  toggle: () => undefined,
});

/**
 * 한 화와 그 화의 표현 돌아보기가 함께 쓰는 저장소를 그 위 층에 둔다.
 *
 * 여기 두어야 표현 돌아보기에서 담은 것이 대화로 돌아갔을 때 그대로 보인다.
 * 두 화면은 나란한 스택이고 대화 화면은 돌아왔다고 해서 다시 만들어지지 않는다.
 */
export function EpisodeSavedExpressionsProvider({
  accessToken,
  children,
}: {
  accessToken: string | undefined;
  children: ReactNode;
}) {
  const token = useRef(accessToken);

  token.current = accessToken;

  const store = useSavedExpressionStore(
    useCallback(
      (spot, source, signal) =>
        saveExpression(
          token.current ?? "",
          source.storyPlayId ?? "",
          source.episodeId,
          spot,
          signal
        ),
      []
    ),
    useCallback(
      (id, signal) => eraseSavedExpression(token.current ?? "", id, signal),
      []
    )
  );

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

/** 위 층의 저장소. 두 화면이 같은 것을 읽고 같은 것에 쓴다. */
export function useEpisodeSavedExpressions() {
  return useContext(StoreContext);
}
