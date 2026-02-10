import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { orderRepository } from "../repositories/order.repository.js";

export function orderAgent({
  userId,
  message,
  history,
}: {
  userId: string;
  message: string;
  history: { role: "user" | "agent"; content: string }[];
}) {
  return streamText({
    model: openai("gpt-4o-mini"),
    system: `
You are an Order Support Agent.
Handle order status, tracking, cancellations.
Use tools when needed. Be concise and accurate.
`,
    messages: [
      ...history.map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ],
    tools: {
      getLatestOrder: tool({
        description: "Fetch the user's latest order",
        execute: async () => orderRepository.getLatestOrder(userId),
      } as any),
      getOrderByTracking: tool({
        description: "Fetch order by tracking id",
        execute: async ({ tracking }: { tracking: string }) =>
          orderRepository.getOrderByTracking(tracking),
      } as any),
    },
  });
}