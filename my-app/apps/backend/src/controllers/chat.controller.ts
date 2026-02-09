import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import type { MessageHistoryItem, SendMessageRequest, SendMessageResponse } from "../types/chat.types.js";
import { routeMessageAI } from "../agents/router.agent.js";

const sendMessage = async (c: Context) => {
  try {
    const body = (await c.req.json()) as SendMessageRequest;
    const { conversationId, userId, message } = body;

    const response = await chatService.sendMessage({
      conversationId,
      userId,
      message,
    });

    const conversationHistory = await chatService.getConversation(response.conversationId);

    const history: MessageHistoryItem[] = (conversationHistory?.messages ?? []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const agentType = await routeMessageAI(message, history);

    return c.json<SendMessageResponse>({
      conversationId: response.conversationId,
      message: response.message,
      agentType,
    });

  } catch {
    return c.json({ error: "Failed to send message" }, 500);
  }
};

const listConversations = async (c: Context) => {
  try {
    const userId = c.req.query("userId");
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    const conversations = await chatService.listConversations(userId);
    return c.json(conversations);
  } catch {
    return c.json({ error: "Failed to list conversations" }, 500);
  }
};

const getConversation = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Conversation id is required" }, 400);
    }

    const conversation = await chatService.getConversation(id);
    if (!conversation) {
      return c.json({ error: "Conversation not found" }, 404);
    }
    return c.json(conversation);
  } catch {
    return c.json({ error: "Failed to get conversation" }, 500);
  }
};

const deleteConversation = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Conversation id is required" }, 400);
    }

    const conversation = await chatService.deleteConversation(id);
    return c.json(conversation);
  } catch {
    return c.json({ error: "Failed to delete conversation" }, 500);
  }
};

export const chatController = {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
};