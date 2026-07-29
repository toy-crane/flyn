import { describe, expect, test } from "bun:test";
import {
  assertCompatibleAgentDevice,
  deriveRepositoryId,
} from "./dev-worktree/system";

const REPOSITORY_ID_PATTERN = /^[a-f0-9]{16}$/u;

describe("dev:worktree system boundary", () => {
  test("git common directory에서 안정적인 16자리 repository ID를 만든다", () => {
    const first = deriveRepositoryId("/repo/.git");
    const repeated = deriveRepositoryId("/repo/.git");
    const other = deriveRepositoryId("/other/.git");

    expect(first).toHaveLength(16);
    expect(first).toBe(repeated);
    expect(first).not.toBe(other);
    expect(first).toMatch(REPOSITORY_ID_PATTERN);
  });

  test("agent-device 0.20.0 이상만 승인한다", () => {
    expect(() => assertCompatibleAgentDevice("0.20.0")).not.toThrow();
    expect(() => assertCompatibleAgentDevice("1.2.3")).not.toThrow();
    expect(() => assertCompatibleAgentDevice("0.19.9")).toThrow(
      "agent-device 0.20.0 이상"
    );
    expect(() => assertCompatibleAgentDevice("unknown")).toThrow(
      "agent-device version"
    );
  });
});
