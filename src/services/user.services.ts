// import { PrismaClient, Prisma, User, UserStatus, Gender } from '@prisma/client';
// import { prisma } from '../config/prisma';
// import { PasswordUtils } from '../utils/password.utils';
// import { DateUtils } from '../utils/date.utils';
// import { PrismaErrorHandler } from '../errors/PrismaErrorHandler';
// import {
//   CreateUserInput,
//   UpdateUserInput,
//   UserResponse,
//   UserSearchFilters,
//   UserStatistics,
//   UserQueryOptions,
// } from '../types/user.types';
// import { PaginatedResponse } from '../types/common';
// import {
//   EmailExistsError,
//   PhoneExistsError,
//   UserNotFoundError,
//   UnauthorizedError,
//   DatabaseError,
// } from '../errors/AppError';

// export class UserService {
//   private readonly prisma: PrismaClient;

//   constructor() {
//     this.prisma = prisma;
//   }

//   /**
//    * Remove sensitive data from user object
//    */
//   private excludeSensitiveData(user: User): UserResponse {
//     const { password, ...userWithoutPassword } = user;
//     return userWithoutPassword;
//   }

//   /**
//    * Build where clause for user queries
//    */
//   private buildWhereClause(
//     filters?: Partial<UserSearchFilters>,
//     includeDeleted: boolean = false
//   ): Prisma.UserWhereInput {
//     const where: Prisma.UserWhereInput = {};

//     // Soft delete filter
//     if (!includeDeleted) {
//       where.deletedAt = null;
//     }

//     if (!filters) return where;

//     // Search filter
//     if (filters.search) {
//       where.OR = [
//         { firstName: { contains: filters.search, mode: 'insensitive' } },
//         { lastName: { contains: filters.search, mode: 'insensitive' } },
//         { email: { contains: filters.search, mode: 'insensitive' } },
//         { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
//       ];
//     }

//     // Status filter
//     if (filters.status) {
//       where.status = filters.status;
//     }

//     // Gender filter
//     if (filters.gender) {
//       where.gender = filters.gender;
//     }

//     // Age filter
//     if (filters.ageFrom || filters.ageTo) {
//       const now = DateUtils.now();

//       const birthdayFilter: Prisma.DateTimeNullableFilter = {};

//       if (filters.ageFrom) {
//         // tuổi từ X ⇒ birthday ≤ now - X năm
//         const maxBirthday = DateUtils.subtractDays(now, filters.ageFrom * 365);
//         birthdayFilter.lte = maxBirthday;
//       }
//       if (filters.ageTo) {
//         // tuổi đến Y ⇒ birthday ≥ now - (Y+1) năm
//         const minBirthday = DateUtils.subtractDays(
//           now,
//           (filters.ageTo + 1) * 365
//         );
//         birthdayFilter.gte = minBirthday;
//       }

//       if (Object.keys(birthdayFilter).length > 0) {
//         where.birthday = birthdayFilter; // ✅ gán object thuần
//       }
//     }

//     // Date range filter
//     if (filters.createdFrom || filters.createdTo) {
//       const createdAtFilter: Prisma.DateTimeFilter = {};
//       if (filters.createdFrom) createdAtFilter.gte = filters.createdFrom;
//       if (filters.createdTo) createdAtFilter.lte = filters.createdTo;

//       if (Object.keys(createdAtFilter).length > 0) {
//         where.createdAt = createdAtFilter; // ✅ gán object thuần
//       }
//     }
//     return where;
//   }

//   /**
//    * Create a new user
//    */
//   async createUser(
//     data: CreateUserInput,
//     createdBy?: string
//   ): Promise<UserResponse> {
//     try {
//       // Check if email already exists
//       const existingUser = await this.prisma.user.findFirst({
//         where: {
//           email: data.email.toLowerCase(),
//           deletedAt: null,
//         },
//       });

