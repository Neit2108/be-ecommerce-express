import { Prisma, Product } from "@prisma/client";

export interface IProductRepository {
  findById(id: string, include?: Prisma.ProductInclude): Promise<Product | null>;
  findUnique(where: Prisma.ProductWhereUniqueInput, include?: Prisma.ProductInclude): Promise<Product | null>;
  findFirst(where: Prisma.ProductWhereInput, include?: Prisma.ProductInclude): Promise<Product | null>;
  findMany(args: Prisma.ProductFindManyArgs): Promise<Product[]>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(where: Prisma.ProductWhereUniqueInput, data: Prisma.ProductUpdateInput): Promise<Product>;
  updateMany(where: Prisma.ProductWhereInput, data: Prisma.ProductUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
  delete(where: Prisma.ProductWhereUniqueInput): Promise<Product>;
  deleteMany(where: Prisma.ProductWhereInput): Promise<Prisma.BatchPayload>;
  count(where?: Prisma.ProductWhereInput): Promise<number>;
  
  groupBy<T extends Prisma.ProductGroupByArgs>(args: Prisma.SelectSubset<T, Prisma.ProductGroupByArgs>): Promise<Prisma.GetProductGroupByPayload<T>[]>;
  aggregate<T extends Prisma.ProductAggregateArgs>(args: Prisma.SelectSubset<T, Prisma.ProductAggregateArgs>): Promise<Prisma.GetProductAggregateType<T>>;

  // Business logic methods
  findByShopId(shopId: string, args?: Omit<Prisma.ProductFindManyArgs, 'where'>): Promise<Product[]>;
  findByCategoryId(categoryId: string, args?: Omit<Prisma.ProductFindManyArgs, 'where'>): Promise<Product[]>;
  findBySku(sku: string, include?: Prisma.ProductInclude): Promise<Product | null>;
  search(query: string, args?: Omit<Prisma.ProductFindManyArgs, 'where'>): Promise<Product[]>;
  updateRating(id: string, averageRating: number, reviewCount: number, updatedBy?: string): Promise<Product>;
  softDelete(id: string, deletedBy?: string): Promise<Product>;
  restore(id: string): Promise<Product>;
  
  // Category associations
  addToCategory(productId: string, categoryId: string, createdBy?: string): Promise<void>;
  removeFromCategory(productId: string, categoryId: string, deletedBy?: string): Promise<void>;
}