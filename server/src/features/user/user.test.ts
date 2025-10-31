import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { App } from '../../app.js';
import { prisma } from '../../database.js';
import { Event, User } from '../../generated/prisma/client.js';

describe('/api/v1/users/booking-top', () => {
  let setup: {
    app: ReturnType<typeof App>,
    users: User[],
    events: Event[],
  }
  
  beforeAll(async () => {
    const app = App()
    
    const users = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          id: `Test User ${i}`,
          name: `Test User ${i}`,
        }
      })
    ))
    
    const events = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      prisma.event.create({
        data: {
          slug: `test-user-event-${i}`,
          name: `Test User Event ${i}`,
          total_seats: 10
        }
      })
    ))
    
    for (let i = 0; i < users.length; i++) {  let eventsCount;
      
      if (i < 2) {
        eventsCount = 10;
      } else {
        eventsCount = 10 - i;
      }
      
      for (let j = 0; j < eventsCount; j++) {
        await request(app)
          .post('/api/v1/bookings/reserve')
          .send({
            user_id: users[i].id,
            event_id: events[j].id,
          })
      }
    }
    
    setup = { app, users, events }
  })
  
  afterAll(async () => {
    if (setup?.users?.length) {
      await prisma.booking.deleteMany({
        where: { user_id: { in: setup.users.map(u => u.id) } }
      })
    }
    if (setup?.users?.length) {
      await prisma.user.deleteMany({
        where: { id: { in: setup.users.map(u => u.id) } }
      })
    }
    if (setup?.events?.length) {
      await prisma.event.deleteMany({
        where: { slug: { in: setup.events.map(u => u.slug) } }
      })
    }
  })
  
  describe('Получение топа пользователей по количеству бронирований', () => {
    test('дано: 1 POST-запрос, ожидается: успешное(201) получение топа пользователей.', async () => {
      const { app,  } = setup
      
      const response = await request(app)
        .get('/api/v1/users/booking-top')
      
      expect(response.status).toBe(201)
      
      //@ts-ignore
      const actual = response.body.map(item => ({
        place: item.place,
        bookings: item.bookings
      }));
      expect(actual).toEqual([
          { place: 1, bookings: 10 },
          { place: 1, bookings: 10 },
          { place: 2, bookings: 8 },
          { place: 3, bookings: 7 },
          { place: 4, bookings: 6 },
          { place: 5, bookings: 5 },
          { place: 6, bookings: 4 },
          { place: 7, bookings: 3 },
          { place: 8, bookings: 2 },
          { place: 9, bookings: 1 }
        ]
      )
    })
  })
})