//       if (existingUser) {
//         throw new EmailExistsError();
//       }

//       // Check phone number uniqueness if provided
//       if (data.phoneNumber) {
//         const existingPhone = await this.prisma.user.findFirst({
//           where: {
//             phoneNumber: data.phoneNumber,
//             deletedAt: null,
//           },
//         });

//         if (existingPhone) {
//           throw new PhoneExistsError();
//         }
//       }

//       // Hash password
//       const hashedPassword = await PasswordUtils.hash(data.password);

//       // Create user
//       const user = await this.prisma.user.create({
//         data: {
//           email: data.email.toLowerCase(),
//           password: hashedPassword,
//           firstName: data.firstName,
//           lastName: data.lastName,
//           phoneNumber: data.phoneNumber || null,
//           address: data.address || null,
//           birthday: data.birthday || null,
//           gender: data.gender || null,
//           avatarUrl: null,
//           status: data.status || UserStatus.ACTIVE,
//         },
//       });

//       return this.excludeSensitiveData(user);
//     } catch (error) {
//       if (
//         error instanceof EmailExistsError ||
//         error instanceof PhoneExistsError
//       ) {
//         throw error;
//       }

//       // Handle Prisma errors
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User creation failed');
//     }
//   }

//   /**
//    * Get user by ID
//    */
//   async getUserById(
//     id: string,
//     options?: UserQueryOptions
//   ): Promise<UserResponse | null> {
//     try {
//       const where: Prisma.UserWhereInput = options?.includeDeleted
//         ? { id }
//         : { id, deletedAt: null };

//       const args: Prisma.UserFindFirstArgs = { where };

//       // Tránh truyền cả select và include cùng lúc (Prisma không cho)
//       if (options?.select && options?.include) {
//         // tuỳ bạn: throw, hoặc ưu tiên select
//         // throw new Error("Provide either 'select' or 'include', not both.");
//         args.select = options.select;
//       } else if (options?.select) {
//         args.select = options.select; // gán hẳn, không để undefined
//       } else if (options?.include) {
//         args.include = options.include; // gán hẳn, không để undefined
//       }
//       // Nếu không có gì, đơn giản chỉ { where }

//       const user = await this.prisma.user.findFirst(args);

//       if (!user) return null;

//       // Nếu bạn có thể nhận về object đã không có password (do select),
//       // hãy dùng excludeSensitiveData dạng generic để không lỗi kiểu:
//       return this.excludeSensitiveData(user as any);
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User fetch failed');
//     }
//   }

//   /**
//    * Get user by email with password (for authentication)
//    */
//   async getUserByEmailWithPassword(email: string): Promise<User | null> {
//     try {
//       return await this.prisma.user.findFirst({
//         where: {
//           email: email.toLowerCase(),
//           deletedAt: null,
//         },
//       });
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User fetch failed');
//     }
//   }

//   /**
//    * Get user by email (public)
//    */
//   async getUserByEmail(email: string): Promise<UserResponse | null> {
//     try {
//       const user = await this.prisma.user.findFirst({
//         where: {
//           email: email.toLowerCase(),
//           deletedAt: null,
//         },
//       });

//       if (!user) {
//         return null;
//       }

//       return this.excludeSensitiveData(user);
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User fetch failed');
//     }
//   }

//   /**
//    * Update user
//    */
//   async updateUser(
//     id: string,
//     data: UpdateUserInput,
//     updatedBy?: string
//   ): Promise<UserResponse> {
//     try {
//       // Check if user exists
//       const existingUser = await this.prisma.user.findFirst({
//         where: { id, deletedAt: null },
//       });

//       if (!existingUser) {
//         throw new UserNotFoundError();
//       }

//       // Check email uniqueness if email is being updated
//       if (data.email && data.email !== existingUser.email) {
//         const emailExists = await this.prisma.user.findFirst({
//           where: {
//             email: data.email.toLowerCase(),
//             deletedAt: null,
//             id: { not: id },
//           },
//         });

