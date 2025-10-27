import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient()

async function main() {
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })