import { Router } from 'express';
import { bookingRouter } from '../../features/booking/index.js';
import { healthRouter } from '../../features/health/index.js';

const router = Router()

router.use('/health', healthRouter)
router.use('/bookings', bookingRouter)

export { router }