//         if (emailExists) {
//           throw new EmailExistsError();
//         }
//       }

//       // Check phone number uniqueness if phone is being updated
//       if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
//         const phoneExists = await this.prisma.user.findFirst({
//           where: {
//             phoneNumber: data.phoneNumber,
//             deletedAt: null,
//             id: { not: id },
//           },
//         });

//         if (phoneExists) {
//           throw new PhoneExistsError();
//         }
//       }

//       // Prepare update data
//       const updateData: Prisma.UserUpdateInput = {
//         usersUpdated: updatedBy as any || null,
//       };

//       if (data.email) updateData.email = data.email.toLowerCase();
//       if (data.firstName) updateData.firstName = data.firstName;
//       if (data.lastName) updateData.lastName = data.lastName;
//       if (data.phoneNumber !== undefined)
//         updateData.phoneNumber = data.phoneNumber || null;
//       if (data.address !== undefined) updateData.address = data.address || null;
//       if (data.birthday !== undefined)
//         updateData.birthday = data.birthday || null;
//       if (data.gender !== undefined) updateData.gender = data.gender || null;
//       if (data.avatarUrl !== undefined)
//         updateData.avatarUrl = data.avatarUrl || null;
//       if (data.status) updateData.status = data.status;

//       // Update user
//       const updatedUser = await this.prisma.user.update({
//         where: { id },
//         data: updateData,
//       });

//       return this.excludeSensitiveData(updatedUser);
//     } catch (error) {
//       if (
//         error instanceof UserNotFoundError ||
//         error instanceof EmailExistsError ||
//         error instanceof PhoneExistsError
//       ) {
//         throw error;
//       }

//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User update failed');
//     }
//   }

//   /**
//    * Soft delete user
//    */
//   async deleteUser(id: string, deletedBy?: string): Promise<void> {
//     try {
//       const user = await this.prisma.user.findFirst({
//         where: { id, deletedAt: null },
//       });

//       if (!user) {
//         throw new UserNotFoundError();
//       }

//       await this.prisma.user.update({
//         where: { id },
//         data: {
//           deletedAt: DateUtils.now(),
//           deletedBy : deletedBy || null,
//           status: UserStatus.INACTIVE,
//         },
//       });
//     } catch (error) {
//       if (error instanceof UserNotFoundError) {
//         throw error;
//       }

//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User deletion failed');
//     }
//   }

//   /**
//    * Restore soft deleted user
//    */
//   async restoreUser(id: string, updatedBy?: string): Promise<UserResponse> {
//     try {
//       const user = await this.prisma.user.findFirst({
//         where: { id, deletedAt: { not: null } },
//       });

//       if (!user) {
//         throw new UserNotFoundError();
//       }

//       const restoredUser = await this.prisma.user.update({
//         where: { id },
//         data: {
//           deletedAt: null,
//           deletedBy: null,
//           status: UserStatus.ACTIVE,
//           updatedBy: updatedBy || null,
//         },
//       });

//       return this.excludeSensitiveData(restoredUser);
//     } catch (error) {
//       if (error instanceof UserNotFoundError) {
//         throw error;
//       }

//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User restoration failed');
//     }
//   }

//   /**
//    * Permanently delete user
//    */
//   async permanentlyDeleteUser(id: string): Promise<void> {
//     try {
//       await this.prisma.user.delete({
//         where: { id },
//       });
//     } catch (error) {
//       if (
//         error instanceof Prisma.PrismaClientKnownRequestError &&
//         error.code === 'P2025'
//       ) {
//         throw new UserNotFoundError();
//       }

//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('User permanent deletion failed');
//     }
//   }

