import { useIsMutating } from "@tanstack/react-query";

import { usePendingUserWork } from "@/shared/state/pending-user-work";

/** A confirmed block waits for an answer or save already under way. */
export function useUpdateScreenVisibility(blocked: boolean) {
  const hasPendingUserWork = usePendingUserWork();
  const activeSaves = useIsMutating();
  return blocked && !hasPendingUserWork && activeSaves === 0;
}
