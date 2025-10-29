import type { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../../database.js';
import { ApiError } from '../../exceptions/api-error.js';
import { executeWithRetry } from '../../utils/execute-with-retry.js';
import { validateBody } from '../../utils/validator.js';
import { findOneEventWithBookingCount } from '../event/event-model.js';
import { createBookingUserForEvent } from './booking-model.js';

const BookingReserveBodySchema = z.object({
  user_id: z.string(),
  event_id: z.number(),
}).strip();

const BookingReserveController: RequestHandler = async (req, res, next) => {
  try {
    const body = await validateBody(BookingReserveBodySchema, req)
    
    const booking = await executeWithRetry(async () => await prisma.$transaction(async (transaction) => {
      const event = await findOneEventWithBookingCount({event_id: body.event_id}, transaction)
      
      if (!event) {
        throw ApiError.NotFoundError(`Событие с id ${body.event_id} не найдено.`)
      }
      
      const currentBookings = event._count.bookings
      
      if (currentBookings >= event.total_seats) {
        throw ApiError.ConflictError(`Событие с id ${body.event_id} не доступно для бронирования. Все места забронированы.`)
      }
      
      return createBookingUserForEvent(body, transaction)
    }, { isolationLevel: 'Serializable', timeout: 5000 }),
      {
        maxRetries: 10,
        initialDelay: 10,
        maxDelay: 200,
        exponential: true,
        jitter: true,
        onRetry: (attempt, error, delay) => {
          console.warn(`Повтор ${attempt} после ${delay.toFixed(0)}мс: ${error.code}`)
        }
      })
    
    return res.status(201).send(booking)
  } catch (e) {
    next(e)
  }
}

export { BookingReserveController };
