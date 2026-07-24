import { describe, expect, it } from "bun:test";
import app from "./index";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ service: "flyn-api", status: "ok" });
  });

  it("404s an unknown route", async () => {
    const res = await app.request("/nope");

    expect(res.status).toBe(404);
  });
});
