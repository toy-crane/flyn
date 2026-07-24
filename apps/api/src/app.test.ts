import { describe, expect, test } from "bun:test";

import { app } from "./app";

describe("GET /health", () => {
  test("서버 기동 없이 200과 ok 상태를 돌려준다", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      service: "flyn-api",
      status: "ok",
    });
  });

  test("없는 경로는 404다", async () => {
    const res = await app.request("/nope");

    expect(res.status).toBe(404);
  });
});
