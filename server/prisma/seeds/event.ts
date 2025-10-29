import { PrismaClient } from '../../src/generated/prisma/client';


async function seedEvents(prisma: PrismaClient){
  console.log('Seeding events...')
  
  const event1 = await prisma.event.upsert({
    where: { slug: 'event-1'},
    update: {},
    create: {
      slug: 'event-1',
      name: 'Event 1',
      total_seats: 5
    }
  })
  
  const event2 = await prisma.event.upsert({
    where: { slug: 'event-2'},
    update: {},
    create: {
      slug: 'event-2',
      name: 'Event 2',
      total_seats: 1
    },
  })
  
  console.log('Created events:', {
    event1: event1.name,
    event2: event2.name,
  })
}

export { seedEvents }