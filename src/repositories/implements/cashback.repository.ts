import { ICashbackRepository, CashbackIncludes } from '../interfaces/cashback.interface';
import { Cashback, CashbackStatus, Prisma, PrismaClient } from '@prisma/client';

export class CashbackRepository implements ICashbackRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.CashbackCreateInput): Promise<Cashback> {
    return this.prisma.cashback.create({ data });
  }

  async findById(id: string, include?: CashbackIncludes): Promise<Cashback | null> {
    return this.prisma.cashback.findUnique({
      where: { id },
      include: { ...include },
    });
  }

  async findByPaymentId(
    paymentId: string,
    include?: CashbackIncludes
  ): Promise<Cashback | null> {
    return this.prisma.cashback.findUnique({
      where: { paymentId },
      include: { ...include },
    });
  }

  async findByTxHash(
    txHash: string,
    include?: CashbackIncludes
  ): Promise<Cashback | null> {
    return this.prisma.cashback.findUnique({
      where: { txHash },
      include: { ...include },
    });
  }

  async findByUserId(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      status?: CashbackStatus;
      orderBy?: Prisma.CashbackOrderByWithRelationInput;
    }
  ): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        userId,
        ...(options?.status && { status: options.status }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async findByWalletAddress(
    walletAddress: string,
    options?: {
      skip?: number;
      take?: number;
      status?: CashbackStatus;
    }
  ): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        walletAddress,
        ...(options?.status && { status: options.status }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    status?: CashbackStatus;
    network?: string;
    orderBy?: Prisma.CashbackOrderByWithRelationInput;
    where?: Prisma.CashbackWhereInput;
  }): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        ...options?.where,
        ...(options?.status && { status: options.status }),
        ...(options?.network && { blockchainNetwork: options.network }),
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.CashbackUpdateInput): Promise<Cashback> {
    return this.prisma.cashback.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: CashbackStatus,
    additionalData?: {
      txHash?: string;
      blockNumber?: number;
      gasUsed?: string;
      gasFee?: number;
      processedAt?: Date;
      completedAt?: Date;
      failedAt?: Date;
      failureReason?: string;
    }
  ): Promise<Cashback> {
    return this.prisma.cashback.update({
      where: { id },
      data: {
        status,
        ...(additionalData?.txHash && { txHash: additionalData.txHash }),
        ...(additionalData?.blockNumber && { blockNumber: additionalData.blockNumber }),
        ...(additionalData?.gasUsed && { gasUsed: additionalData.gasUsed }),
        ...(additionalData?.gasFee !== undefined && { 
          gasFee: additionalData.gasFee 
        }),
        ...(additionalData?.processedAt && { 
          processedAt: additionalData.processedAt 
        }),
        ...(additionalData?.completedAt && { 
          completedAt: additionalData.completedAt 
        }),
        ...(additionalData?.failedAt && { failedAt: additionalData.failedAt }),
        ...(additionalData?.failureReason && { 
          failureReason: additionalData.failureReason 
        }),
      },
    });
  }

  async incrementRetryCount(id: string): Promise<Cashback> {
    return this.prisma.cashback.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Cashback> {
    return this.prisma.cashback.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.CashbackWhereInput): Promise<number> {
    return this.prisma.cashback.count({ 
      ...(where && { where }) 
    });
  }

  async sumAmount(where?: Prisma.CashbackWhereInput): Promise<number> {
    const result = await this.prisma.cashback.aggregate({
      ...(where && { where }),
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  async findPendingCashbacks(limit: number = 100): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        status: 'PENDING',
        eligibleAt: {
          lte: new Date(), // Đã đủ điều kiện
        },
      },
      take: limit,
      orderBy: { createdAt: 'asc' }, // FIFO
    });
  }

  async findFailedCashbacksForRetry(maxRetries: number = 3): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        status: 'FAILED',
        retryCount: {
          lt: maxRetries,
        },
      },
      orderBy: { lastRetryAt: 'asc' },
    });
  }

  async findExpiredCashbacks(): Promise<Cashback[]> {
    return this.prisma.cashback.findMany({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}