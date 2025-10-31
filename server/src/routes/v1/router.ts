import { Router } from 'express';
import { bookingRouter } from '../../features/booking/index.js';
import { healthRouter } from '../../features/health/index.js';
import { userRouter } from '../../features/user/index.js';

const router = Router()

router.use('/health', healthRouter)
router.use('/bookings', bookingRouter)
router.use('/users', userRouter)

export { router }