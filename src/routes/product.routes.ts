// import { RoleType } from './../../node_modules/.prisma/client/index.d';
// import { Router } from 'express';
// import {
//   authenticateToken,
//   requireOwnership,
//   requirePermission,
//   requireRole,
//   requireStatus,
// } from '../middleware/auth.middleware';
// import { productController } from '../controllers/product.controller';
// import { combineMiddleware } from '../utils/middleware.util';
// import { shopService } from '../config/container';
// import { PermissionAction, PermissionModule } from '../constants/permissions';
// import { UserStatus } from '../constants/status';
// import { ActivityLogger } from '../services/logger.service';

// const router = Router();

// router.get('/:id', authenticateToken, productController.findById);
// router.post(
//   '/',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.CREATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.CREATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.createDraftProduct
// );
// router.put(
//   '/:id/categories',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.UPDATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.addCategoriesToProduct
// );
// router.post(
//   '/:id/options',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.UPDATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.addOptionsToProduct
// );
// router.post(
//   '/:id/variants',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.UPDATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.addVariantsToProduct
// );
// router.post(
//   '/:id/images',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.UPDATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.addImagesToProduct
// );
// router.put(
//   '/:id/status',
//   combineMiddleware(
//     authenticateToken,
//     requireStatus([UserStatus.ACTIVE]),
//     requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
//     requirePermission(PermissionModule.SHOP_MANAGEMENT, PermissionAction.UPDATE),
//   ),
//   ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
//   productController.updateProductStatus
// );

// export default router;

import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { productController } from "../controllers/product.controller";

const router = Router();

router.get("/:productId", authenticateToken, productController.findById);
router.post("/", authenticateToken, productController.createDraftProduct);
router.put("/:productId/categories", authenticateToken, productController.addCategoriesToProduct);
router.post("/:productId/options", authenticateToken, productController.addOptionsToProduct);
router.post("/:productId/variants", authenticateToken, productController.addVariantsToProduct);
router.post("/:productId/images", authenticateToken, productController.addImagesToProduct);
router.put("/:productId/status", authenticateToken, productController.updateProductStatus);

export default router;