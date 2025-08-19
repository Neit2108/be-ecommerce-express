import { ICategoryRepository, IProductCategoryRepository } from "./category.interface";
import { IProductRepository, IProductVariantRepository } from "./product.interface";
import { IShopRepository } from "./shop.interface";
import { IUserRepository } from "./user.interface";

export interface IUnitOfWork {
  users: IUserRepository;
  shops: IShopRepository;
  products: IProductRepository;
  productVariants: IProductVariantRepository;
  categories: ICategoryRepository;
  productCategories: IProductCategoryRepository;

  executeInTransaction<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T>; // saveChanges
}