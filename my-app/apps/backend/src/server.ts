import { serve } from "@hono/node-server";
import { app } from "./app.js";

const PORT = process.env.PORT || 3002;

serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`Server running on http://localhost:${PORT}`);
