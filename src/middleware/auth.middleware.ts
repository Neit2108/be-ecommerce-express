import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt.util';
import { prisma } from '../config/prisma';
import { ApiResponse } from '../types/common';
import { JwtPayload } from '../types/auth.types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        status: string;
      };
    }
  }
}

/**
 * Kiểm tra xác thực token
 * Nếu token hợp lệ, gán người dùng vào req.user
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Bắt buộc có token xác thực',
        code: 'TOKEN_REQUIRED',
      };
      res.status(401).json(response);
      return;
    }

    // Verify token
    let payload: JwtPayload;
    try {
      payload = JwtUtils.verifyAccessToken(token);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Token không hợp lệ hoặc đã hết hạn',
        code: 'INVALID_TOKEN',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user still exists and is not deleted
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user is active
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      const response: ApiResponse = {
        success: false,
        error: 'Tài khoản bị đình chỉ hoặc cấm',
        code: 'ACCOUNT_SUSPENDED',
      };
      res.status(403).json(response);
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      status: user.status,
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Xác thực không thành công',
      code: 'AUTH_FAILED',
    };
    res.status(500).json(response);
  }
};

/**
 * Kiem tra xác thực tùy chọn
 * Nếu có token, xác thực và gán người dùng vào req.user
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      next();
      return;
    }

    try {
      const payload = JwtUtils.verifyAccessToken(token);
      
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          deletedAt: null,
        },
      });

      if (user && user.status !== 'BANNED' && user.status !== 'SUSPENDED') {
        req.user = {
          id: user.id,
          email: user.email,
          status: user.status,
        };
      }
    } catch (error) {
      // Ignore token errors in optional auth
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Kiểm tra quyền truy cập dựa trên trạng thái người dùng
 */
export const requireStatus = (allowedStatuses: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Xác thực yêu cầu',
        code: 'AUTH_REQUIRED',
      };
      res.status(401).json(response);
      return;
    }

    if (!allowedStatuses.includes(req.user.status)) {
      const response: ApiResponse = {
        success: false,
        error: 'Quyền truy cập không đủ',
        code: 'INSUFFICIENT_PERMISSIONS',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

/**
 * Kiểm tra xem người dùng đã xác thực email chưa
 */
export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Xác thực yêu cầu',
        code: 'AUTH_REQUIRED',
      };
      res.status(401).json(response);
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: { emailVerified: true },
    });

    if (!user?.emailVerified) {
      const response: ApiResponse = {
        success: false,
        error: 'Cần xác thực email',
        code: 'EMAIL_NOT_VERIFIED',
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Kiểm tra xác thực không thành công',
      code: 'VERIFICATION_CHECK_FAILED',
    };
    res.status(500).json(response);
  }
};