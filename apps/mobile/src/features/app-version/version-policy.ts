export interface PolicyAudience {
  distribution: "internal" | "public";
  platform: "android" | "ios";
}

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** Compares the installed binary version with the operator's minimum. */
export function compareInstalledVersion(
  installed: string,
  minimum: string
): -1 | 0 | 1 | null {
  if (!(VERSION_PATTERN.test(installed) && VERSION_PATTERN.test(minimum))) {
    return null;
  }

  const installedParts = installed.split(".");
  const minimumParts = minimum.split(".");
  for (let index = 0; index < 3; index += 1) {
    const current = installedParts[index] ?? "";
    const required = minimumParts[index] ?? "";
    if (current.length !== required.length) {
      return current.length < required.length ? -1 : 1;
    }
    if (current !== required) {
      return current < required ? -1 : 1;
    }
  }
  return 0;
}

/** An unknown release channel must never accidentally inherit another audience's block. */
export function getPolicyAudience(
  platform: string,
  channel: string | null,
  isDevelopment: boolean
): PolicyAudience | null {
  if (platform !== "ios" && platform !== "android") {
    return null;
  }
  if (channel === "internal" || (!channel && isDevelopment)) {
    return { distribution: "internal", platform };
  }
  if (channel === "production" || channel === "public") {
    return { distribution: "public", platform };
  }
  return null;
}
