import { PrismaClient, Prisma, User } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { PasswordUtils } from '../utils/password.utils';
import { DateUtils } from '../utils/date.utils';
import {
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  UserResponse,
  UserSearchFilters,
  UserStatistics,
  UserQueryOptions,
} from '../types/user.types';
import {
  UserStatus,
  Gender,
  PaginatedResponse,
} from '../types/common';
import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
} from '../errors/AppError';

export class UserService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Remove sensitive data from user object
   */
  private excludeSensitiveData(user: User): UserResponse {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Build where clause for user queries
   */
  private buildWhereClause(
    filters?: Partial<UserSearchFilters>,
    includeDeleted: boolean = false
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    // Soft delete filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (!filters) return where;

    // Search filter
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Gender filter
    if (filters.gender) {
      where.gender = filters.gender;
    }

    // Age filter
    if (filters.ageFrom || filters.ageTo) {
      const now = DateUtils.now();
      
      if (filters.ageFrom) {
        const maxBirthday = DateUtils.subtractDays(now, filters.ageFrom * 365);
        where.birthday = { ...where.birthday, lte: maxBirthday };
      }

      if (filters.ageTo) {
        const minBirthday = DateUtils.subtractDays(now, (filters.ageTo + 1) * 365);
        where.birthday = { ...where.birthday, gte: minBirthday };
      }
    }

    // Date range filter
    if (filters.createdFrom || filters.createdTo) {
      if (filters.createdFrom) {
        where.createdAt = { ...where.createdAt, gte: filters.createdFrom };
      }
      if (filters.createdTo) {
        where.createdAt = { ...where.createdAt, lte: filters.createdTo };
      }
    }

    return where;
  }

  /**
   * Create a new user
   */
  async createUser(
    data: CreateUserInput,
    createdBy?: string
  ): Promise<UserResponse> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (existingUser) {
        throw new ConflictError('Email already exists');
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
          throw new ConflictError('Phone number already exists');
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
          avatarUrl: data.avatarUrl || null,
          status: data.status || UserStatus.ACTIVE,
          createdBy,
        },
      });

      return this.excludeSensitiveData(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create user', 500, 'USER_CREATION_FAILED');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(
    id: string,
    options?: UserQueryOptions
  ): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          ...(options?.includeDeleted ? {} : { deletedAt: null }),
        },
        select: options?.select,
        include: options?.include,
      });

      if (!user) {
        return null;
      }

      return this.excludeSensitiveData(user as User);
    } catch (error) {
      throw new AppError('Failed to get user', 500, 'USER_FETCH_FAILED');
    }
  }

  /**
   * Get user by email with password (for authentication)
   */
  async getUserByEmailWithPassword(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          deletedAt: null,
        },
      });
    } catch (error) {
      throw new AppError('Failed to get user', 500, 'USER_FETCH_FAILED');
    }
  }

  /**
   * Get user by email (public)
   */
  async getUserByEmail(email: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (!user) {
        return null;
      }

      return this.excludeSensitiveData(user);
    } catch (error) {
      throw new AppError('Failed to get user', 500, 'USER_FETCH_FAILED');
    }
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: UpdateUserInput,
    updatedBy?: string
  ): Promise<UserResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existingUser) {
        throw new NotFoundError('User');
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findFirst({
          where: {
            email: data.email.toLowerCase(),
            deletedAt: null,
            id: { not: id },
          },
        });

        if (emailExists) {
          throw new ConflictError('Email already exists');
        }
      }

      // Check phone number uniqueness if phone is being updated
      if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
        const phoneExists = await this.prisma.user.findFirst({
          where: {
            phoneNumber: data.phoneNumber,
            deletedAt: null,
            id: { not: id },
          },
        });

        if (phoneExists) {
          throw new ConflictError('Phone number already exists');
        }
      }

      // Prepare update data
      const updateData: Prisma.UserUpdateInput = {
        updatedBy,
      };

      if (data.email) updateData.email = data.email.toLowerCase();
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber || null;
      if (data.address !== undefined) updateData.address = data.address || null;
      if (data.birthday !== undefined) updateData.birthday = data.birthday || null;
      if (data.gender !== undefined) updateData.gender = data.gender || null;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
      if (data.status) updateData.status = data.status;

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      return this.excludeSensitiveData(updatedUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update user', 500, 'USER_UPDATE_FAILED');
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    id: string,
    data: UpdatePasswordInput,
    updatedBy?: string
  ): Promise<void> {
    try {
      // Get user with password
      const user = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundError('User');
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
        where: { id },
        data: {
          deletedAt: DateUtils.now(),
          deletedBy,
          status: UserStatus.INACTIVE,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete user', 500, 'USER_DELETE_FAILED');
    }
  }

  /**
   * Restore soft deleted user
   */
  async restoreUser(id: string, updatedBy?: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, deletedAt: { not: null } },
      });

      if (!user) {
        throw new NotFoundError('Deleted user');
      }

      const restoredUser = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          status: UserStatus.ACTIVE,
          updatedBy,
        },
      });

      return this.excludeSensitiveData(restoredUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to restore user', 500, 'USER_RESTORE_FAILED');
    }
  }

  /**
   * Permanently delete user
   */
  async permanentlyDeleteUser(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('User');
      }
      throw new AppError('Failed to permanently delete user', 500, 'USER_PERMANENT_DELETE_FAILED');
    }
  }

  /**
   * Get users with advanced filtering and pagination
   */
  async getUsers(filters?: UserSearchFilters): Promise<PaginatedResponse<UserResponse>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder || 'desc';

      const where = this.buildWhereClause(filters);

      // Get total count
      const total = await this.prisma.user.count({ where });

      // Get users
      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: users.map(user => this.excludeSensitiveData(user)),
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new AppError('Failed to get users', 500, 'USERS_FETCH_FAILED');
    }
  }

  /**
   * Search users
   */
  async searchUsers(
    searchTerm: string,
    filters?: Partial<UserSearchFilters>
  ): Promise<PaginatedResponse<UserResponse>> {
    const searchFilters: UserSearchFilters = {
      ...filters,
      search: searchTerm,
    };

    return this.getUsers(searchFilters);
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const now = DateUtils.now();
      const today = DateUtils.startOfDay(now);
      const thisWeek = DateUtils.startOfWeek(now);
      const thisMonth = DateUtils.startOfMonth(now);
      const thisYear = DateUtils.startOfYear(now);

      // Base query for non-deleted users
      const baseWhere = { deletedAt: null };

      // Get total count
      const total = await this.prisma.user.count({ where: baseWhere });

      // Get counts by status
      const statusCounts = await this.prisma.user.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
      });

      const byStatus = Object.values(UserStatus).reduce((acc, status) => {
        acc[status] = statusCounts.find(s => s.status === status)?._count.id || 0;
        return acc;
      }, {} as Record<UserStatus, number>);

      // Get counts by gender
      const genderCounts = await this.prisma.user.groupBy({
        by: ['gender'],
        where: { ...baseWhere, gender: { not: null } },
        _count: { id: true },
      });

      const byGender = Object.values(Gender).reduce((acc, gender) => {
        acc[gender] = genderCounts.find(g => g.gender === gender)?._count.id || 0;
        return acc;
      }, {} as Record<Gender, number>);

      // Get creation stats
      const [createdToday, createdThisWeek, createdThisMonth, createdThisYear] = await Promise.all([
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: today } } }),
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: thisWeek } } }),
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: thisMonth } } }),
        this.prisma.user.count({ where: { ...baseWhere, createdAt: { gte: thisYear } } }),
      ]);

      // Calculate average age
      const usersWithBirthday = await this.prisma.user.findMany({
        where: { ...baseWhere, birthday: { not: null } },
        select: { birthday: true },
      });

      let averageAge: number | undefined;
      if (usersWithBirthday.length > 0) {
        const totalAge = usersWithBirthday.reduce((sum, user) => {
          return sum + DateUtils.calculateAge(user.birthday!);
        }, 0);
        averageAge = Math.round(totalAge / usersWithBirthday.length);
      }

      return {
        total,
        byStatus,
        byGender,
        createdToday,
        createdThisWeek,
        createdThisMonth,
        createdThisYear,
        averageAge,
      };
    } catch (error) {
      throw new AppError('Failed to get user statistics', 500, 'STATS_FETCH_FAILED');
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<UserResponse | null> {
    try {
      const user = await this.getUserByEmailWithPassword(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await PasswordUtils.verify(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return this.excludeSensitiveData(user);
    } catch (error) {
      throw new AppError('Failed to verify password', 500, 'PASSWORD_VERIFICATION_FAILED');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const where: Prisma.UserWhereInput = {
        email: email.toLowerCase(),
        deletedAt: null,
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const user = await this.prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      throw new AppError('Failed to check email existence', 500, 'EMAIL_CHECK_FAILED');
    }
  }

  /**
   * Check if phone number exists
   */
  async phoneExists(phoneNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const where: Prisma.UserWhereInput = {
        phoneNumber,
        deletedAt: null,
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const user = await this.prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      throw new AppError('Failed to check phone existence', 500, 'PHONE_CHECK_FAILED');
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    id: string,
    status: UserStatus,
    updatedBy?: string
  ): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          status,
          updatedBy,
        },
      });

      return this.excludeSensitiveData(updatedUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update user status', 500, 'STATUS_UPDATE_FAILED');
    }
  }

  /**
   * Get users created by a specific user
   */
  async getUsersCreatedBy(
    createdById: string,
    filters?: Partial<UserSearchFilters>
  ): Promise<PaginatedResponse<UserResponse>> {
    const searchFilters: UserSearchFilters = {
      ...filters,
    };

    const where = this.buildWhereClause(searchFilters);
    where.createdBy = createdById;

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    try {
      const total = await this.prisma.user.count({ where });

      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: users.map(user => this.excludeSensitiveData(user)),
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new AppError('Failed to get users created by user', 500, 'CREATED_BY_FETCH_FAILED');
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(
    userIds: string[],
    status: UserStatus,
    updatedBy?: string
  ): Promise<number> {
    try {
      const result = await this.prisma.user.updateMany({
        where: {
          id: { in: userIds },
          deletedAt: null,
        },
        data: {
          status,
          updatedBy,
        },
      });

      return result.count;
    } catch (error) {
      throw new AppError('Failed to bulk update user status', 500, 'BULK_STATUS_UPDATE_FAILED');
    }
  }

  /**
   * Bulk soft delete users
   */
  async bulkDeleteUsers(userIds: string[], deletedBy?: string): Promise<number> {
    try {
      const result = await this.prisma.user.updateMany({
        where: {
          id: { in: userIds },
          deletedAt: null,
        },
        data: {
          deletedAt: DateUtils.now(),
          deletedBy,
          status: UserStatus.INACTIVE,
        },
      });

      return result.count;
    } catch (error) {
      throw new AppError('Failed to bulk delete users', 500, 'BULK_DELETE_FAILED');
    }
  }
}

export const userService = new UserService();