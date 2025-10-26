import {
  PrismaClient,
  ProductVariant,
  ProductStatus,
  Prisma,
} from '@prisma/client';
import {
  IProductVariantRepository,
  ProductVariantWithRelations,
} from '../interfaces/product.interface';
import {
  BatchUpdateVariantData,
  VariantFilters,
  VariantIncludes,
  VariantOptionValueMapping,
} from '../../types/product.types';

export class ProductVariantRepository implements IProductVariantRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async batchUpdateStock(stockUpdates: { id: string; quantity: number; }[]): Promise<void> {
    const updatePromises = stockUpdates.map(({ id, quantity }) =>
      this.prisma.productVariant.update({
        where: { id },
        data: { stock: quantity, updatedAt: new Date() },
      })
    );
    await Promise.all(updatePromises);
  }

  async create(
    data: Prisma.ProductVariantCreateInput
  ): Promise<ProductVariant> {
    return this.prisma.productVariant.create({
      data,
    });
  }

  async findById(id: string): Promise<ProductVariantWithRelations | null> {
    return this.prisma.productVariant.findFirst({
      where: {
        id,
        deletedAt: null,
        // product là quan hệ 1-1 => lọc bằng relation filter ở đây
        product: { is: { deletedAt: null } },
      },
      include: {
        product: true, // 1-1: không đặt where ở đây
        images: {
          // images là 1-n => có thể where/orderBy trong include
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        optionValues: {
          // optionValues là 1-n => có thể where trong include
          where: {
            deletedAt: null,
            // cả hai đều 1-1 => lọc bằng relation filter tại đây
            productOption: { is: { deletedAt: null } },
            productOptionValue: { is: { deletedAt: null } },
          },
          include: {
            // 1-1: chỉ true/ select/include, KHÔNG where
            productOption: true,
            productOptionValue: true,
          },
        },
      },
    });
  }

  /**
   * 🔥 OPTIMIZED: Find with flexible includes parameter
   */
  async findByIdWithInclude(
    id: string,
    include?: VariantIncludes
  ): Promise<ProductVariantWithRelations | null> {
    return this.prisma.productVariant.findFirst({
      where: {
        id,
        deletedAt: null,
        product: { is: { deletedAt: null } },
      },
      include: include ?? {
        product: {
          include: {images: true},
        },
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        optionValues: {
          where: {
            deletedAt: null,
            productOption: { is: { deletedAt: null } },
            productOptionValue: { is: { deletedAt: null } },
          },
          include: {
            productOption: true,
            productOptionValue: true,
          },
        },
      },
    });
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    return this.prisma.productVariant.findFirst({
      where: {
        sku,
        deletedAt: null,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProductVariantUpdateInput
  ): Promise<ProductVariant> {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 🔥 OPTIMIZED: Batch load variants by IDs to prevent N+1 queries
   */
  async findByIds(
    ids: string[],
    include?: VariantIncludes
  ): Promise<ProductVariantWithRelations[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.prisma.productVariant.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        product: { is: { deletedAt: null } },
      },
      include: include ?? {
        product: true,
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        optionValues: {
          where: {
            deletedAt: null,
            productOption: { is: { deletedAt: null } },
            productOptionValue: { is: { deletedAt: null } },
          },
          include: {
            productOption: true,
            productOptionValue: true,
          },
        },
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.productVariant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Query methods
  async findMany(filters: VariantFilters): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...whereFilters
    } = filters;

    // Build where clause
    const where: Prisma.ProductVariantWhereInput = {
      deletedAt: null,
      ...(whereFilters.productId && { productId: whereFilters.productId }),
      ...(whereFilters.status && { status: whereFilters.status }),
      ...(whereFilters.searchTerm && {
        sku: {
          contains: whereFilters.searchTerm,
          mode: 'insensitive',
        },
      }),
      ...(whereFilters.priceRange && {
        price: {
          ...(whereFilters.priceRange.min && {
            gte: whereFilters.priceRange.min,
          }),
          ...(whereFilters.priceRange.max && {
            lte: whereFilters.priceRange.max,
          }),
        },
      }),
    };

    // Build orderBy
    const orderBy: Prisma.ProductVariantOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    return this.prisma.productVariant.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
  }

  // Variant Images Management
  async addImages(
    variantId: string,
    images: Prisma.ProductImageCreateManyInput[],
    createdBy: string
  ): Promise<void> {
    const imagesWithMeta = images.map((img) => ({
      ...img,
      variantId,
      createdBy,
      updatedBy: createdBy,
    }));

    await this.prisma.productImage.createMany({
      data: imagesWithMeta,
    });
  }

  async removeImages(
    variantId: string,
    imageIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.productImage.updateMany({
      where: {
        id: { in: imageIds },
        variantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Option Values Management
  async setOptionValues(
    variantId: string,
    optionValueMappings: VariantOptionValueMapping[],
    updatedBy: string
  ): Promise<void> {
    await this.prisma.productVariantOptionValue.updateMany({
      where: {
        productVariantId: variantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: updatedBy,
        updatedAt: new Date(),
      },
    });

    // Then add new option values
    if (optionValueMappings.length > 0) {
      const optionValuesData = optionValueMappings.map((mapping) => ({
        productVariantId: variantId,
        productOptionId: mapping.optionId,
        productOptionValueId: mapping.optionValueId,
        createdBy: updatedBy,
        updatedBy: updatedBy,
      }));

      await this.prisma.productVariantOptionValue.createMany({
        data: optionValuesData,
      });
    }
  }

  async removeOptionValues(
    variantId: string,
    optionIds: string[],
    deletedBy: string
  ): Promise<void> {
    await this.prisma.productVariantOptionValue.updateMany({
      where: {
        productVariantId: variantId,
        productOptionId: { in: optionIds },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Bulk operations
  async createMany(
    variants: Prisma.ProductVariantCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.productVariant.createMany({
      data: variants,
    });
  }

  async updateMany(updates: BatchUpdateVariantData[]): Promise<void> {
    // Execute updates in sequence to avoid conflicts
    for (const update of updates) {
      await this.prisma.productVariant.update({
        where: { id: update.id },
        data: {
          ...update.data,
          updatedAt: new Date(),
        },
      });
    }
  }

  // Count methods
  async count(filters?: VariantFilters): Promise<number> {
    const where: Prisma.ProductVariantWhereInput = {
      deletedAt: null,
      ...(filters?.productId && { productId: filters.productId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.searchTerm && {
        sku: {
          contains: filters.searchTerm,
          mode: 'insensitive',
        },
      }),
      ...(filters?.priceRange && {
        price: {
          ...(filters.priceRange.min && { gte: filters.priceRange.min }),
          ...(filters.priceRange.max && { lte: filters.priceRange.max }),
        },
      }),
    };

    return this.prisma.productVariant.count({
      where,
    });
  }
}
