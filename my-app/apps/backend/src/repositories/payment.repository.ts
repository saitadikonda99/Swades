import { prisma } from "../db/db.js";
import { Payment } from "../generated/prisma/client.js";


const getLatestPayment = async (userId: string): Promise<Payment | null> => {
  return prisma.payment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const paymentRepository = {
  getLatestPayment,
};