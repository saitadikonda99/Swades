import { chatRepository } from "../repositories/chat.repository.js";

export async function getConversationHistory(conversationId: string) {
  const convo = await chatRepository.findByIdWithMessages(conversationId);
  return convo?.messages ?? [];
}