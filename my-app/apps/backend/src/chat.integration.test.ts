import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./app.js";

const mockSendMessage = vi.fn();
const mockListConversations = vi.fn();
const mockListConversationsWithMessages = vi.fn();
const mockGetConversation = vi.fn();
const mockDeleteConversation = vi.fn();

vi.mock("./services/chat.service.js", () => ({
  chatService: {
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
    listConversations: (...args: unknown[]) => mockListConversations(...args),
    listConversationsWithMessages: (...args: unknown[]) =>
      mockListConversationsWithMessages(...args),
    getConversation: (...args: unknown[]) => mockGetConversation(...args),
    deleteConversation: (...args: unknown[]) => mockDeleteConversation(...args),
  },
}));

describe("Chat API (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /health", () => {
    it("returns ok status", async () => {
      const res = await app.request("/health");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ status: "ok" });
    });
  });

  describe("POST /api/v1/chat/messages", () => {
    it("returns streaming response with X-Conversation-Id header", async () => {
      const mockStream = new ReadableStream({
        start(c) {
          c.enqueue(new TextEncoder().encode("Hello"));
          c.close();
        },
      });
      mockSendMessage.mockResolvedValue({
        response: new Response(mockStream, {
          headers: { "Content-Type": "text/plain" },
        }),
        conversationId: "conv-abc-123",
        agentType: "support",
      });

      const res = await app.request("/api/v1/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-1",
          message: "Hello",
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("X-Conversation-Id")).toBe("conv-abc-123");
      expect(res.headers.get("X-Agent-Type")).toBe("support");
      const text = await res.text();
      expect(text).toBe("Hello");
    });

    it("returns 500 on service error", async () => {
      mockSendMessage.mockRejectedValue(new Error("DB error"));

      const res = await app.request("/api/v1/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "u1", message: "Hi" }),
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: "Failed to send message" });
    });
  });

  describe("GET /api/v1/chat/conversations", () => {
    it("returns 400 when userId is missing", async () => {
      const res = await app.request("/api/v1/chat/conversations");

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: "userId is required" });
    });

    it("returns conversations when userId is provided", async () => {
      const convs = [
        { id: "c1", userId: "u1", createdAt: "2025-01-01T00:00:00Z" },
      ];
      mockListConversations.mockResolvedValue(convs);

      const res = await app.request(
        "/api/v1/chat/conversations?userId=u1",
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(convs);
      expect(mockListConversations).toHaveBeenCalledWith("u1");
    });
  });

  describe("GET /api/v1/chat/conversations/messages", () => {
    it("returns 400 when userId is missing", async () => {
      const res = await app.request("/api/v1/chat/conversations/messages");

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: "userId is required" });
    });

    it("returns conversations with messages", async () => {
      const convs = [
        {
          id: "c1",
          userId: "u1",
          createdAt: "2025-01-01T00:00:00Z",
          messages: [{ id: "m1", content: "Hi", role: "user" }],
        },
      ];
      mockListConversationsWithMessages.mockResolvedValue(convs);

      const res = await app.request(
        "/api/v1/chat/conversations/messages?userId=u1",
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(convs);
    });
  });

  describe("GET /api/v1/chat/conversations/:id", () => {
    it("returns 404 when conversation not found", async () => {
      mockGetConversation.mockResolvedValue(null);

      const res = await app.request("/api/v1/chat/conversations/nonexistent");

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({ error: "Conversation not found" });
    });

    it("returns conversation when found", async () => {
      const conv = {
        id: "c1",
        userId: "u1",
        createdAt: "2025-01-01T00:00:00Z",
        messages: [],
      };
      mockGetConversation.mockResolvedValue(conv);

      const res = await app.request("/api/v1/chat/conversations/c1");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(conv);
      expect(mockGetConversation).toHaveBeenCalledWith("c1");
    });
  });

  describe("DELETE /api/v1/chat/conversations/:id", () => {
    it("returns deleted conversation", async () => {
      const deleted = {
        id: "c1",
        userId: "u1",
        createdAt: "2025-01-01T00:00:00Z",
      };
      mockDeleteConversation.mockResolvedValue(deleted);

      const res = await app.request("/api/v1/chat/conversations/c1", {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(deleted);
      expect(mockDeleteConversation).toHaveBeenCalledWith("c1");
    });
  });
});
