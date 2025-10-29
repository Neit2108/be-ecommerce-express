import { Router } from "express";
import { combineMiddleware } from "../utils/middleware.util";
import { authenticateToken, requireRole, requireStatus } from "../middleware/auth.middleware";
import { RoleType, UserStatus } from "@prisma/client";
import { adminController } from "../controllers/admin.controller";

const router = Router();

router.get("/summary",
    combineMiddleware(authenticateToken,
        requireStatus([UserStatus.ACTIVE]),
        requireRole(RoleType.SYSTEM_ADMIN)
    ),
    adminController.getDashboardStats
);

export default router;