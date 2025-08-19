import {
  PrismaClient,
  Product,
  ProductStatus,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  Prisma,
} from '@prisma/client';
import {
  IProductRepository,
  ProductWithRelations,
} from '../interfaces/product.interface';
import {
  CreateProductOptionData,
  CreateProductOptionValueData,
  ProductFilters,
  ProductIncludes,
} from '../../types/product.types';

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        shop: true,
        images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        options: {
          where: { deletedAt: null },
          include: {
            values: {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        variants: { where: { deletedAt: null } },
        categories: { where: { deletedAt: null }, include: { category: true } },
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  async findMany(filters: ProductFilters): Promise<Product[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...whereFilters
    } = filters;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(whereFilters.status && { status: whereFilters.status }),
      ...(whereFilters.categoryId && {
        categories: {
          some: {
            categoryId: whereFilters.categoryId,
            deletedAt: null,
          },
        },
      }),
      ...(whereFilters.searchTerm && {
        name: {
          contains: whereFilters.searchTerm,
          mode: 'insensitive',
        },
      }),
    };

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
  }

  // Product Images Management (Aggregate methods)
  async addImages(
    productId: string,
    images: Prisma.ProductImageCreateManyInput[],
    createdBy: string
  ): Promise<void> {
    const imagesWithMeta = images.map((img) => ({
      ...img,
      productId,
      createdBy,
      updatedBy: createdBy,
    }));

    await this.prisma.productImage.createMany({
      data: imagesWithMeta,
    });
  }

  async removeImages(
    productId: string,
    imageIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.productImage.updateMany({
      where: {
        id: { in: imageIds },
        productId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Reset all images to not primary
      await tx.productImage.updateMany({
        where: {
          productId,
          deletedAt: null,
        },
        data: {
          isPrimary: false,
          updatedAt: new Date(),
        },
      });

      // Set the specified image as primary
      await tx.productImage.update({
        where: { id: imageId },
        data: {
          isPrimary: true,
          updatedAt: new Date(),
        },
      });
    });
  }

  // Product Options Management (Aggregate methods)
  async addOptions(
    productId: string,
    options: CreateProductOptionData[],
    createdBy: string
  ): Promise<void> {
    // await this.prisma.$transaction(async (tx) => {
      for (const option of options) {
        const createdOption = await this.prisma.productOption.create({
          data: {
            productId,
            name: option.name,
            createdBy,
            updatedBy: createdBy,
          },
        });

        if (option.values && option.values.length > 0) {
          await this.prisma.productOptionValue.createMany({
            data: option.values.map((value, index) => ({
              productOptionId: createdOption.id,
              value: value.value,
              sortOrder: value.sortOrder ?? index,
              createdBy,
              updatedBy: createdBy,
            })),
          });
        }
      }
    // });
  }

  async removeOptions(
    productId: string,
    optionIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Soft delete option values first
      await tx.productOptionValue.updateMany({
        where: {
          productOptionId: { in: optionIds },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy,
          updatedAt: new Date(),
        },
      });

      // Then soft delete options
      await tx.productOption.updateMany({
        where: {
          id: { in: optionIds },
          productId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy,
          updatedAt: new Date(),
        },
      });
    });
  }

  async addOptionValues(
    optionId: string,
    values: CreateProductOptionValueData[],
    createdBy: string
  ): Promise<void> {
    const valuesWithMeta = values.map((value, index) => ({
      productOptionId: optionId,
      value: value.value,
      sortOrder: value.sortOrder ?? index,
      createdBy,
      updatedBy: createdBy,
    }));

    await this.prisma.productOptionValue.createMany({
      data: valuesWithMeta,
    });
  }

  async removeOptionValues(
    optionId: string,
    valueIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.productOptionValue.updateMany({
      where: {
        id: { in: valueIds },
        productOptionId: optionId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Rating methods
  async updateAverageRating(
    id: string,
    rating: number,
    reviewCount: number
  ): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        averageRating: rating,
        reviewCount,
        updatedAt: new Date(),
      },
    });
  }

  // Count methods
  async count(filters?: ProductFilters): Promise<number> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.categoryId && {
        categories: {
          some: {
            categoryId: filters.categoryId,
            deletedAt: null,
          },
        },
      }),
      ...(filters?.searchTerm && {
        name: {
          contains: filters.searchTerm,
          mode: 'insensitive',
        },
      }),
    };

    return this.prisma.product.count({
      where,
    });
  }

  async countByShop(shopId: string): Promise<number> {
    return this.prisma.product.count({
      where: {
        shopId,
        deletedAt: null,
      },
    });
  }
}
