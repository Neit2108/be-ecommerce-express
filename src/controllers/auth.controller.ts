import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.services';
import { ApiResponse } from '../types/common';
import { ValidationError } from '../errors/AppError';
import { asyncHandler } from '../middleware/errorHandler';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  PasswordResetInput,
  PasswordResetConfirmInput,
} from '../types/auth.types';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  passwordResetSchema,
  passwordResetConfirmSchema,
  refreshTokenSchema,
} from '../validators/auth.validators';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const userData: RegisterInput = value;
    const result = await authService.register(userData);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const loginData: LoginInput = value;
    const result = await authService.login(loginData);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    };

    res.json(response);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const { refreshToken } = value;
    const result = await authService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    };

    res.json(response);
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    await authService.logout(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.json(response);
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const user = await authService.getProfile(userId);

    if (!user) {
      throw new ValidationError('User not found');
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  });

  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const passwordData: ChangePasswordInput = value;
    await authService.changePassword(userId, passwordData);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.json(response);
  });

  requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = passwordResetSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const resetData: PasswordResetInput = value;
    const result = await authService.requestPasswordReset(resetData);

    const response: ApiResponse = {
      success: true,
      data: { token: result.token },
      message: 'Password reset token generated. In production, this would be sent via email.',
    };

    res.json(response);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = passwordResetConfirmSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details?.[0]?.message || 'Validation error');
    }

    const resetData: PasswordResetConfirmInput = value;
    await authService.resetPassword(resetData);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully',
    };

    res.json(response);
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    await authService.verifyEmail(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
    };

    res.json(response);
  });
}

export const authController = new AuthController();