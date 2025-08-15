import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { PasswordUtils } from '../utils/password.utils';
import { JwtUtils } from '../utils/jwt.utils';
import { PrismaErrorHandler } from '../errors/PrismaErrorHandler';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  ChangePasswordInput,
  PasswordResetInput,
  PasswordResetConfirmInput,
} from '../types/auth.types';
import { UserStatus } from '../types/common';
import {
  EmailExistsError,
  PhoneExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  AccountSuspendedError,
  UnauthorizedError,
  InvalidTokenError,
  DatabaseError,
  ExternalServiceError,
} from '../errors/AppError';

export class AuthService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (existingUser) {
        throw new EmailExistsError();
      }

      // Check phone number uniqueness if provided
      if (data.phoneNumber) {
        const existingPhone = await this.prisma.user.findFirst({
          where: {
            phoneNumber: data.phoneNumber,
            deletedAt: null,
          },
        });

        if (existingPhone) {
          throw new PhoneExistsError();
        }
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(data.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || null,
          address: data.address || null,
          birthday: data.birthday || null,
          gender: data.gender || null,
          status: UserStatus.PENDING,
        },
      });

      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
        status: user.status,
      });

      const refreshToken = JwtUtils.generateRefreshToken(user.id);

      // Store refresh token in Redis with expiration
      const refreshTokenKey = `refresh_token:${user.id}`;
      try {
        await redis.set(refreshTokenKey, refreshToken, 7 * 24 * 60 * 60); // 7 days
      } catch (error) {
        throw new ExternalServiceError('Redis', 'Failed to store refresh token');
      }

      return {
        user: this.excludePassword(user),
        accessToken,
        refreshToken,
        expiresIn: JwtUtils.getTokenExpirationTime(),
      };
    } catch (error) {
      if (error instanceof EmailExistsError || error instanceof PhoneExistsError) {
        throw error;
      }
      
      // Handle Prisma errors
      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('User registration failed');
    }
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Check if user is active
      if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
        throw new AccountSuspendedError();
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.verify(data.password, user.password);

      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
        status: user.status,
      });

      const refreshToken = JwtUtils.generateRefreshToken(user.id);

      // Store refresh token in Redis
      const refreshTokenKey = `refresh_token:${user.id}`;
      try {
        await redis.set(refreshTokenKey, refreshToken, 7 * 24 * 60 * 60); // 7 days
      } catch (error) {
        throw new ExternalServiceError('Redis', 'Failed to store refresh token');
      }

      return {
        user: this.excludePassword(user),
        accessToken,
        refreshToken,
        expiresIn: JwtUtils.getTokenExpirationTime(),
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError || error instanceof AccountSuspendedError) {
        throw error;
      }

      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Login failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Verify refresh token
      const payload = JwtUtils.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in Redis
      const refreshTokenKey = `refresh_token:${payload.userId}`;
      let storedToken: string | null;
      
      try {
        storedToken = await redis.get(refreshTokenKey);
      } catch (error) {
        throw new ExternalServiceError('Redis', 'Failed to verify refresh token');
      }

      if (!storedToken || storedToken !== refreshToken) {
        throw new InvalidTokenError('Refresh token not found or invalid');
      }

      // Get user
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.userId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UserNotFoundError();
      }

      if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
        throw new AccountSuspendedError();
      }

      // Generate new access token
      const accessToken = JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
        status: user.status,
      });

      return {
        accessToken,
        expiresIn: JwtUtils.getTokenExpirationTime(),
      };
    } catch (error) {
      if (error instanceof InvalidTokenError || 
          error instanceof UserNotFoundError || 
          error instanceof AccountSuspendedError ||
          error instanceof ExternalServiceError) {
        throw error;
      }

      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Token refresh failed');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // Remove refresh token from Redis
      const refreshTokenKey = `refresh_token:${userId}`;
      await redis.del(refreshTokenKey);
    } catch (error) {
      throw new ExternalServiceError('Redis', 'Failed to logout user');
    }
  }

  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    try {
      // Get user
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UserNotFoundError();
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.verify(
        data.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await PasswordUtils.hash(data.newPassword);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Invalidate all refresh tokens for this user
      const refreshTokenKey = `refresh_token:${userId}`;
      try {
        await redis.del(refreshTokenKey);
      } catch (error) {
        // Don't fail password change if Redis fails
        console.error('Failed to invalidate refresh token:', error);
      }
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }

      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Password change failed');
    }
  }

  async requestPasswordReset(data: PasswordResetInput): Promise<{ token: string }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (!user) {
        // Security: Don't reveal whether email exists
        // But still return success to prevent email enumeration
        throw new UserNotFoundError('If the email exists, a reset link would be sent');
      }

      // Generate reset token
      const resetToken = JwtUtils.generatePasswordResetToken(user.id);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      return { token: resetToken };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }

      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Password reset request failed');
    }
  }

  async resetPassword(data: PasswordResetConfirmInput): Promise<void> {
    try {
      // Verify reset token
      const payload = JwtUtils.verifyPasswordResetToken(data.token);

      // Find user with valid reset token
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.userId,
          passwordResetToken: data.token,
          passwordResetExpires: {
            gt: new Date(),
          },
          deletedAt: null,
        },
      });

      if (!user) {
        throw new InvalidTokenError('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hash(data.newPassword);

      // Update password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      // Invalidate all refresh tokens
      const refreshTokenKey = `refresh_token:${user.id}`;
      try {
        await redis.del(refreshTokenKey);
      } catch (error) {
        console.error('Failed to invalidate refresh token:', error);
      }
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        throw error;
      }

      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Password reset failed');
    }
  }

  async verifyEmail(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
    } catch (error) {
      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Email verification failed');
    }
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
      });

      if (!user) {
        return null;
      }

      return this.excludePassword(user);
    } catch (error) {
      if ((error as any).code && (error as any).code.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }

      throw new DatabaseError('Profile fetch failed');
    }
  }
}

export const authService = new AuthService();