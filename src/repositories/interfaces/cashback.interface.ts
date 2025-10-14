import { Cashback, CashbackStatus, Prisma } from '@prisma/client';

export interface CashbackIncludes {
  payment?: boolean;
  user?: boolean;
  order?: boolean;
}

export interface ICashbackRepository {
  // Create
  create(data: Prisma.CashbackCreateInput): Promise<Cashback>;

  // Read
  findById(id: string, include?: CashbackIncludes): Promise<Cashback | null>;
  findByPaymentId(paymentId: string, include?: CashbackIncludes): Promise<Cashback | null>;
  findByTxHash(txHash: string, include?: CashbackIncludes): Promise<Cashback | null>;
  findByUserId(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      status?: CashbackStatus;
      orderBy?: Prisma.CashbackOrderByWithRelationInput;
    }
  ): Promise<Cashback[]>;
  findByWalletAddress(
    walletAddress: string,
    options?: {
      skip?: number;
      take?: number;
      status?: CashbackStatus;
    }
  ): Promise<Cashback[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    status?: CashbackStatus;
    network?: string;
    orderBy?: Prisma.CashbackOrderByWithRelationInput;
    where?: Prisma.CashbackWhereInput;
  }): Promise<Cashback[]>;

  // Update
  update(id: string, data: Prisma.CashbackUpdateInput): Promise<Cashback>;
  updateStatus(
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
  ): Promise<Cashback>;
  incrementRetryCount(id: string): Promise<Cashback>;

  // Delete
  delete(id: string): Promise<Cashback>;

  // Statistics
  count(where?: Prisma.CashbackWhereInput): Promise<number>;
  sumAmount(where?: Prisma.CashbackWhereInput): Promise<number>;

  // Pending cashbacks
  findPendingCashbacks(limit?: number): Promise<Cashback[]>;
  findFailedCashbacksForRetry(maxRetries?: number): Promise<Cashback[]>;
  findExpiredCashbacks(): Promise<Cashback[]>;
}