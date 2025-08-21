import { Shop, ShopStatus, Prisma, ApprovalStatus } from '@prisma/client';
import { ShopFilters, ShopIncludes, ShopWithRelations } from '../../types/shop.types';
import { Decimal } from '@prisma/client/runtime/library';

export interface IShopRepository {
  // Basic CRUD
  create(data: Prisma.ShopCreateInput): Promise<Shop>;
  findById(id: string, include?: ShopIncludes): Promise<ShopWithRelations | null>;
  findByOwnerId(ownerId: string): Promise<ShopWithRelations | null>;
  update(id: string, data: Prisma.ShopUpdateInput): Promise<Shop>;
  softDelete(id: string, deletedBy: string): Promise<void>;

  // Query methods
  findMany(filters: ShopFilters): Promise<Shop[]>;

  //approval
  updateApprovalStatus(
    shopId: string,
    status: ApprovalStatus,
    approvedBy?: string,
    reason?: string
  ): Promise<Shop>;
  approve(shopId: string, approvedBy: string): Promise<Shop>;
  reject(shopId: string, rejectedBy: string, reason: string): Promise<Shop>;

  updateCurrentKyc(shopId: string, kycId: string): Promise<Shop>;

  // status
  activate(shopId: string): Promise<Shop>;
  suspend(shopId: string): Promise<Shop>;
  close(shopId: string): Promise<Shop>;

  //verify
  verify(shopId: string, verifiedBy: string): Promise<Shop>;
  unverify(shopId: string): Promise<Shop>;

  // statistics
  updateRevenue(shopId: string, amount: Decimal): Promise<Shop>;
  incrementOrderCount(id: string): Promise<void>;
  updateRating(
    id: string,
    newRating: Decimal,
    reviewCount: number
  ): Promise<void>;
  updateStatistics(
    id: string,
    stats: {
      totalRevenue?: number;
      totalOrders?: number;
      rating?: number;
      reviewCount?: number;
    }
  ): Promise<Shop>;

  // Count methods
  count(filters?: ShopFilters): Promise<number>;
  countByStatus(status: ShopStatus): Promise<number>;
}
