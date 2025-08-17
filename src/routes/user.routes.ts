import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id", authenticateToken, userController.getUserById);
router.get("/", authenticateToken, userController.getUsers);

export default router;