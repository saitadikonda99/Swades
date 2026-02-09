import { Hono } from "hono";
import { serve } from "@hono/node-server";
import dotenv from "dotenv";
dotenv.config();


import rootRouter from "./routes/v1";

const PORT = process.env.PORT || 3002;

const app = new Hono();

app.route("/api/v1", rootRouter);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`Server running on http://localhost:${PORT}`);
