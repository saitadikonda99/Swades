import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { MessageHistoryItem } from "../types/chat.types.js";
import type { AgentType } from "../generated/prisma/client.js";

export async function routeMessageAI(
  message: string,
  history: MessageHistoryItem[],
): Promise<AgentType> {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `
You are a router agent in a customer support system.
Classify the user's intent into exactly one of:
- support
- order
- billing

Return ONLY one word: support OR order OR billing.
`,
    messages: [
      ...history.map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ],
  });

  const intent = text.trim().toLowerCase();

  if (intent.includes("order")) return "order";
  if (intent.includes("billing")) return "billing";
  return "support";
}
