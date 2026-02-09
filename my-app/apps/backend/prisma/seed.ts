/**
 * Seed the database with mock data.
 * This is a simple seed script to populate the database with some mock data.
 * It creates a user, a conversation, and some messages.
 */

import { prisma } from "../src/db/db";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "demo@user.com",
      name: "Demo User",
      orders: {
        create: [
          { status: "shipped", tracking: "TRACK123" },
          { status: "pending", tracking: "TRACK456" }
        ]
      },
      payments: {
        create: [
          { amount: 499, status: "paid" },
          { amount: 199, status: "refunded" }
        ]
      }
    }
  });

  await prisma.conversation.create({
    data: {
      userId: user.id,
      messages: {
        create: [
          { role: "user", content: "Hi" },
          { role: "agent", content: "Hello! How can I help you?", agentType: "support" }
        ]
      }
    }
  });

  console.log("Seeded DB with mock data");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());