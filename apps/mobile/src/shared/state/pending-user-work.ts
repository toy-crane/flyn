import { useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hasPendingWork() {
  return count > 0;
}

/** Keep a forced-update screen behind user work until its result can render. */
export function trackPendingUserWork<T>(work: Promise<T>): Promise<T> {
  count += 1;
  notify();

  const finish = () => {
    // Let the request's own success/error handlers update their screen first.
    setTimeout(() => {
      count -= 1;
      notify();
    }, 0);
  };
  work.then(finish, finish);
  return work;
}

export function usePendingUserWork() {
  return useSyncExternalStore(subscribe, hasPendingWork, hasPendingWork);
}
