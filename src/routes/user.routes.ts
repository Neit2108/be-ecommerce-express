import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import {
  authenticateToken,
  requireRole,
  requireStatus,
} from '../middleware/auth.middleware';
import { combineMiddleware } from '../utils/middleware.util';
import { RoleType, UserStatus } from '@prisma/client';

const router = Router();

router.get('/:id', authenticateToken, userController.getUserById);
router.get(
  '/',
  combineMiddleware(
    authenticateToken,
    requireRole(RoleType.SYSTEM_ADMIN)
  ),
  userController.getUsers
);
router.put('/activate', authenticateToken, userController.activate);

export default router;
