import { PrismaClient } from '../src/generated/prisma/client';
import { seedUsers } from './seeds/user';

const prisma = new PrismaClient()

async function main() {
  await seedUsers(prisma)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })