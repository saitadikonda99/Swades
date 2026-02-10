import { streamText, tool, jsonSchema, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { orderRepository } from "../repositories/order.repository.js";

const emptyObjectSchema = jsonSchema<Record<string, never>>({
  type: "object",
  properties: {},
  additionalProperties: false,
});

const trackingSchema = jsonSchema<{ tracking: string }>({
  type: "object",
  properties: {
    tracking: {
      type: "string",
      description: "Order tracking ID",
    },
  },
  required: ["tracking"],
  additionalProperties: false,
});

export function orderAgent({
  conversationId,
  userId,
  message,
  history,
}: {
  conversationId: string;
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
        inputSchema: emptyObjectSchema,
        execute: async () => orderRepository.getLatestOrder(userId),
      }),
      getOrderByTracking: tool({
        description: "Fetch order by tracking id",
        inputSchema: trackingSchema,
        execute: async ({ tracking }) =>
          orderRepository.getOrderByTracking(tracking),
      }),
    },
    stopWhen: stepCountIs(5),
  });
}