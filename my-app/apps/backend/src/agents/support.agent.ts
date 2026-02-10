import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export function supportAgent({
  conversationId,
  message,
  history,
}: {
  conversationId: string;
  message: string;
  history: { role: "user" | "agent"; content: string }[];
}) {
  return streamText({
    model: openai("gpt-4o-mini"),
    system: `
You are a general customer support agent.
Answer FAQs and guide users clearly.
Use conversation history if helpful.
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
  });
}