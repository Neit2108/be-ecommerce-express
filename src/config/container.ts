import { prisma } from './prisma';
import { UnitOfWork } from '../repositories/implements/uow.repositories';
import { UserService } from '../services/user.services';

const unitOfWork = new UnitOfWork(prisma);
export const userService = new UserService(unitOfWork);