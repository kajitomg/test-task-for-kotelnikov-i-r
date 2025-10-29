import { prisma } from '../../database.js';
import { PrismaClient } from '../../generated/prisma/client.js';

type TransactionClient = Parameters<
  Parameters<PrismaClient['$transaction']>[0]
>[0]

type PrismaDatabase = PrismaClient | TransactionClient

export const createBookingUserForEvent = async (data: { user_id: string, event_id: number }, database: PrismaDatabase = prisma) => {
  return database.booking.create({ data });
}