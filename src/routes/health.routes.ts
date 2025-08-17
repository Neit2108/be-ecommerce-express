import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { healthController } from '../controllers/health.controller';

const router = Router();
router.get('/', asyncHandler(healthController));
export default router;
