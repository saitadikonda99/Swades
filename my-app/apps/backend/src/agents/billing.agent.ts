import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { paymentRepository } from "../repositories/payment.repository.js";

export function billingAgent({
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
You are a Billing Support Agent.
Handle payments, refunds, invoices.
Use tools to fetch payment data.
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
      getLatestPayment: tool({
        description: "Fetch user's latest payment",
        execute: async () => paymentRepository.getLatestPayment(userId),
      } as any),
    },
  });
}