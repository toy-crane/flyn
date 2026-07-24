import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "flyn-api", status: "ok" }));

export default app;
