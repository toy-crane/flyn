import { useCallback, useRef, useState } from "react";

function claimRetry(lock: { current: boolean }): boolean {
  if (lock.current) {
    return false;
  }

  lock.current = true;
  return true;
}

/** Keeps a failed query's retry control visible while refetch clears its error. */
export function useVisibleRetry(refetch: () => Promise<unknown>) {
  const [isRetrying, setIsRetrying] = useState(false);
  const retrying = useRef<boolean>(false);

  const retry = useCallback(() => {
    // TanStack Query clears an error before its refetch settles. This state
    // belongs to the press so the same error card can stay in place meanwhile.
    if (!claimRetry(retrying)) {
      return;
    }

    setIsRetrying(true);

    refetch()
      .catch(() => {
        // The query keeps the failure that the screen will show again.
      })
      .finally(() => {
        retrying.current = false;
        setIsRetrying(false);
      });
  }, [refetch]);

  return { isRetrying, retry };
}
