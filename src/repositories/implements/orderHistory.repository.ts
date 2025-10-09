import { PrismaClient, Prisma, OrderStatusHistory } from "@prisma/client";
import { IOrderStatusHistoryRepository } from "../interfaces/order.interface";

export class OrderStatusHistoryRepository implements IOrderStatusHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.OrderStatusHistoryCreateInput): Promise<OrderStatusHistory> {
    return this.prisma.orderStatusHistory.create({
      data,
    });
  }

  async findByOrderId(orderId: string): Promise<OrderStatusHistory[]> {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: 'desc' },
    });
  }
}