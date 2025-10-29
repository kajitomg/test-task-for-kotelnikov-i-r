import { Router } from 'express';
import { BookingReserveController } from './booking-controller.js';

const router = Router()

router.post('/reserve', BookingReserveController)

export { router };

