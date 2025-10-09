import { Router } from "express";
import { combineMiddleware } from "../utils/middleware.util";
import { authenticateToken, requireStatus } from "../middleware/auth.middleware";
import { UserStatus } from "@prisma/client";
import { orderController } from "../controllers/order.controller";

const router = Router();

router.post('/', combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])), orderController.createOrder);
router.get('/:orderId', combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])), orderController.getOrderById);
router.get('/', combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])), orderController.getMyOrders);
router.put('/:orderId/status', combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])), orderController.updateOrderStatus);
router.post('/:orderId/cancel', combineMiddleware(authenticateToken, requireStatus([UserStatus.ACTIVE])), orderController.cancelOrder);

export default router;