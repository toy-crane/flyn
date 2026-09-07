declare const __DEV__: boolean;

import { getDevServer } from "expo-router/build/getDevServer";
import { type MobileEnv, getMobileEnv as readMobileEnv } from "./env";

/** Keep native runtime imports out of the schema used by Bun and Expo config. */
export function getMobileEnv(): MobileEnv {
  if (__DEV__) {
    const server = getDevServer();
    if (server.bundleLoadedFromServer) {
      return readMobileEnv(server.url);
    }
  }
  return readMobileEnv();
}
