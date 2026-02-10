import type { Conversation, Message } from "../generated/prisma/client.js";
import { prisma } from "../db/db.js";

/** Conversation with messages included (repository return type). */
export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

const createConversation = async (userId: string): Promise<Conversation> => {
  return prisma.conversation.create({
    data: { userId },
  });
};

const createMessage = async (
  conversationId: string,
  role: "user" | "agent",
  content: string
): Promise<Message> => {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
};

const findManyByUserId = async (userId: string): Promise<Conversation[]> => {
  return prisma.conversation.findMany({
    where: { userId },
  });
};

const findManyByUserIdWithMessages = async (userId: string): Promise<ConversationWithMessages[]> => {
  return prisma.conversation.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

const findByIdWithMessages = async (
  id: string
): Promise<ConversationWithMessages | null> => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

const deleteById = async (id: string): Promise<Conversation> => {
  return prisma.conversation.delete({
    where: { id },
  });
};

export const chatRepository = {
  createConversation,
  createMessage,
  findManyByUserId,
  findManyByUserIdWithMessages,
  findByIdWithMessages,
  deleteById,
};
