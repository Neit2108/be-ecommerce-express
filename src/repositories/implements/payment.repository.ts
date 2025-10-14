import { IPaymentRepository, PaymentIncludes } from '../interfaces/payment.interface';
import { Payment, PaymentStatus, PaymentMethod, Prisma, PrismaClient } from '@prisma/client';

export class PaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async findById(id: string, include?: PaymentIncludes): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { ...include },
    });
  }

  async findByOrderId(orderId: string, include?: PaymentIncludes): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { orderId },
      include: { ...include },
      orderBy: { createdAt: 'desc' }, // Lấy payment mới nhất
    });
  }

  async findByTransactionId(
    transactionId: string,
    include?: PaymentIncludes
  ): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { transactionId },
      include: { ...include },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    status?: PaymentStatus;
    method?: PaymentMethod;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
    where?: Prisma.PaymentWhereInput;
  }): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        ...options?.where,
        ...(options?.status && { status: options.status }),
        ...(options?.method && { method: options.method }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: {
      paidAt?: Date;
      failedAt?: Date;
      failureReason?: string;
      transactionId?: string;
      gatewayResponse?: any;
    }
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(additionalData?.paidAt && { paidAt: additionalData.paidAt }),
        ...(additionalData?.failedAt && { failedAt: additionalData.failedAt }),
        ...(additionalData?.failureReason && { 
          failureReason: additionalData.failureReason 
        }),
        ...(additionalData?.transactionId && { 
          transactionId: additionalData.transactionId 
        }),
        ...(additionalData?.gatewayResponse && { 
          gatewayResponse: additionalData.gatewayResponse 
        }),
      },
    });
  }

  async delete(id: string): Promise<Payment> {
    return this.prisma.payment.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.PaymentWhereInput): Promise<number> {
    return this.prisma.payment.count({ 
      ...(where && { where }) 
    });
  }

  async sumAmount(where?: Prisma.PaymentWhereInput): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      ...(where && { where }),
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  async findExpiredPendingPayments(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        expiredAt: {
          lt: new Date(), // expired
        },
      },
    });
  }
}