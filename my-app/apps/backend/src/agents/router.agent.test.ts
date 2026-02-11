import { beforeEach, describe, expect, it, vi } from "vitest";
import { routeMessageAI } from "./router.agent.js";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-model"),
}));

const { generateText } = await import("ai");

describe("routeMessageAI", () => {
  beforeEach(() => {
    vi.mocked(generateText).mockReset();
  });

  it("returns 'order' when AI responds with order", async () => {
    vi.mocked(generateText).mockResolvedValue({ text: "order" } as never);

    const result = await routeMessageAI("Where is my order?", []);

    expect(result).toBe("order");
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: "Where is my order?" }),
        ]),
      }),
    );
  });

  it("returns 'billing' when AI responds with billing", async () => {
    vi.mocked(generateText).mockResolvedValue({ text: "billing" } as never);

    const result = await routeMessageAI("I want a refund", []);

    expect(result).toBe("billing");
  });

  it("returns 'support' when AI responds with support", async () => {
    vi.mocked(generateText).mockResolvedValue({ text: "support" } as never);

    const result = await routeMessageAI("How do I reset my password?", []);

    expect(result).toBe("support");
  });

  it("returns 'support' as default when intent is unclear", async () => {
    vi.mocked(generateText).mockResolvedValue({ text: "unknown" } as never);

    const result = await routeMessageAI("Hello", []);

    expect(result).toBe("support");
  });

  it("passes message history to generateText", async () => {
    vi.mocked(generateText).mockResolvedValue({ text: "order" } as never);

    await routeMessageAI("Follow up", [
      { role: "user", content: "Where is my order?" },
      { role: "agent", content: "Let me check." },
    ]);

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: "user", content: "Where is my order?" },
          { role: "assistant", content: "Let me check." },
          { role: "user", content: "Follow up" },
        ],
      }),
    );
  });
});
