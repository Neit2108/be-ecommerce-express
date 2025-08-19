import { User, Prisma ,UserStatus, Gender} from '@prisma/client';
import { IAuditable, IDeletable, PaginationParams } from './common';

// User without sensitive data
export interface UserResponse extends Omit<User, 'password'> {}

// User with full data (for internal use)
export interface UserEntity extends User, IAuditable, IDeletable {}

// Create user input
export interface CreateUserInput {
  email: string;
  password: string;
  identityCard?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  birthday?: Date;
  gender?: Gender;
  status: UserStatus;
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

// User search filters
export interface UserSearchFilters extends PaginationParams {
  search?: string;
  status?: UserStatus;
  gender?: Gender;
  ageFrom?: number ;
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

// User query options
export interface UserQueryOptions {
  includeDeleted?: boolean;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}