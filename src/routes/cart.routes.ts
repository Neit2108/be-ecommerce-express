import { Router } from 'express';
import { combineMiddleware } from '../utils/middleware.util';
import {
  authenticateToken,
  requireStatus,
} from '../middleware/auth.middleware';
import { UserStatus } from '@prisma/client';
import { cartController } from '../controllers/cart.controller';

const router = Router();

router.get(
  '/user',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.getByUser
);
router.get('/session/:sessionId', cartController.getBySession);
router.post(
  '/:cartId/items',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.addItem
);
router.put(
  '/:cartId/items/:itemId',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.updateItemQuantity
);
router.delete(
  '/:cartId/items/:itemId',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.removeItem
);
router.delete(
  '/:cartId/clear',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.clearCart
);
router.post(
  '/transfer',
  combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])),
  cartController.transferCartToUser
);

export default router;
