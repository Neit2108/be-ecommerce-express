import { prisma } from './prisma';
import { UnitOfWork } from '../repositories/implements/uow.repository';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';

const unitOfWork = new UnitOfWork(prisma);
export const userService = new UserService(unitOfWork);
export const productService = new ProductService(unitOfWork);