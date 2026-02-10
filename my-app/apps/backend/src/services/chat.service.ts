import { routeMessageAI } from "../agents/router.agent.js";
import { chatRepository } from "../repositories/chat.repository.js";
import { billingAgent } from "../agents/billing.agent.js";
import { orderAgent } from "../agents/order.agent.js";
import { supportAgent } from "../agents/support.agent.js";

import type {
  ConversationSummaryDto,
  ConversationWithMessagesDto,
  DeletedConversationDto,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types.js";

const sendMessage = async (
  input: SendMessageRequest,
): Promise<SendMessageResponse> => {
  try {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const newConversation = await chatRepository.createConversation(
        input.userId,
      );
      conversationId = newConversation.id;
    }

    if (!conversationId) {
      throw new Error("Failed to resolve conversationId");
    }

    await chatRepository.createMessage(conversationId, "user", input.message);

    const conversation = await chatRepository.findByIdWithMessages(
      conversationId,
    );

    const history =
      conversation?.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) ?? [];

    const agentType = await routeMessageAI(input.message, history);

    const stream =
      agentType === "order"
        ? orderAgent({
            userId: input.userId,
            message: input.message,
            history,
          })
        : agentType === "billing"
          ? billingAgent({
              userId: input.userId,
              message: input.message,
              history,
            })
          : supportAgent({
              conversationId,
              message: input.message,
              history,
            });

    return { stream, conversationId, agentType };
  } catch {
    throw new Error("Failed to send message");
  }
};

const listConversations = async (
  userId: string,
): Promise<ConversationSummaryDto[]> => {
  try {
    const conversations = await chatRepository.findManyByUserId(userId);
    return conversations as ConversationSummaryDto[];
  } catch {
    throw new Error("Failed to list conversations");
  }
};

const listConversationsWithMessages = async (
  userId: string,
): Promise<ConversationWithMessagesDto[]> => {
  try {
    const conversations = await chatRepository.findManyByUserIdWithMessages(userId);
    return conversations as ConversationWithMessagesDto[];
  } catch {
    throw new Error("Failed to list conversations with messages");
  }
};

const getConversation = async (
  id: string,
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
  id: string,
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
  listConversationsWithMessages,
  getConversation,
  deleteConversation,
};
