import { UserActivity } from './../../node_modules/.prisma/client/index.d';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export class ActivityLogger {

    /**
     * Ghi vào bảng user activity.
     * @param userId - User id.
     * @param action - làm gì.
     * @param module - module ví dụ : xóa, thêm.
     * @param resourceId - id shop/product/order.
     * @param metadata - Thông tin bổ sung (optional).
     * @param req .
     */
  static async logActivity(
    userId: string,
    action: string,
    module: string,
    resourceId?: string,
    metadata?: any,
    req?: Request
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          action,
          module,
          resourceId: resourceId !== undefined ? resourceId : null,
          metadata: metadata !== undefined ? metadata : null,
          ipAddress: req?.ip ?? null,
          userAgent: req?.headers['user-agent'] ?? null,
        },
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * tự động ghi log khi thành công
   * @param action - .
   * @param module - .
   * @returns .
   */
  static logMiddleware = (action: string, module: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next();

      const originalSend = res.send;
      res.send = function (data) {
        if (res.statusCode < 400) {
          const resourceId = req.params.id || req.body?.id;
          setImmediate(() => {
            ActivityLogger.logActivity(
              req.user!.id,
              action,
              module,
              resourceId,
              {
                method: req.method,
                url: req.originalUrl,
                body: req.method !== 'GET' ? req.body : undefined,
              },
              req
            );
          });
        }
        return originalSend.call(this, data);
      };
      next();
    };
  };
}
