import { Router } from 'express';
import { healthCheckController } from './health-controller.js';

const router = Router()

router.get('/', healthCheckController)

export { router };
