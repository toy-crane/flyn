import { describe, expect, it } from "bun:test";
import app from "./index";

describe("API routes", () => {
  it("returns ok", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ service: "flyn-api", status: "ok" });
  });

  it("404s an unknown route", async () => {
    const res = await app.request("/nope");

    expect(res.status).toBe(404);
  });

  it("walking skeleton의 scratch-notes route를 더는 노출하지 않는다", async () => {
    const res = await app.request("/server/scratch-notes/stats");

    expect(res.status).toBe(404);
  });
});