//   /**
//    * Get users with advanced filtering and pagination
//    */
//   async getUsers(
//     filters?: UserSearchFilters
//   ): Promise<PaginatedResponse<UserResponse>> {
//     try {
//       const page = filters?.page || 1;
//       const limit = filters?.limit || 10;
//       const skip = (page - 1) * limit;
//       const sortBy = filters?.sortBy || 'createdAt';
//       const sortOrder = filters?.sortOrder || 'desc';

//       const where = this.buildWhereClause(filters);

//       // Get total count
//       const total = await this.prisma.user.count({ where });

//       // Get users
//       const users = await this.prisma.user.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { [sortBy]: sortOrder },
//       });

//       const totalPages = Math.ceil(total / limit);

//       return {
//         data: users.map((user) => this.excludeSensitiveData(user)),
//         pagination: {
//           total,
//           totalPages,
//           currentPage: page,
//           limit,
//           hasNext: page < totalPages,
//           hasPrev: page > 1,
//         },
//       };
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Users fetch failed');
//     }
//   }

//   /**
//    * Search users
//    */
//   async searchUsers(
//     searchTerm: string,
//     filters?: Partial<UserSearchFilters>
//   ): Promise<PaginatedResponse<UserResponse>> {
//     const searchFilters: UserSearchFilters = {
//       ...filters,
//       search: searchTerm,
//     };

//     return this.getUsers(searchFilters);
//   }

//   /**
//    * Get user statistics
//    */
//   async getUserStatistics(): Promise<UserStatistics> {
//     try {
//       const now = DateUtils.now();
//       const today = DateUtils.startOfDay(now);
//       const thisWeek = DateUtils.startOfWeek(now);
//       const thisMonth = DateUtils.startOfMonth(now);
//       const thisYear = DateUtils.startOfYear(now);

//       // Base query for non-deleted users
//       const baseWhere = { deletedAt: null };

//       // Get total count
//       const total = await this.prisma.user.count({ where: baseWhere });

//       // Get counts by status
//       const statusCounts = await this.prisma.user.groupBy({
//         by: ['status'],
//         where: baseWhere,
//         _count: { id: true },
//       });

//       const byStatus = Object.values(UserStatus).reduce(
//         (acc, status) => {
//           acc[status] =
//             statusCounts.find((s) => s.status === status)?._count.id || 0;
//           return acc;
//         },
//         {} as Record<UserStatus, number>
//       );

//       // Get counts by gender
//       const genderCounts = await this.prisma.user.groupBy({
//         by: ['gender'],
//         where: { ...baseWhere, gender: { not: null } },
//         _count: { id: true },
//       });

//       const byGender = Object.values(Gender).reduce(
//         (acc, gender) => {
//           acc[gender] =
//             genderCounts.find((g) => g.gender === gender)?._count.id || 0;
//           return acc;
//         },
//         {} as Record<Gender, number>
//       );

//       // Get creation stats
//       const [createdToday, createdThisWeek, createdThisMonth, createdThisYear] =
//         await Promise.all([
//           this.prisma.user.count({
//             where: { ...baseWhere, createdAt: { gte: today } },
//           }),
//           this.prisma.user.count({
//             where: { ...baseWhere, createdAt: { gte: thisWeek } },
//           }),
//           this.prisma.user.count({
//             where: { ...baseWhere, createdAt: { gte: thisMonth } },
//           }),
//           this.prisma.user.count({
//             where: { ...baseWhere, createdAt: { gte: thisYear } },
//           }),
//         ]);

//       // Calculate average age
//       const usersWithBirthday = await this.prisma.user.findMany({
//         where: { ...baseWhere, birthday: { not: null } },
//         select: { birthday: true },
//       });

//       let averageAge: number | undefined = 0;
//       if (usersWithBirthday.length > 0) {
//         const totalAge = usersWithBirthday.reduce((sum, user) => {
//           return sum + DateUtils.calculateAge(user.birthday!);
//         }, 0);
//         averageAge = Math.round(totalAge / usersWithBirthday.length);
//       }

