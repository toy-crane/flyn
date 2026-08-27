import { getMobileEnv } from "@env";
import { fetch as expoFetch } from "expo/fetch";

const TRAILING_SLASHES = /\/+$/;

/**
 * The address of one AI route.
 *
 * The base is one the Simulator and the Emulator have to actually reach, so it
 * stays a value the person sets per machine. The shared mobile environment
 * contract validates it before Expo starts or builds the app.
 */
export function aiUrl(path: string): string {
  const { EXPO_PUBLIC_API_URL: baseUrl } = getMobileEnv();

  return `${baseUrl.replace(TRAILING_SLASHES, "")}${path}`;
}

/**
 * The one address and the one way of authorising a streaming AI request.
 *
 * `getAccessToken` is a function rather than a token because the transport
 * resolves `headers` on every send. Passing the token itself would freeze
 * whatever was current when the screen mounted, and a refreshed session would
 * then be sent under a dead token.
 */
export function aiRequestOptions(
  path: string,
  getAccessToken: () => string | undefined
) {
  return {
    api: aiUrl(path),
    // `expo/fetch` is what delivers the response in pieces on iOS and Android.
    // The global fetch in React Native waits for the whole body first, which
    // would turn a stream into a single late answer.
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    headers: (): Record<string, string> => {
      const accessToken = getAccessToken();

      return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    },
  };
}
