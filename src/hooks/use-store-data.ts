import { useEffect, useRef, useState } from "react";

import type { DataStore } from "@/lib/data-store";
import { getDataStore } from "@/lib/data-store-instance";

/**
 * Reads once from the store on mount. Deliberately minimal — loading states,
 * refetching, and error surfaces are designed with the real data in S7.
 *
 * `undefined` means still loading.
 */
export function useStoreData<T>(
  load: (store: DataStore) => Promise<T>,
): T | undefined {
  const [data, setData] = useState<T>();
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    loadRef.current(getDataStore()).then((value) => {
      if (active) setData(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
