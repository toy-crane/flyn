export type Platform = "android" | "ios";

export type DevCommand =
  | { kind: "remove" }
  | {
      clear: boolean;
      kind: "start";
      platforms: Platform[];
      physical?: boolean;
      host?: string;
    }
  | { kind: "status" }
  | { kind: "stop" };

export const USAGE = [
  "사용법: bun run dev <ios|android>... [--clear]",
  "",
  "  bun run dev ios             iOS 개발 세션을 시작합니다.",
  "  bun run dev android         Android 개발 세션을 시작합니다.",
  "  bun run dev ios android     두 플랫폼을 한 세션에서 함께 시작합니다.",
  "  bun run dev ios --clear     이 worktree의 Metro 캐시를 비우고 시작합니다.",
  "  bun run dev ios android --physical  설치된 실기기 앱의 LAN 연결을 준비합니다.",
  "  bun run dev ios --physical --host 192.168.0.10  Mac의 LAN 주소를 지정합니다.",
  "  bun run dev:status          모든 worktree의 세션, 포트, 기기 배정을 보여 줍니다.",
  "  bun run dev:stop            현재 worktree의 개발 세션을 종료합니다.",
  "  bun run dev:remove          현재 worktree의 개발 자원을 정리하고 기기를 풀로 돌려놓습니다.",
].join("\n");

export const PLATFORMS: Platform[] = ["android", "ios"];

function isPlatform(value: string): value is Platform {
  return (PLATFORMS as string[]).includes(value);
}

/**
 * The platform argument is required. A bare `bun run dev` starts nothing
 * because guessing the platform from running devices makes the same command
 * behave differently on two machines.
 */
export function parseDevCommand(argv: string[]): DevCommand {
  const args = argv.filter((argument) => argument !== "--");

  if (args[0] === "stop" && args.length === 1) {
    return { kind: "stop" };
  }

  if (args[0] === "remove" && args.length === 1) {
    return { kind: "remove" };
  }

  if (args[0] === "status" && args.length === 1) {
    return { kind: "status" };
  }

  return parseStartCommand(args);
}

function parseStartCommand(args: string[]): DevCommand {
  const platforms: Platform[] = [];
  let clear = false;
  let physical = false;
  let host: string | undefined;

  const argumentsIterator = args[Symbol.iterator]();
  for (const argument of argumentsIterator) {
    if (argument === "--physical") {
      physical = true;
      continue;
    }
    if (argument === "--host") {
      host = argumentsIterator.next().value;
      if (!host || host.startsWith("--")) {
        throw new Error("--host 뒤에 Mac의 LAN IPv4 주소를 지정해 주세요.");
      }
      continue;
    }
    if (argument === "--clear") {
      clear = true;
      continue;
    }

    if (!isPlatform(argument)) {
      throw new Error(`알 수 없는 인수입니다: ${argument}.\n\n${USAGE}`);
    }

    if (!platforms.includes(argument)) {
      platforms.push(argument);
    }
  }

  if (platforms.length === 0) {
    throw new Error(`실행할 플랫폼을 지정해 주세요.\n\n${USAGE}`);
  }

  if (host && !physical) {
    throw new Error("--host는 --physical과 함께 사용해 주세요.");
  }
  return {
    clear,
    kind: "start",
    platforms,
    ...(physical ? { physical: true } : {}),
    ...(host ? { host } : {}),
  };
}
