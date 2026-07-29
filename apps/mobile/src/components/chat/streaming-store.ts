export interface StreamingStore {
  get: () => string;
  set: (value: string) => void;
  subscribe: (listener: () => void) => () => void;
}

/**
 * 토큰마다 상세 화면 전체를 다시 그리지 않게 마지막 AI 행만 구독하는 작은 저장소.
 * Evan Bacon 템플릿의 경계를 가져오되 텍스트 하나 외의 범용 상태는 넣지 않는다.
 */
export function createStreamingStore(): StreamingStore {
  let text = "";
  const listeners = new Set<() => void>();

  return {
    get: () => text,
    set: (value) => {
      text = value;
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
