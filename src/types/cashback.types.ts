import { CashbackStatus, Prisma } from '@prisma/client';

export interface CreateCashbackInput {
  userId: string;
  amount?: number; // Nếu không truyền sẽ tính từ percentage
  percentage: number;
  walletAddress: string;
  blockchainNetwork: string;
  eligibleAt?: Date;
  expiresAt?: Date;
  metadata?: any;
}

export interface UpdateCashbackStatusInput {
  status: CashbackStatus;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasFee?: number;
  failureReason?: string;
}

export interface CashbackSearchFilters {
  page?: number;
  limit?: number;
  status?: CashbackStatus;
  network?: string;
  where?: Prisma.CashbackWhereInput;
}

export interface ProcessCashbackResult {
  success: boolean;
  cashbackId: string;
  txHash?: string;
  message: string;
  error?: string;
}

export interface CashbackResponse {
  id: string;
  paymentId: string;
  userId: string;
  orderId: string;
  amount: number;
  percentage: number;
  currency: string;
  status: CashbackStatus;
  blockchainNetwork?: string | null;
  walletAddress: string;
  txHash?: string | null;
  blockNumber?: number | null;
  gasUsed?: string | null;
  gasFee?: number;
  eligibleAt?: Date | null;
  processedAt?: Date | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  expiresAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  lastRetryAt?: Date | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}