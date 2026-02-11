import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import rootRouter from "./routes/v1/index.js";

const app = new Hono();

app.use("*", cors({ origin: "*", exposeHeaders: ["X-Conversation-Id", "X-Agent-Type"] }));

app.route("/api/v1", rootRouter);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export { app };
