import { PrismaClient, Category, Prisma, ProductCategory, Product } from '@prisma/client';
import {
  CategoryWithRelations,
  ICategoryRepository,
  IProductCategoryRepository,
} from '../interfaces/category.interface';
import { CategoryFilters, CategoryIncludes } from '../../types/category.types';
import { PaginationParams } from '../../types/common';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  async findById(
    id: string,
    include?: CategoryIncludes
  ): Promise<CategoryWithRelations | null> {
    return this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        parentCategory: include?.parentCategory
          ? {
              where: { deletedAt: null },
            }
          : false,
        childCategories: include?.childCategories
          ? {
              where: { deletedAt: null },
              orderBy: { name: 'asc' },
            }
          : false,
        products: include?.products
          ? {
              where: { deletedAt: null, product: { deletedAt: null } },
              include: {
                product: true,
              },
            }
          : false,
      },
    });
  }

  async findManyByIds(ids: string[]): Promise<CategoryWithRelations[]> {
    return this.prisma.category.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: {
        parentCategory: true,
        childCategories: true,
        products: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Hierarchy methods
  async findRootCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentCategoryId: null,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findChildCategories(parentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentCategoryId: parentId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category: Category | null = await this.prisma.category.findFirst({
        where: {
          id: currentId,
          deletedAt: null,
        },
      });

      if (!category) break;

      path.unshift(category); // Add to beginning of array
      currentId = category.parentCategoryId;
    }

    return path;
  }

  async findAllDescendants(categoryId: string): Promise<Category[]> {
    const descendants: Category[] = [];

    const getChildren = async (parentId: string): Promise<void> => {
      const children = await this.prisma.category.findMany({
        where: {
          parentCategoryId: parentId,
          deletedAt: null,
        },
      });

      for (const child of children) {
        descendants.push(child);
        await getChildren(child.id); // Recursive call
      }
    };

    await getChildren(categoryId);
    return descendants;
  }

  // Query methods
  async searchByName(name: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(includeHierarchy?: boolean): Promise<CategoryWithRelations[]> {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        parentCategory: includeHierarchy
          ? { where: { deletedAt: null } }
          : true, // luôn include, chỉ lọc khi cần
        childCategories: includeHierarchy
          ? { where: { deletedAt: null }, orderBy: { name: 'asc' } }
          : true, // luôn include
        products: true, // thêm products vào đây để đúng với type
      },
      orderBy: { name: 'asc' },
    });
  }

  // Validation methods
  async isParentCategory(
    categoryId: string,
    potentialParentId: string
  ): Promise<boolean> {
    // Check if potentialParentId is in the parent chain of categoryId
    const path = await this.findCategoryPath(categoryId);
    return path.some((category) => category.id === potentialParentId);
  }

  async hasProducts(categoryId: string): Promise<boolean> {
    const productCount = await this.prisma.productCategory.count({
      where: {
        categoryId,
        deletedAt: null,
        product: {
          deletedAt: null,
        },
      },
    });

    return productCount > 0;
  }

  // Count methods
  async count(filters?: CategoryFilters): Promise<number> {
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(filters?.searchTerm && {
        name: {
          contains: filters.searchTerm,
          mode: 'insensitive',
        },
      }),
      ...(filters?.parentId && {
        parentCategoryId: filters.parentId,
      }),
    };

    return this.prisma.category.count({
      where,
    });
  }

  async countChildren(parentId: string): Promise<number> {
    return this.prisma.category.count({
      where: {
        parentCategoryId: parentId,
        deletedAt: null,
      },
    });
  }

  // Query with filters and pagination
  async findMany(filters: CategoryFilters): Promise<Category[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      ...whereFilters
    } = filters;

    // Build where clause
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(whereFilters.searchTerm && {
        name: {
          contains: whereFilters.searchTerm,
          mode: 'insensitive',
        },
      }),
      ...(whereFilters.parentId && {
        parentCategoryId: whereFilters.parentId,
      }),
    };

    // Build orderBy
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    return this.prisma.category.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
  }
}

export class ProductCategoryRepository implements IProductCategoryRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create(data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory> {
    return this.prisma.productCategory.create({
      data,
    });
  }

  async findById(id: string): Promise<ProductCategory | null> {
    return this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.productCategory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  async findByProductId(productId: string): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany({
      where: {
        productId,
        deletedAt: null,
      },
    });
  }

  async findByCategoryId(categoryId: string): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany({
      where: {
        categoryId,
        deletedAt: null,
      },
    });
  }

  async findProductsInCategory(
    categoryId: string,
    pagination?: PaginationParams
  ): Promise<Product[]> {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where: {
        categories: {
          some: {
            categoryId,
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
      skip,
      take: limit,
    });
  }

  async addProductToCategories(
    productId: string,
    categoryIds: string[],
    createdBy: string
  ): Promise<void> {
    const data = categoryIds.map((categoryId) => ({
      productId,
      categoryId,
      createdBy,
    }));

    await this.prisma.productCategory.createMany({
      data,
      skipDuplicates: true, // Skip if already exists
    });
  }

  async removeProductFromCategories(
    productId: string,
    categoryIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.productCategory.updateMany({
      where: {
        productId,
        categoryId: { in: categoryIds },
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  async replaceProductCategories(productId: string, categoryIds: string[], updatedBy: string): Promise<void> {
    // First, delete existing categories for the product
    await this.prisma.productCategory.updateMany({
      where: {
        productId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: updatedBy,
        updatedAt: new Date(),
      },
    });

    // Then, add the new categories
    const data = categoryIds.map((categoryId) => ({
      productId,
      categoryId,
      createdBy: updatedBy,
    }));

    await this.prisma.productCategory.createMany({
      data,
      skipDuplicates: true, // Skip if already exists
    });
  }

  async isProductInCategory(productId: string, categoryId: string): Promise<boolean> {
    const count = await this.prisma.productCategory.count({
      where: {
        productId,
        categoryId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async countProductsInCategory(categoryId: string): Promise<number> {
    return this.prisma.productCategory.count({
      where: {
        categoryId,
        deletedAt: null,
        product: {
          deletedAt: null,
        },
      },
    });
  }

  async countCategoriesForProduct(productId: string): Promise<number> {
    return this.prisma.productCategory.count({
      where: {
        productId,
        deletedAt: null,
      },
    });
  }
}