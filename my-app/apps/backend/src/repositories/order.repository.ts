import { prisma } from "../db/db.js";
import { Order } from "../generated/prisma/client.js";


/** Get the latest order for a user. */
const getLatestOrder = async (userId: string): Promise<Order | null> => {
  return prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/** Get an order by tracking number. */
const getOrderByTracking = async (tracking: string): Promise<Order | null> => {
  return prisma.order.findFirst({
    where: { tracking: { equals: tracking } },
  });
};

export const orderRepository = {
  getLatestOrder,
  getOrderByTracking,
};