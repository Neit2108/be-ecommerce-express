import { Prisma, Shop } from "@prisma/client";

export interface IShopRepository {
  findById(id: string, include?: Prisma.ShopInclude): Promise<Shop | null>;
  findUnique(where: Prisma.ShopWhereUniqueInput, include?: Prisma.ShopInclude): Promise<Shop | null>;
  findFirst(where: Prisma.ShopWhereInput, include?: Prisma.ShopInclude): Promise<Shop | null>;
  findMany(args: Prisma.ShopFindManyArgs): Promise<Shop[]>;
  create(data: Prisma.ShopCreateInput): Promise<Shop>;
  update(where: Prisma.ShopWhereUniqueInput, data: Prisma.ShopUpdateInput): Promise<Shop>;
  updateMany(where: Prisma.ShopWhereInput, data: Prisma.ShopUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
  delete(where: Prisma.ShopWhereUniqueInput): Promise<Shop>;
  deleteMany(where: Prisma.ShopWhereInput): Promise<Prisma.BatchPayload>;
  count(where?: Prisma.ShopWhereInput): Promise<number>;
  
  groupBy<T extends Prisma.ShopGroupByArgs>(args: Prisma.SelectSubset<T, Prisma.ShopGroupByArgs>): Promise<Prisma.GetShopGroupByPayload<T>[]>;
  aggregate<T extends Prisma.ShopAggregateArgs>(args: Prisma.SelectSubset<T, Prisma.ShopAggregateArgs>): Promise<Prisma.GetShopAggregateType<T>>;

  // Business logic methods
  findByOwnerId(ownerId: string, include?: Prisma.ShopInclude): Promise<Shop | null>;
  existsByOwnerId(ownerId: string): Promise<boolean>;
  softDelete(id: string, deletedBy?: string): Promise<Shop>;
  restore(id: string): Promise<Shop>;
}
