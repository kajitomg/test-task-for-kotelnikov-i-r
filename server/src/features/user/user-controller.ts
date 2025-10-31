import type { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../../database.js';
import { getTimeRange, Period } from '../../utils/get-time-range.js';
import { validateQuery } from '../../utils/validator.js';


const UserBookingCountQuerySchema = z.object({
  period: z.enum(Period).optional(),
  topLimit: z.number().optional()
}).strip();

const UserBookingCountController: RequestHandler = async (req, res, next) => {
  try {
    const { topLimit = 10, period = Period.week} = await validateQuery(UserBookingCountQuerySchema, req)
    
    const range = getTimeRange(period)
    const users = await prisma.user.findMany({
      where: {
        created_at: {
          gte: range.start,
          lte: range.end
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }},
      take: topLimit,
      include: {
        _count: {
          select: { bookings: true }
        }
      }}
    )
    
    let lastCount = -1;
    let lastPlace = 0;
    
    const result = users.map((user) => {
      if (user._count.bookings !== lastCount) {
        lastPlace = lastPlace + 1;
      }
      
      lastCount = user._count.bookings;
      
      return {
        user_id: user.id,
        place: lastPlace,
        bookings: user._count.bookings
      };
    });
    
    return res.status(201).send(result)
  } catch (e) {
    next(e)
  }
}

export { UserBookingCountController };
