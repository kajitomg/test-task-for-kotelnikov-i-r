import { Router } from 'express';
import { UserBookingCountController } from './user-controller.js';

const router = Router()

router.get('/booking-top', UserBookingCountController)

export { router };

