import { describe, expect, test } from "bun:test";
import {
  assertCompatibleAgentDevice,
  deriveRepositoryId,
  isReadyResponse,
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

  test("API health 본문과 Metro status HTTP 성공을 readiness로 판별한다", async () => {
    await expect(
      isReadyResponse(
        "http://127.0.0.1:3000/health",
        Response.json({ status: "ok" })
      )
    ).resolves.toBe(true);
    await expect(
      isReadyResponse(
        "http://127.0.0.1:3000/health",
        Response.json({ status: "starting" })
      )
    ).resolves.toBe(false);
    await expect(
      isReadyResponse(
        "http://127.0.0.1:8081/status",
        new Response(null, { status: 200 })
      )
    ).resolves.toBe(true);
    await expect(
      isReadyResponse(
        "http://127.0.0.1:8081/status",
        new Response(null, { status: 503 })
      )
    ).resolves.toBe(false);
  });
});
