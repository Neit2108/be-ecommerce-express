import { ICartItemRepository, ICartRepository } from "./cart.interface";
import { ICategoryRepository, IProductCategoryRepository } from "./category.interface";
import { IKycDataRepository } from "./kyc.interface";
import { IKycDocumentRepository } from "./kycDoc.interface";
import { IRolePermissionRepository, IUserPermissionRepository } from "./permission.interface";
import { IProductRepository, IProductVariantRepository } from "./product.interface";
import { IRoleRepository, IUserRoleRepository } from "./role.interface";
import { IShopRepository } from "./shop.interface";
import { IUserRepository } from "./user.interface";

export interface IUnitOfWork {
  users: IUserRepository;
  shops: IShopRepository;
  products: IProductRepository;
  productVariants: IProductVariantRepository;
  categories: ICategoryRepository;
  productCategories: IProductCategoryRepository;
  kycDatas: IKycDataRepository;
  kycDocuments: IKycDocumentRepository;
  roles: IRoleRepository;
  userRoles: IUserRoleRepository;
  userPermissions: IUserPermissionRepository;
  rolePermissions: IRolePermissionRepository;
  cart: ICartRepository;
  cartItem: ICartItemRepository;

  executeInTransaction<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T>; // saveChanges
}