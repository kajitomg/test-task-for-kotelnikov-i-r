import { PrismaClient } from '../../src/generated/prisma/client';


async function seedUsers(prisma: PrismaClient){
  console.log('Seeding users...')
  
  const user = await prisma.user.upsert({
    where: { name: 'John' },
    update: {},
    create: {
      name: 'John',
    },
  })
  
  console.log('Created users:', {
    user: user.name,
  })
}

export { seedUsers }