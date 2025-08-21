import { prisma } from './prisma';
import { UnitOfWork } from '../repositories/implements/uow.repository';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { ShopService } from '../services/shop.service';
import { KycService } from '../services/kyc.service';
import { PermissionService } from '../services/permissions.service';

const unitOfWork = new UnitOfWork(prisma);
export const permissionService = new PermissionService();
export const userService = new UserService(unitOfWork);
export const productService = new ProductService(unitOfWork);
export const shopService = new ShopService(unitOfWork);
export const kycService = new KycService(unitOfWork);