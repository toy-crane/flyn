import { getMobileEnv } from "@env";

/** Public legal pages shared by signed-out entry and signed-in settings. */
export function getLegalDestinations() {
  const webUrl = getMobileEnv().EXPO_PUBLIC_WEB_URL;

  return {
    privacy: new URL("/privacy", webUrl).toString(),
    terms: new URL("/terms", webUrl).toString(),
  };
}
