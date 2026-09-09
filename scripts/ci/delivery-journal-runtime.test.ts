import { expect, test } from "bun:test";
import type { DeliveryState } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";

// Explicit opt-in only. PR tests must never receive the token used by this test.
test.skipIf(process.env.RUN_DELIVERY_JOURNAL_RUNTIME_TESTS !== "1")(
  "실제 GitHub에서 배포 기록이 유지되고 오래된 SHA의 쓰기가 충돌한다",
  async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GitHub 원격 검증 토큰이 필요합니다.");
    }
    const branch = `deployment-state-check-${crypto.randomUUID()}`;
    const api = async (path: string, method = "GET", body?: unknown) => {
      const response = await fetch(
        `https://api.github.com/repos/toy-crane/flyn/${path}`,
        {
          body: body === undefined ? undefined : JSON.stringify(body),
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2026-03-10",
          },
          method,
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
        }
      );
      if (!response.ok) {
        throw new Error(`GitHub fixture ${method} ${response.status}`);
      }
      return response.status === 204 ? null : response.json();
    };
    const main = (await api("git/ref/heads/main")) as {
      object: { sha: string };
    };
    await api("git/refs", "POST", {
      ref: `refs/heads/${branch}`,
      sha: main.object.sha,
    });
    try {
      const state: DeliveryState = {
        pending: null,
        success: { api: null, database: null, edge: null, mobile: null },
        version: 1,
      };
      await api("contents/state.json", "PUT", {
        branch,
        content: Buffer.from(JSON.stringify(state)).toString("base64"),
        message: "test: 배포 기록 충돌을 검증한다",
      });
      const journal = new GitHubDeliveryJournal(
        token,
        "https://api.github.com",
        branch
      );
      const first = await journal.read();
      const second = await journal.read();
      first.state.pending = {
        remoteId: null,
        requestId: "runtime-check-only",
        service: "mobile",
        sha: main.object.sha,
      };
      await journal.write(first.revision, first.state);
      await expect(
        journal.write(second.revision, second.state)
      ).rejects.toThrow("409");
      const reread = await new GitHubDeliveryJournal(
        token,
        "https://api.github.com",
        branch
      ).read();
      expect(reread.state.pending?.requestId).toBe("runtime-check-only");
      expect(reread.state.success.mobile).toBeNull();
    } finally {
      await api(`git/refs/heads/${branch}`, "DELETE");
    }
  },
  120_000
);
