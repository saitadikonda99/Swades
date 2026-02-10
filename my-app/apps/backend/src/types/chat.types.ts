/**
 * Chat API request/response types and DTOs.
 */

import { AgentType, MessageRole } from "../generated/prisma/client";

/** Request body for sending a message (new or existing conversation). */
export interface SendMessageRequest {
  conversationId?: string;
  userId: string;
  message: string;
}

/** Query params for listing conversations. */
export interface ListConversationsQuery {
  userId: string;
}

/** Message as returned in API (e.g. in conversation with messages). */
export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  agentType: string | null;
  createdAt: Date;
}

/** Conversation with messages (for get conversation response). */
export interface ConversationWithMessagesDto {
  id: string;
  userId: string;
  createdAt: Date;
  messages: MessageDto[];
}

/** Conversation summary (for list conversations response). */
export interface ConversationSummaryDto {
  id: string;
  userId: string;
  createdAt: Date;
}

/** Deleted conversation response. */
export interface DeletedConversationDto {
  id: string;
  userId: string;
  createdAt: Date;
}

/** Response after sending a message. */
export interface SendMessageResponse {
  conversationId: string;
  // The LLM streaming result returned by the agent.
  // This is intentionally typed as unknown to avoid coupling
  // DTO types to the AI SDK's concrete return type.
  stream: unknown;
  agentType?: AgentType | null;
}

/** Single message in history (role + content) for AI. */
export interface MessageHistoryItem {
  role: MessageRole;
  content: string;
}