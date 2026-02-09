import { chatRepository } from "../repositories/chat.repository.js";
import type {
  ConversationSummaryDto,
  ConversationWithMessagesDto,
  DeletedConversationDto,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types.js";

const sendMessage = async (
  input: SendMessageRequest
): Promise<SendMessageResponse> => {
  try {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const newConversation = await chatRepository.createConversation(
        input.userId
      );
      conversationId = newConversation.id;
    }

    const newMessage = await chatRepository.createMessage(
      conversationId,
      "user",
      input.message
    );

    return {
      conversationId,
      message: newMessage.content,
    };
  } catch {
    throw new Error("Failed to send message");
  }
};

const listConversations = async (
  userId: string
): Promise<ConversationSummaryDto[]> => {
  try {
    const conversations = await chatRepository.findManyByUserId(userId);
    return conversations.map((c) => ({
      id: c.id,
      userId: c.userId,
      createdAt: c.createdAt,
    }));
  } catch {
    throw new Error("Failed to list conversations");
  }
};

const getConversation = async (
  id: string
): Promise<ConversationWithMessagesDto | null> => {
  try {
    const conversation = await chatRepository.findByIdWithMessages(id);
    if (!conversation) return null;
    return {
      id: conversation.id,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        agentType: m.agentType,
        createdAt: m.createdAt,
      })),
    };
  } catch {
    throw new Error("Failed to get conversation");
  }
};

const deleteConversation = async (
  id: string
): Promise<DeletedConversationDto> => {
  try {
    const conversation = await chatRepository.deleteById(id);
    return {
      id: conversation.id,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
    };
  } catch {
    throw new Error("Failed to delete conversation");
  }
};

export const chatService = {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
};
