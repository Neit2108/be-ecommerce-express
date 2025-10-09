import { PrismaClient, Prisma, OrderItem } from "@prisma/client";
import { IOrderItemRepository } from "../interfaces/order.interface";

export class OrderItemRepository implements IOrderItemRepository{
    constructor(private prisma: PrismaClient){}

    async create(data: Prisma.OrderItemCreateInput): Promise<OrderItem> {
    return this.prisma.orderItem.create({
      data,
    });
  }

  async createMany(data: Prisma.OrderItemCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.orderItem.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(id: string): Promise<OrderItem | null> {
    return this.prisma.orderItem.findUnique({
      where: { id },
    });
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
        productVariant: true,
      },
    });
  }

  async sumTotalByOrderId(orderId: string): Promise<number> {
    const result = await this.prisma.orderItem.aggregate({
      where: { orderId },
      _sum: {
        totalPrice: true,
      },
    });

    return result._sum.totalPrice?.toNumber() || 0;
  }

  async sumQuantityByOrderId(orderId: string): Promise<number> {
    const result = await this.prisma.orderItem.aggregate({
      where: { orderId },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  }
}