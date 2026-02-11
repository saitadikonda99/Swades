import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatService } from "./chat.service.js";

const mockCreateConversation = vi.fn();
const mockCreateMessage = vi.fn();
const mockFindByIdWithMessages = vi.fn();
const mockFindManyByUserId = vi.fn();
const mockFindManyByUserIdWithMessages = vi.fn();
const mockDeleteById = vi.fn();

vi.mock("../repositories/chat.repository.js", () => ({
  chatRepository: {
    createConversation: (...args: unknown[]) => mockCreateConversation(...args),
    createMessage: (...args: unknown[]) => mockCreateMessage(...args),
    findByIdWithMessages: (...args: unknown[]) => mockFindByIdWithMessages(...args),
    findManyByUserId: (...args: unknown[]) => mockFindManyByUserId(...args),
    findManyByUserIdWithMessages: (...args: unknown[]) =>
      mockFindManyByUserIdWithMessages(...args),
    deleteById: (...args: unknown[]) => mockDeleteById(...args),
  },
}));

vi.mock("../agents/router.agent.js", () => ({
  routeMessageAI: vi.fn(),
}));

const createMockStream = (text: string) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return stream.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        controller.enqueue(new TextDecoder().decode(chunk));
      },
    }),
  );
};

vi.mock("../agents/support.agent.js", () => ({
  supportAgent: vi.fn(() => ({
    textStream: createMockStream("Here is support help."),
  })),
}));

vi.mock("../agents/order.agent.js", () => ({
  orderAgent: vi.fn(() => ({
    textStream: createMockStream("Here is order help."),
  })),
}));

vi.mock("../agents/billing.agent.js", () => ({
  billingAgent: vi.fn(() => ({
    textStream: createMockStream("Here is billing help."),
  })),
}));

const { routeMessageAI } = await import("../agents/router.agent.js");

describe("chatService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(routeMessageAI).mockResolvedValue("support");
  });

  describe("sendMessage", () => {
    it("creates new conversation when conversationId is not provided", async () => {
      const newConv = { id: "conv-123", userId: "user-1" };
      mockCreateConversation.mockResolvedValue(newConv);
      mockFindByIdWithMessages.mockResolvedValue({
        id: "conv-123",
        messages: [],
      });

      const result = await chatService.sendMessage({
        userId: "user-1",
        message: "Hello",
      });

      expect(mockCreateConversation).toHaveBeenCalledWith("user-1");
      expect(mockCreateMessage).toHaveBeenCalledWith("conv-123", "user", "Hello");
      expect(result.conversationId).toBe("conv-123");
      expect(result.agentType).toBe("support");
    });

    it("uses existing conversationId when provided", async () => {
      mockFindByIdWithMessages.mockResolvedValue({
        id: "existing-123",
        messages: [],
      });

      const result = await chatService.sendMessage({
        userId: "user-1",
        conversationId: "existing-123",
        message: "Hello",
      });

      expect(mockCreateConversation).not.toHaveBeenCalled();
      expect(mockCreateMessage).toHaveBeenCalledWith("existing-123", "user", "Hello");
      expect(result.conversationId).toBe("existing-123");
    });

    it("delegates to order agent when router returns order", async () => {
      mockCreateConversation.mockResolvedValue({ id: "conv-1", userId: "u1" });
      mockFindByIdWithMessages.mockResolvedValue({ id: "conv-1", messages: [] });
      vi.mocked(routeMessageAI).mockResolvedValue("order");

      const result = await chatService.sendMessage({
        userId: "u1",
        message: "Where is my order?",
      });

      expect(result.agentType).toBe("order");
      const body = await result.response.text();
      expect(body).toContain("order help");
    });

    it("throws when conversationId cannot be resolved", async () => {
      mockCreateConversation.mockResolvedValue({ id: null, userId: "u1" });

      await expect(
        chatService.sendMessage({ userId: "u1", message: "Hi" }),
      ).rejects.toThrow("Failed to send message");
    });
  });

  describe("listConversations", () => {
    it("returns conversations for user", async () => {
      const convs = [
        { id: "c1", userId: "u1", createdAt: new Date() },
        { id: "c2", userId: "u1", createdAt: new Date() },
      ];
      mockFindManyByUserId.mockResolvedValue(convs);

      const result = await chatService.listConversations("u1");

      expect(mockFindManyByUserId).toHaveBeenCalledWith("u1");
      expect(result).toEqual(convs);
    });

    it("throws on repository error", async () => {
      mockFindManyByUserId.mockRejectedValue(new Error("DB error"));

      await expect(chatService.listConversations("u1")).rejects.toThrow(
        "Failed to list conversations",
      );
    });
  });

  describe("listConversationsWithMessages", () => {
    it("returns conversations with messages", async () => {
      const convs = [
        {
          id: "c1",
          userId: "u1",
          createdAt: new Date(),
          messages: [{ id: "m1", content: "Hi", role: "user" }],
        },
      ];
      mockFindManyByUserIdWithMessages.mockResolvedValue(convs);

      const result = await chatService.listConversationsWithMessages("u1");

      expect(mockFindManyByUserIdWithMessages).toHaveBeenCalledWith("u1");
      expect(result).toEqual(convs);
    });
  });

  describe("getConversation", () => {
    it("returns conversation when found", async () => {
      const conv = {
        id: "c1",
        userId: "u1",
        createdAt: new Date(),
        messages: [],
      };
      mockFindByIdWithMessages.mockResolvedValue(conv);

      const result = await chatService.getConversation("c1");

      expect(result).toEqual(conv);
    });

    it("returns null when not found", async () => {
      mockFindByIdWithMessages.mockResolvedValue(null);

      const result = await chatService.getConversation("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("deleteConversation", () => {
    it("deletes and returns conversation", async () => {
      const deleted = { id: "c1", userId: "u1", createdAt: new Date() };
      mockDeleteById.mockResolvedValue(deleted);

      const result = await chatService.deleteConversation("c1");

      expect(mockDeleteById).toHaveBeenCalledWith("c1");
      expect(result).toEqual(deleted);
    });
  });
});
