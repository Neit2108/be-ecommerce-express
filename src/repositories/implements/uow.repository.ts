import { PrismaClient, ProductCategory } from '@prisma/client';
import { IUnitOfWork } from '../interfaces/uow.interface'; 
import { IUserRepository } from '../interfaces/user.interface'; 
import { UserRepository } from './user.repository'; 
import { IShopRepository } from '../interfaces/shop.interface';
import { ShopRepository } from './shop.repository';
import { IProductRepository, IProductVariantRepository } from '../interfaces/product.interface';
import { ICategoryRepository, IProductCategoryRepository } from '../interfaces/category.interface';
import { ProductRepository } from './product.repository';
import { CategoryRepository, ProductCategoryRepository } from './category.repository';
import { ProductVariantRepository } from './productVariant.repository';

export class UnitOfWork implements IUnitOfWork {
  private isInTransaction = false;
  private _users: IUserRepository;
  private _shops: IShopRepository;
  private _products: IProductRepository;
  private _categories: ICategoryRepository;
  private _productVariants: IProductVariantRepository;
  private _productCategories: IProductCategoryRepository;

  constructor(private prisma: PrismaClient) {
    this._users = new UserRepository(this.prisma);
    this._shops = new ShopRepository(this.prisma);
    this._products = new ProductRepository(this.prisma);
    this._categories = new CategoryRepository(this.prisma);
    this._productVariants = new ProductVariantRepository(this.prisma);
    this._productCategories = new ProductCategoryRepository(this.prisma);
  }

  get users(): IUserRepository {
    return this._users;
  }

  get shops(): IShopRepository {
    return this._shops;
  }

  get products(): IProductRepository {
    return this._products;
  }

  get categories(): ICategoryRepository {
    return this._categories;
  }

  get productVariants(): IProductVariantRepository {
    return this._productVariants;
  }

  get productCategories(): IProductCategoryRepository {
    return this._productCategories;
  }

  async executeInTransaction<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    if(this.isInTransaction){
      return await operation(this);
    }
    return await this.prisma.$transaction(async (tx) => {
      const transactionalUow = new UnitOfWork(tx as PrismaClient);
      transactionalUow.isInTransaction = true;
      return await operation(transactionalUow);
    });
  }
}