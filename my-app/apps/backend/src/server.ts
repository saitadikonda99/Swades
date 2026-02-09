import { Hono } from "hono";
import { serve } from "@hono/node-server";
import dotenv from "dotenv";

dotenv.config();


const PORT = process.env.PORT || 3002;

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`Server running on http://localhost:${PORT}`);
