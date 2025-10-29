import { PrismaClient } from '../src/generated/prisma/client';
import { seedEvents } from './seeds/event';

const prisma = new PrismaClient()

async function main() {
  await seedEvents(prisma)
}

main()
  .catch((e) => {
    console.error('Ошибка посева:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })