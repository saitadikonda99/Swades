import { Context } from "hono";

const sendMessage = async (c: Context) => {
  return c.json({ message: "Message sent" });
};

const listConversations = async (c: Context) => {
  return c.json({ message: "Conversations listed" });
};

const getConversation = async (c: Context) => {
    return c.json({ message: "Conversation retrieved" });
};

const deleteConversation = async (c: Context) => {
    return c.json({ message: "Conversation deleted" });
};

export const chatController = {
    sendMessage,
    listConversations,
    getConversation,
    deleteConversation,
};