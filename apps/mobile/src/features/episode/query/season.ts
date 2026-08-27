import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { readSeason, type Season } from "@/features/episode/api/season";

/**
 * Keyed by user id so signing in as someone else cannot read the previous
 * person's season out of the cache.
 */
export function seasonQueryKey(userId: string) {
  return ["season", userId] as const;
}

export function seasonQueryOptions(userId: string, accessToken: string) {
  return queryOptions<Season>({
    queryFn: () => readSeason(accessToken),
    queryKey: seasonQueryKey(userId),
    // Home has nothing to show until this lands, so one quick retry covers a
    // blip. Past that a button beats a longer wait.
    retry: 1,
  });
}

/** How far this account is into the season. Waits while there is no session. */
export function useSeason(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    ...seasonQueryOptions(userId ?? "", accessToken ?? ""),
    enabled: userId !== undefined && accessToken !== undefined,
  });
}

/**
 * Marks the season as moved on after an episode ends.
 *
 * The ending is recorded on the server, so the app does not write the new
 * progress itself: it drops what it knows and reads again. One source keeps
 * the finished list, the next episode and the completion from drifting apart.
 */
export function useSeasonRefresh(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: seasonQueryKey(userId ?? ""),
      }),
    [queryClient, userId]
  );
}
