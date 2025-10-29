import { adminService } from "../config/container";
import { asyncHandler } from "../middleware/errorHandler";
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from "../types/common";

export class AdminController {
  getDashboardStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await adminService.getSummaryStats();   
        const response: ApiResponse = {
            success: true,
            data: stats,
        };
        res.json(response);
    }
  );
}

export const adminController = new AdminController();