import { Hono } from "hono";
import { chatController } from "../../controllers/chat.controller.js";

const chatRoute = new Hono();

chatRoute.post("/messages", chatController.sendMessage);
chatRoute.get("/conversations", chatController.listConversations);
chatRoute.get("/conversations/:id", chatController.getConversation);
chatRoute.delete("/conversations/:id", chatController.deleteConversation);

export default chatRoute;