//       return {
//         total,
//         byStatus,
//         byGender,
//         createdToday,
//         createdThisWeek,
//         createdThisMonth,
//         createdThisYear,
//         averageAge,
//       };
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Statistics fetch failed');
//     }
//   }

//   /**
//    * Check if email exists
//    */
//   async emailExists(email: string, excludeId?: string): Promise<boolean> {
//     try {
//       const where: Prisma.UserWhereInput = {
//         email: email.toLowerCase(),
//         deletedAt: null,
//       };

//       if (excludeId) {
//         where.id = { not: excludeId };
//       }

//       const user = await this.prisma.user.findFirst({ where });
//       return !!user;
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Email existence check failed');
//     }
//   }

//   /**
//    * Check if phone number exists
//    */
//   async phoneExists(phoneNumber: string, excludeId?: string): Promise<boolean> {
//     try {
//       const where: Prisma.UserWhereInput = {
//         phoneNumber,
//         deletedAt: null,
//       };

//       if (excludeId) {
//         where.id = { not: excludeId };
//       }

//       const user = await this.prisma.user.findFirst({ where });
//       return !!user;
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Phone existence check failed');
//     }
//   }

//   /**
//    * Update user status
//    */
//   async updateUserStatus(
//     id: string,
//     status: UserStatus,
//     updatedBy?: string
//   ): Promise<UserResponse> {
//     try {
//       const user = await this.prisma.user.findFirst({
//         where: { id, deletedAt: null },
//       });

//       if (!user) {
//         throw new UserNotFoundError();
//       }

//       const updatedUser = await this.prisma.user.update({
//         where: { id },
//         data: {
//           status,
//           updatedBy: updatedBy || null,
//         },
//       });

//       return this.excludeSensitiveData(updatedUser);
//     } catch (error) {
//       if (error instanceof UserNotFoundError) {
//         throw error;
//       }

//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Status update failed');
//     }
//   }

//   /**
//    * Get users created by a specific user
//    */
//   async getUsersCreatedBy(
//     createdById: string,
//     filters?: Partial<UserSearchFilters>
//   ): Promise<PaginatedResponse<UserResponse>> {
//     const searchFilters: UserSearchFilters = {
//       ...filters,
//     };

//     const where = this.buildWhereClause(searchFilters);
//     where.createdBy = createdById;

//     const page = filters?.page || 1;
//     const limit = filters?.limit || 10;
//     const skip = (page - 1) * limit;
//     const sortBy = filters?.sortBy || 'createdAt';
//     const sortOrder = filters?.sortOrder || 'desc';

//     try {
//       const total = await this.prisma.user.count({ where });

//       const users = await this.prisma.user.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { [sortBy]: sortOrder },
//       });

//       const totalPages = Math.ceil(total / limit);

//       return {
//         data: users.map((user) => this.excludeSensitiveData(user)),
//         pagination: {
//           total,
//           totalPages,
//           currentPage: page,
//           limit,
//           hasNext: page < totalPages,
//           hasPrev: page > 1,
//         },
//       };
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Created by fetch failed');
//     }
//   }

//   /**
//    * Bulk update user status
//    */
//   async bulkUpdateUserStatus(
//     userIds: string[],
//     status: UserStatus,
//     updatedBy?: string
//   ): Promise<number> {
//     try {
//       const result = await this.prisma.user.updateMany({
//         where: {
//           id: { in: userIds },
//           deletedAt: null,
//         },
//         data: {
//           status,
//           updatedBy: updatedBy || null,
//         },
//       });

//       return result.count;
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Bulk status update failed');
//     }
//   }

//   /**
//    * Bulk soft delete users
//    */
//   async bulkDeleteUsers(
//     userIds: string[],
//     deletedBy?: string
//   ): Promise<number> {
//     try {
//       const result = await this.prisma.user.updateMany({
//         where: {
//           id: { in: userIds },
//           deletedAt: null,
//         },
//         data: {
//           deletedAt: DateUtils.now(),
//           deletedBy: deletedBy || null,
//           status: UserStatus.INACTIVE,
//         },
//       });

