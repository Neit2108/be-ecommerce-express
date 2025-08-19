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