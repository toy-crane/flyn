import { expect, test } from "bun:test";
import { serve } from "bun";
import type { DeliveryState } from "./delivery-execution";
import { GitHubDeliveryJournal } from "./delivery-journal";

test.each([{}, { pending: null, success: { database: "main" }, version: 1 }])(
  "잘못된 원격 상태를 빈 성공 이력으로 해석하지 않는다: %j",
  async (state) => {
    const server = serve({
      fetch: () =>
        Response.json({
          content: Buffer.from(JSON.stringify(state)).toString("base64"),
          encoding: "base64",
          sha: "1".repeat(40),
          type: "file",
        }),
      port: 0,
    });
    try {
      await expect(
        new GitHubDeliveryJournal("test", server.url.origin).read()
      ).rejects.toThrow("형식");
    } finally {
      server.stop(true);
    }
  }
);

test("GitHub 상태 저장은 읽었던 blob SHA로 갱신하며 충돌을 덮어쓰지 않는다", async () => {
  const state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  let blob = "1".repeat(40);
  let content = Buffer.from(JSON.stringify(state)).toString("base64");
  const server = serve({
    async fetch(request) {
      const url = new URL(request.url);
      expect(url.pathname).toBe("/repos/toy-crane/flyn/contents/state.json");
      if (request.method === "GET") {
        expect(url.searchParams.get("ref")).toBe("deployment-state");
        return Response.json({
          content,
          encoding: "base64",
          sha: blob,
          type: "file",
        });
      }
      const body = (await request.json()) as {
        sha: string;
        branch: string;
        content: string;
      };
      expect(body.branch).toBe("deployment-state");
      if (body.sha !== blob) {
        return new Response("conflict", { status: 409 });
      }
      blob = "2".repeat(40);
      ({ content } = body);
      return Response.json({ content: { sha: blob } });
    },
    port: 0,
  });
  try {
    const journal = new GitHubDeliveryJournal("test-token", server.url.origin);
    const first = await journal.read();
    const second = await journal.read();
    expect(first.state).toEqual(state);
    first.state.pending = {
      remoteId: null,
      requestId: "request-1",
      service: "database",
      sha: "a".repeat(40),
    };
    expect(await journal.write(first.revision, first.state)).toBe(
      "2".repeat(40)
    );
    await expect(journal.write(second.revision, second.state)).rejects.toThrow(
      "409"
    );
    expect((await journal.read()).state.pending?.requestId).toBe("request-1");
  } finally {
    server.stop(true);
  }
});
