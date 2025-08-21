import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { shopController } from "../controllers/shop.controller";

const router = Router();

router.post("/", authenticateToken, shopController.createDraftShop);
router.put("/:shopId/bank-account", authenticateToken, shopController.updateBankAccount);
router.post("/:shopId/kyc", authenticateToken, shopController.submitKyc);
router.put("/:shopId/submit-approval", authenticateToken, shopController.submitForApproval);
router.put("/:shopId/approval", authenticateToken, shopController.approval);
router.put("/:shopId/reject", authenticateToken, shopController.reject);

export default router;