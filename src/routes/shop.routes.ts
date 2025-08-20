import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { shopController } from "../controllers/shop.controller";

const router = Router();

router.post("/", authenticateToken, shopController.createDraftShop);
router.put("/:shopId/bank-account", authenticateToken, shopController.updateBankAccount);
router.post("/:shopId/kyc", authenticateToken, shopController.submitKyc);
router.put("/:shopId/submit-approval", authenticateToken, shopController.submitForApproval);

export default router;