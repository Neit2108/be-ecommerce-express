import { Category, Prisma } from "@prisma/client";

export interface ICategoryRepository {
  findById(id: string, include?: Prisma.CategoryInclude): Promise<Category | null>;
  findUnique(where: Prisma.CategoryWhereUniqueInput, include?: Prisma.CategoryInclude): Promise<Category | null>;
  findFirst(where: Prisma.CategoryWhereInput, include?: Prisma.CategoryInclude): Promise<Category | null>;
  findMany(args: Prisma.CategoryFindManyArgs): Promise<Category[]>;
  create(data: Prisma.CategoryCreateInput): Promise<Category>;
  update(where: Prisma.CategoryWhereUniqueInput, data: Prisma.CategoryUpdateInput): Promise<Category>;
  updateMany(where: Prisma.CategoryWhereInput, data: Prisma.CategoryUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
  delete(where: Prisma.CategoryWhereUniqueInput): Promise<Category>;
  deleteMany(where: Prisma.CategoryWhereInput): Promise<Prisma.BatchPayload>;
  count(where?: Prisma.CategoryWhereInput): Promise<number>;
  
  groupBy<T extends Prisma.CategoryGroupByArgs>(args: Prisma.SelectSubset<T, Prisma.CategoryGroupByArgs>): Promise<Prisma.GetCategoryGroupByPayload<T>[]>;
  aggregate<T extends Prisma.CategoryAggregateArgs>(args: Prisma.SelectSubset<T, Prisma.CategoryAggregateArgs>): Promise<Prisma.GetCategoryAggregateType<T>>;

  // Hierarchy methods
  findRootCategories(args?: Omit<Prisma.CategoryFindManyArgs, 'where'>): Promise<Category[]>;
  findByParentId(parentId: string, args?: Omit<Prisma.CategoryFindManyArgs, 'where'>): Promise<Category[]>;
  findAncestors(categoryId: string): Promise<Category[]>;
  findDescendants(categoryId: string): Promise<Category[]>;
  findSiblings(categoryId: string): Promise<Category[]>;
  getCategoryTree(parentId?: string): Promise<Category[]>;
  getCategoryPath(categoryId: string): Promise<string>;
  getCategoryLevel(categoryId: string): Promise<number>;
  
  // Validation methods
  hasCircularReference(categoryId: string, parentId: string): Promise<boolean>;
  canDelete(categoryId: string): Promise<{ canDelete: boolean; reason?: string }>;
  moveCategory(categoryId: string, newParentId?: string, updatedBy?: string): Promise<Category>;
  
  // Product association methods
  getProductCount(categoryId: string, includeSubcategories?: boolean): Promise<number>;
  softDelete(id: string, deletedBy?: string): Promise<Category>;
  restore(id: string): Promise<Category>;
}
