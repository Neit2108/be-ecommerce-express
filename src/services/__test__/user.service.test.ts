import { UserService } from '../user.service';
import { IUnitOfWork } from '../../repositories/interfaces/uow.interface';
import { PasswordUtils } from '../../utils/password.util';
import { DateUtils } from '../../utils/date.util';
import { UserStatus, Gender } from '@prisma/client';
import {
  EmailExistsError,
  PhoneExistsError,
  UserNotFoundError,
} from '../../errors/AppError';
import { CreateUserInput, UpdateUserInput, UserSearchFilters } from '../../types/user.types';

// Mock dependencies
jest.mock('../../utils/password.utils');
jest.mock('../../utils/date.utils');

const createMockUserRepository = () => ({
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  count: jest.fn(),
  groupBy: jest.fn(),
});

const createMockUoW = () => ({
  users: createMockUserRepository(),
  executeInTransaction: jest.fn(),
});

