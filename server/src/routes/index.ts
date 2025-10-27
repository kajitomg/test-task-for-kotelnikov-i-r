import { Router } from 'express';
import { v1 } from './v1/index.js';

const router = Router()

router.use('/api/v1', v1)

export { router }