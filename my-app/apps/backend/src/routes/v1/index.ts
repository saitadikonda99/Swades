/**
 * Root API router — mounts feature routers under their path segments.
 *
 * - /chat -> chat routes
 */

import { Hono } from "hono";
import chatRoute from "./chat.route";

const rootRouter = new Hono();

rootRouter.route("/chat", chatRoute);

export default rootRouter;