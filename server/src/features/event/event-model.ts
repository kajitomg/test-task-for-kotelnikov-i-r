import { prisma } from '../../database.js';
import { PrismaClient } from '../../generated/prisma/client.js';

type TransactionClient = Parameters<
  Parameters<PrismaClient['$transaction']>[0]
>[0]

type PrismaDatabase = PrismaClient | TransactionClient

export const findOneEventWithBookingCount = async (data: { event_id: number }, database: PrismaDatabase = prisma) => {
  return database.event.findUnique({
    where: { id: data.event_id },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  })
}