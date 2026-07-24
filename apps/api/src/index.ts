import { app } from "./app";

const DEFAULT_PORT = 3000;

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? DEFAULT_PORT),
};