//       return result.count;
//     } catch (error) {
//       if ((error as any).code && (error as any).code.startsWith('P')) {
//         throw PrismaErrorHandler.handle(error);
//       }

//       throw new DatabaseError('Bulk delete failed');
//     }
//   }
// }

// export const userService = new UserService();

import { UserStatus, Prisma, Gender } from '@prisma/client';
import { IUnitOfWork } from '../repositories/interfaces/uow.interfaces';
import { PasswordUtils } from '../utils/password.utils';
import { DateUtils } from '../utils/date.utils';
import {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  UserSearchFilters,
  UserStatistics,
  UserQueryOptions,
} from '../types/user.types';
import { PaginatedResponse } from '../types/common';
import {
  EmailExistsError,
  PhoneExistsError,
  UserNotFoundError,
} from '../errors/AppError';

export class UserService {
  constructor(private uow: IUnitOfWork) {}

  /**
   * Remove sensitive data from user object
   */
  private excludeSensitiveData(user: any): UserResponse {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Build where clause for user queries - BUSINESS LOGIC Ở SERVICE
   */
  private buildWhereClause(
    filters?: Partial<UserSearchFilters>,
    includeDeleted = false
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    // Soft delete
    if (!includeDeleted) where.deletedAt = null;

    if (!filters) return where;

    // --- Search ---
    const q = (filters.search ?? '').trim();
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q } }, // phone: không cần mode
      ];
    }

    // --- Status ---
    if (filters.status !== undefined) {
      if (
        Array.isArray(filters.status) &&
        (filters.status as any[]).length > 0
      ) {
        where.status = { in: filters.status as UserStatus[] };
      } else {
        where.status = filters.status as UserStatus;
      }
    }

    // --- Gender ---
    if (filters.gender !== undefined) {
      if (
        Array.isArray(filters.gender) &&
        (filters.gender as any[]).length > 0
      ) {
        where.gender = { in: filters.gender as Gender[] };
      } else {
        where.gender = filters.gender as Gender;
      }
    }

    // --- Age range (birthday from years) ---
    if (filters.ageFrom !== undefined || filters.ageTo !== undefined) {
      const now = DateUtils.now();

      // Validate now date first
      if (isNaN(now.getTime())) {
        console.error('DateUtils.now() returned invalid date');
        return where;
      }

      const birthday: Prisma.DateTimeNullableFilter = {};

      if (filters.ageFrom !== undefined) {
        // Validate ageFrom is valid number
        const ageFromNum = Number(filters.ageFrom);
        if (!isNaN(ageFromNum) && ageFromNum >= 0 && ageFromNum <= 150) {
          try {
            birthday.lte = DateUtils.subtractYears(now, ageFromNum);
          } catch (error) {
            console.error('Error creating maxBirthday:', error);
          }
        }
      }

      if (filters.ageTo !== undefined) {
        const ageToNum = Number(filters.ageTo);
        if (!isNaN(ageToNum) && ageToNum >= 0 && ageToNum <= 150) {
          try {
            birthday.gte = DateUtils.subtractYears(now, ageToNum + 1);
          } catch (error) {
            console.error('Error creating minBirthday:', error);
          }
        }
      }

      if (Object.keys(birthday).length > 0) where.birthday = birthday;
    }

    // --- CreatedAt range ---
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.createdFrom) {
      const from =
        filters.createdFrom instanceof Date
          ? filters.createdFrom
          : new Date(filters.createdFrom);
      if (!isNaN(from.getTime())) createdAt.gte = from;
    }
    if (filters.createdTo) {
      const to =
        filters.createdTo instanceof Date
          ? filters.createdTo
          : new Date(filters.createdTo);
      if (!isNaN(to.getTime())) createdAt.lte = to;
    }
    if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;

    return where;
  }

  /**
   * Create a new user
   */
  async createUser(
    data: CreateUserInput,
    createdBy?: string
  ): Promise<UserResponse> {
    return await this.uow.executeInTransaction(async (uow) => {
      // Business rule: Check email uniqueness
      const existingEmail = await uow.users.findFirst({
        email: data.email.toLowerCase(),
        deletedAt: null,
      });
      if (existingEmail) {
        throw new EmailExistsError();
      }

      // Business rule: Check phone uniqueness
      if (data.phoneNumber) {
        const existingPhone = await uow.users.findFirst({
          phoneNumber: data.phoneNumber,
          deletedAt: null,
        });
        if (existingPhone) {
          throw new PhoneExistsError();
        }
      }

      // Business logic: Hash password
      const hashedPassword = await PasswordUtils.hash(data.password);

      // Repository call với dữ liệu thuần
      const user = await uow.users.create({
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || null,
        address: data.address || null,
        birthday: data.birthday || null,
        gender: data.gender || null,
        avatarUrl: null,
        status: data.status || UserStatus.ACTIVE,
      });

      return this.excludeSensitiveData(user);
    });
  }

  /**
   * Get user by ID with options
   */
  async getUserById(
    id: string,
    options?: UserQueryOptions
  ): Promise<UserResponse | null> {
    // Business logic: xử lý options
    const where: Prisma.UserWhereInput = options?.includeDeleted
      ? { id }
      : { id, deletedAt: null };

    let user;
    if (options?.include) {
      user = await this.uow.users.findFirst(where, options.include);
    } else {
      user = await this.uow.users.findFirst(where);
    }

    return user ? this.excludeSensitiveData(user) : null;
  }

  /**
   * Update user with business validation
   */
  async updateUser(
    id: string,
    data: UpdateUserInput,
    updatedBy?: string
  ): Promise<UserResponse> {
    return await this.uow.executeInTransaction(async (uow) => {
      // Business rule: User must exist
      const existingUser = await uow.users.findFirst({ id, deletedAt: null });
      if (!existingUser) {
        throw new UserNotFoundError();
      }

      // Business rule: Email uniqueness
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await uow.users.findFirst({
          email: data.email.toLowerCase(),
          deletedAt: null,
          id: { not: id },
        });
        if (emailExists) {
          throw new EmailExistsError();
        }
      }

      // Business rule: Phone uniqueness
      if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
        const phoneExists = await uow.users.findFirst({
          phoneNumber: data.phoneNumber,
          deletedAt: null,
          id: { not: id },
        });
        if (phoneExists) {
          throw new PhoneExistsError();
        }
      }

      const updateData: Prisma.UserUpdateInput = {
        ...(updatedBy ? { updatedByUser: { connect: { id: updatedBy } } } : {}),
      };

      if (data.email) updateData.email = data.email.toLowerCase();
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.phoneNumber !== undefined)
        updateData.phoneNumber = data.phoneNumber || null;
      if (data.address !== undefined) updateData.address = data.address || null;
      if (data.birthday !== undefined)
        updateData.birthday = data.birthday || null;
      if (data.gender !== undefined) updateData.gender = data.gender || null;
      if (data.avatarUrl !== undefined)
        updateData.avatarUrl = data.avatarUrl || null;
      if (data.status) updateData.status = data.status;

      const updatedUser = await uow.users.update({ id }, updateData);
      return this.excludeSensitiveData(updatedUser);
    });
  }

  /**
   * Get users with pagination and filtering - TẤT CẢ LOGIC Ở SERVICE
   */
  async getUsers(
    filters?: UserSearchFilters
  ): Promise<PaginatedResponse<UserResponse>> {
    // Business logic: Default values và validation
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 10));
    const skip = (page - 1) * limit;
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    // Business logic: Build complex where clause
    const where = this.buildWhereClause(filters);

    // Repository calls với Prisma args thuần
    const [total, users] = await Promise.all([
      this.uow.users.count(where),
      this.uow.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    // Business logic: Calculate pagination
    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => this.excludeSensitiveData(user)),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: string, deletedBy?: string): Promise<void> {
    const user = await this.uow.users.findFirst({ id, deletedAt: null });
    if (!user) {
      throw new UserNotFoundError();
    }

    await this.uow.users.update(
      { id },
      {
        deletedAt: DateUtils.now(),
        ...(deletedBy ? { deletedByUser: { connect: { id: deletedBy } } } : {}),
        status: UserStatus.INACTIVE,
      }
    );
  }

  /**
   * Get user statistics - COMPLEX BUSINESS LOGIC
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const now = DateUtils.now();
    const today = DateUtils.startOfDay(now);
    const thisWeek = DateUtils.startOfWeek(now);
    const thisMonth = DateUtils.startOfMonth(now);
    const thisYear = DateUtils.startOfYear(now);

    const baseWhere = { deletedAt: null };

    const [
      total,
      statusCounts,
      genderCounts,
      createdToday,
      createdThisWeek,
      createdThisMonth,
      createdThisYear,
      usersWithBirthday,
    ] = await Promise.all([
      this.uow.users.count(baseWhere),

      this.uow.users.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
      }),

      this.uow.users.groupBy({
        by: ['gender'],
        where: { ...baseWhere, gender: { not: null } },
        _count: { id: true },
      }),

      this.uow.users.count({ ...baseWhere, createdAt: { gte: today } }),
      this.uow.users.count({ ...baseWhere, createdAt: { gte: thisWeek } }),
      this.uow.users.count({ ...baseWhere, createdAt: { gte: thisMonth } }),
      this.uow.users.count({ ...baseWhere, createdAt: { gte: thisYear } }),

      this.uow.users.findMany({
        where: { ...baseWhere, birthday: { not: null } },
        select: { birthday: true },
      }),
    ]);

    // Process status statistics - use proper type casting
    const byStatus = Object.values(UserStatus).reduce(
      (acc, status) => {
        const statusGroup = statusCounts.find(
          (s) => (s as any).status === status
        );
        acc[status] = (statusGroup as any)?._count?.id ?? 0;
        return acc;
      },
      {} as Record<UserStatus, number>
    );

    // Process gender statistics - use proper type casting
    const byGender = Object.values(Gender).reduce(
      (acc, gender) => {
        const genderGroup = genderCounts.find(
          (g) => (g as any).gender === gender
        );
        acc[gender] = (genderGroup as any)?._count?.id ?? 0;
        return acc;
      },
      {} as Record<Gender, number>
    );

    // Calculate average age with better logic
    let averageAge: number | undefined = 0;
    if (usersWithBirthday.length > 0) {
      const totalAge = usersWithBirthday.reduce((sum, user) => {
        if (!user.birthday) return sum;
        return sum + DateUtils.calculateAge(user.birthday);
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
  }

  /**
   * Bulk operations
   */
  async bulkUpdateUserStatus(
    userIds: string[],
    status: UserStatus,
    updatedBy?: string
  ): Promise<number> {
    const result = await this.uow.users.updateMany(
      { id: { in: userIds }, deletedAt: null },
      {
        status,
        ...(updatedBy ? { updatedByUser: { connect: { id: updatedBy } } } : {}),
      }
    );
    return result.count;
  }

  async bulkDeleteUsers(
    userIds: string[],
    deletedBy?: string
  ): Promise<number> {
    const result = await this.uow.users.updateMany(
      { id: { in: userIds }, deletedAt: null },
      {
        deletedAt: DateUtils.now(),
        ...(deletedBy ? { deletedByUser: { connect: { id: deletedBy } } } : {}),
        status: UserStatus.INACTIVE,
      }
    );
    return result.count;
  }
}
