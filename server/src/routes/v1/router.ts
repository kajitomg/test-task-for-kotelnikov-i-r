import { Router } from 'express';
import { healthRouter } from '../../features/health/index.js';

const router = Router()

router.use('/health', healthRouter)

export { router }