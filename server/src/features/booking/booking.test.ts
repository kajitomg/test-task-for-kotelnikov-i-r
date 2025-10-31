import { describe, expect, beforeAll, beforeEach, afterAll, test } from 'vitest';
import { App } from '../../app.js';
import request from 'supertest'
import { prisma } from '../../database.js';
import { Event, User } from '../../generated/prisma/client.js';

describe('/api/v1/booking/reserve', () => {
  let setup: {
    app: ReturnType<typeof App>,
    users: User[],
    eventManySeats: Event,
    eventOneSeat: Event
  }
  
  beforeAll(async () => {
    const app = App()
    
    const users = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          id: `Test Booking User ${i}`,
          name: `Test Booking User ${i}`,
        }
      })
    ))
    
    const eventManySeats = await prisma.event.create({
      data: {
        slug: 'test-event-many-seats',
        name: 'Test Event Many Seats',
        total_seats: 5
      }
    })
    
    const eventOneSeat = await prisma.event.create({
      data: {
        slug: 'test-event-one-seat',
        name: 'Test Event One Seat',
        total_seats: 1
      }
    })
    
    setup = { app, users, eventManySeats, eventOneSeat }
  })
  
  beforeEach(async () => {
    if (setup?.users?.length) {
      await prisma.booking.deleteMany({
        where: { user_id: { in: setup.users.map(u => u.id) } }
      })
    }
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
    if (setup?.eventManySeats) {
      await prisma.event.delete({
        where: { id: setup.eventManySeats.id }
      })
    }
    if (setup?.eventOneSeat) {
      await prisma.event.delete({
        where: { id: setup.eventOneSeat.id }
      })
    }
  })
  
  describe('Одновременное бронирование с достаточным количеством мест', () => {
    test('дано: 2 POST-запроса с разным user_id и одинаковым event_id, event содержит достаточное количество свободных мест, ожидается: успешное(201) создание 2 записей в booking.', async () => {
      const { app, users, eventManySeats } = setup
      
      const response1 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
        })
      
      expect(response1.status).toBe(201)
      expect(response1.body).toHaveProperty('id')
      expect(response1.body.user_id).toBe(users[0].id)
      expect(response1.body.event_id).toBe(eventManySeats.id)
      
      const response2 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[1].id,
          event_id: eventManySeats.id,
        })
      
      expect(response2.status).toBe(201)
      expect(response2.body).toHaveProperty('id')
      expect(response2.body.user_id).toBe(users[1].id)
      expect(response2.body.event_id).toBe(eventManySeats.id)
      
      const bookings = await prisma.booking.findMany({
        where: { event_id: eventManySeats.id }
      })
      
      expect(bookings).toHaveLength(2)
    })
  })
  
  describe('Одновременное бронирование с ограниченным количеством мест', () => {
    test('дано: 2 POST-запроса с разным user_id и одинаковым event_id, event содержит недостаточное количество свободных мест, ожидается: успешное(201) создание 1 записи в booking, неуспешное(400) создание 2 записи в booking.', async () => {
      const { app, users, eventOneSeat } = setup
      
      const response1 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventOneSeat.id,
        })
      
      expect(response1.status).toBe(201)
      expect(response1.body.user_id).toBe(users[0].id)
      
      const response2 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[1].id,
          event_id: eventOneSeat.id,
        })
      
      expect(response2.status).toBe(409)
      expect(response2.text).toContain('не доступно для бронирования')
      expect(response2.text).toContain('Все места забронированы')
      
      const bookings = await prisma.booking.findMany({
        where: { event_id: eventOneSeat.id }
      })
      
      expect(bookings).toHaveLength(1)
      expect(bookings[0].user_id).toBe(users[0].id)
    })
  })
  
  describe('Повторное бронирование одним и тем же пользователем', () => {
    test('дано: 2 POST-запроса с одинаковым user_id и одинаковым event_id, event содержит достаточное количество свободных мест, ожидается: успешное(201) создание 1 записи в booking, неуспешное(400) создание 2 записи в booking.', async () => {
      const { app, users, eventManySeats } = setup
      
      const response1 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
        })
      
      expect(response1.status).toBe(201)
      
      const response2 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
        })
      
      expect(response2.status).toBeGreaterThanOrEqual(400)
      
      const bookings = await prisma.booking.findMany({
        where: {
          user_id: users[0].id,
          event_id: eventManySeats.id,
        }
      })
      
      expect(bookings).toHaveLength(1)
    })
  })
  
  describe('Один и тот же пользователь бронирует разные мероприятия', () => {
    test('дано: 2 POST-запроса с одинаковым user_id и разным event_id, 2 event содержат достаточное количество свободных мест, ожидается: успешное(201) создание 2 записей в booking.', async () => {
      const { app, users, eventManySeats, eventOneSeat } = setup
      
      const response1 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
        })
      
      expect(response1.status).toBe(201)
      expect(response1.body.event_id).toBe(eventManySeats.id)
      
      const response2 = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventOneSeat.id,
        })
      
      expect(response2.status).toBe(201)
      expect(response2.body.event_id).toBe(eventOneSeat.id)
      
      const bookings = await prisma.booking.findMany({
        where: { user_id: users[0].id }
      })
      
      expect(bookings).toHaveLength(2)
      expect(bookings.map(b => b.event_id).sort()).toEqual([eventManySeats.id, eventOneSeat.id].sort())
    })
  })
  
  describe('Несуществующее событие', () => {
    test('дано: 1 POST-запрос с user_id и несуществующим event_id, ожидается: неуспешное(404) создание 1 записей в booking.', async () => {
      const { app, users } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: 999999,
        })
      
      expect(response.status).toBe(404)
      expect(response.text).toContain('Событие с id 999999 не найдено')
    })
  })
  
  describe('Неверный формат user_id', () => {
    test('дано: 1 POST-запрос с event_id и отсутствующим user_id, ожидается: неуспешное(400) создание 1 записей в booking.', async () => {
      const { app, eventManySeats } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          event_id: eventManySeats.id,
        })
      
      expect(response.status).toBe(400)
    })
    
    test('дано: 1 POST-запрос с user_id=null и event_id, ожидается: неуспешное(400) создание 1 записей в booking.', async () => {
      const { app, eventManySeats } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: null,
          event_id: eventManySeats.id,
        })
      
      expect(response.status).toBe(400)
    })
  })
  
  describe('Неверный формат event_id', () => {
    test('дано: 1 POST-запрос с user_id и event_id:string, ожидается: неуспешное(400) создание 1 записей в booking.', async () => {
      const { app, users } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: 'not-a-number',
        })
      
      expect(response.status).toBe(400)
    })
    
    test('дано: 1 POST-запрос с user_id и отсутствующим event_id, ожидается: неуспешное(400) создание 1 записей в booking.', async () => {
      const { app, users } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
        })
      
      expect(response.status).toBe(400)
    })
  })
  
  describe('Дополнительное поле в body', () => {
    test('дано: 1 POST-запрос с user_id, event_id и extra_field, ожидается: успешное(201) создание 1 записей в booking, очистка дополнительных полей.', async () => {
      const { app, users, eventManySeats } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
          extra_field: 'should be ignored',
        })
      
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).not.toHaveProperty('extra_field')
      expect(response.body).not.toHaveProperty('another_field')
      
      const booking = await prisma.booking.findUnique({
        where: { id: response.body.id }
      })
      
      expect(booking).toMatchObject({
        user_id: users[0].id,
        event_id: eventManySeats.id,
      })
    })
  })
  
  describe('Гонка состояний: одновременные заявки на последнее место', () => {
    test('дано: 2 POST-запроса с разным user_id и одинаковым event_id, event содержит недостаточное количество свободных мест, ожидается: успешное(201) создание 1 записи в booking, неуспешное(409) создание 2 записи в booking.', async () => {
      const { app, users, eventOneSeat } = setup
      
      const responses = await Promise.all([
        request(app)
          .post('/api/v1/bookings/reserve')
          .send({ user_id: users[0].id, event_id: eventOneSeat.id }),
        request(app)
          .post('/api/v1/bookings/reserve')
          .send({ user_id: users[1].id, event_id: eventOneSeat.id }),
      ])
      
      const successful = responses.filter(r => r.status === 201)
      const failed = responses.filter(r => r.status === 409)
      
      expect(successful).toHaveLength(1)
      expect(failed).toHaveLength(1)
      
      const bookings = await prisma.booking.findMany({
        where: { event_id: eventOneSeat.id }
      })
      
      expect(bookings).toHaveLength(1)
    })
  })
  
  describe('Структура ответа', () => {
    test('дано: 1 POST-запрос с user_id и event_id, ожидается: успешное(201) создание 1 записи в booking, ответ с id:number user_id:string event_id:number created_at:number', async () => {
      const { app, users, eventManySeats } = setup
      
      const response = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({
          user_id: users[0].id,
          event_id: eventManySeats.id,
        })
      
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('user_id', users[0].id)
      expect(response.body).toHaveProperty('event_id', eventManySeats.id)
      expect(response.body).toHaveProperty('created_at')
      
      expect(typeof response.body.id).toBe('number')
      expect(typeof response.body.user_id).toBe('string')
      expect(typeof response.body.event_id).toBe('number')
    })
  })
  
  describe('Заполнение всех мест event', () => {
    test('дано: 6 POST-запросов с разным user_id и одинаковым event_id, event содержит недостаточное количество свободных мест, ожидается: успешное(201) создание 5 записей в booking, неуспешное(409) создание extra записи в booking', async () => {
      const { app, eventManySeats, users } = setup
      
      const initUsers = JSON.parse(JSON.stringify(users)).splice(1, 5) as typeof users
      
      const responses = await Promise.all(
        initUsers.map((user) => {
            return request(app)
              .post('/api/v1/bookings/reserve')
              .send({ user_id: user.id, event_id: eventManySeats.id })
        })
      )
      
      responses.forEach(response => {
        expect(response.status).toBe(201)
      })
      
      const extraResponse = await request(app)
        .post('/api/v1/bookings/reserve')
        .send({ user_id: users[5].id, event_id: eventManySeats.id })

      expect(extraResponse.status).toBe(409)
      expect(extraResponse.text).toContain('Все места забронированы')
    })
  })
})