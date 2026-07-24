import { Hono } from "hono";

export const app = new Hono().get("/health", (c) =>
  c.json({
    service: "flyn-api",
    status: "ok" as const,
    time: new Date().toISOString(),
  })
);

export type AppType = typeof app;
