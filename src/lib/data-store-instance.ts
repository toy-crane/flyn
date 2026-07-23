import type { DataStore } from "@/lib/data-store";
import { createMockDataStore } from "@/lib/data-store-mock";

/**
 * The single store the app reads through. S0 points it at the in-memory mock;
 * S1 and S7 repoint it at Supabase without screens changing.
 */
let instance: DataStore = createMockDataStore();

export function getDataStore(): DataStore {
  return instance;
}

export function setDataStore(next: DataStore): void {
  instance = next;
}
