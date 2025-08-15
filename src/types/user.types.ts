import { User, Prisma } from '@prisma/client';
import { IAuditable, IDeletable, UserStatus, Gender, PaginationParams } from './common';

// User without sensitive data
export interface UserResponse extends Omit<User, 'password'> {}

// User with full data (for internal use)
export interface UserEntity extends User, IAuditable, IDeletable {}

// Create user input
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  birthday?: Date;
  gender?: Gender;
  avatarUrl?: string;
  status?: UserStatus;
}

// Update user input
export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  birthday?: Date;
  gender?: Gender;
  avatarUrl?: string;
  status?: UserStatus;
}

// Update password input
export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// User search filters
export interface UserSearchFilters extends PaginationParams {
  search?: string;
  status?: UserStatus;
  gender?: Gender;
  ageFrom?: number;
  ageTo?: number;
  createdFrom?: Date;
  createdTo?: Date;
}

// User statistics
export interface UserStatistics {
  total: number;
  byStatus: Record<UserStatus, number>;
  byGender: Record<Gender, number>;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  createdThisYear: number;
  averageAge?: number;
}

// Login input
export interface LoginInput {
  email: string;
  password: string;
}

// User query options
export interface UserQueryOptions {
  includeDeleted?: boolean;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}