import { Router } from 'express';
import {
  authenticateToken,
  requireOwnership,
  requirePermission,
  requireRole,
  requireStatus,
} from '../middleware/auth.middleware';
import { productController } from '../controllers/product.controller';
import { combineMiddleware } from '../utils/middleware.util';
import { shopService } from '../config/container';
import { PermissionAction, PermissionModule, RoleType } from '@prisma/client';
import { UserStatus } from '../constants/status';
import { ActivityLogger } from '../services/logger.service';

const router = Router();

router.get('/:id', authenticateToken, productController.findById);
router.post(
  '/',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.CREATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.CREATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.createDraftProduct
);
router.put(
  '/:id/categories',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.UPDATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.addCategoriesToProduct
);
router.post(
  '/:id/options',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.UPDATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.addOptionsToProduct
);
router.post(
  '/:id/variants',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.UPDATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.addVariantsToProduct
);
router.post(
  '/:id/images',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.UPDATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.addImagesToProduct
);
router.put(
  '/:id/status',
  combineMiddleware(
    authenticateToken,
    requireStatus([UserStatus.ACTIVE]),
    requireRole(RoleType.SYSTEM_ADMIN, RoleType.SELLER),
    requirePermission(PermissionModule.PRODUCT_MANAGEMENT, PermissionAction.UPDATE),
  ),
  ActivityLogger.logMiddleware(PermissionAction.UPDATE, PermissionModule.PRODUCT_MANAGEMENT),
  productController.updateProductStatus
);

export default router;
