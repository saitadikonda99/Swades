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
    return conversations as ConversationSummaryDto[];
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
    return conversation as ConversationWithMessagesDto;
  } catch {
    throw new Error("Failed to get conversation");
  }
};

const deleteConversation = async (
  id: string
): Promise<DeletedConversationDto> => {
  try {
    const conversation = await chatRepository.deleteById(id);
    return conversation as DeletedConversationDto;
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
