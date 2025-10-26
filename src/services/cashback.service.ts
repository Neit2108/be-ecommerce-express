import { CashbackStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import {
  CreateCashbackInput,
  CashbackResponse,
  CashbackSearchFilters,
  UpdateCashbackStatusInput,
  ProcessCashbackResult,
} from '../types/cashback.types';
import { PaginatedResponse } from '../types/common';
import { BlockchainService } from './blockchain.service';
import redis from '../config/redis';
import { CacheUtil } from '../utils/cache.util';

export class CashbackService {
  constructor(
    private uow: IUnitOfWork,
    private blockchainService: BlockchainService
  ) {}

  /**
   * Tạo cashback sau khi payment thành công
   * @param paymentId 
   * @param input 
   * @returns 
   */
  async createCashback(
    paymentId: string,
    input: CreateCashbackInput
  ): Promise<CashbackResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      // Kiểm tra payment tồn tại và đã PAID
      const payment = await uow.payments.findById(paymentId, { order: true });
      if (!payment) {
        throw new NotFoundError('Thanh toán không tồn tại');
      }

      if (payment.status !== 'PAID') {
        throw new ValidationError('Chỉ tạo cashback cho thanh toán đã hoàn thành');
      }

      // Kiểm tra đã có cashback chưa
      const existingCashback = await uow.cashbacks.findByPaymentId(paymentId);
      if (existingCashback) {
        throw new ValidationError('Payment này đã có cashback');
      }

      if (!payment.orderId) {
        throw new NotFoundError('Đơn hàng không tồn tại');
      }

      // Tính cashback amount
      const cashbackAmount = input.amount || this.calculateCashbackAmount(
        Number(payment.amount),
        input.percentage
      );

      // Tạo cashback
      const eligibleAt = input.eligibleAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau
      const expiresAt = input.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 ngày sau

      const cashback = await uow.cashbacks.create({
        payment: { connect: { id: paymentId } },
        user: { connect: { id: input.userId } },
        order: { connect: { id: payment.orderId } },
        amount: cashbackAmount,
        percentage: input.percentage,
        currency: payment.currency,
        walletAddress: input.walletAddress,
        blockchainNetwork: input.blockchainNetwork,
        status: CashbackStatus.PENDING,
        eligibleAt,
        expiresAt,
        metadata: input.metadata || null,
      });

      // Invalidate cache
      await this.invalidateCashbackCache(undefined, input.userId);

      return this.mapToCashbackResponse(cashback);
    });
  }

  /**
   * Lấy thông tin cashback theo ID
   * @param cashbackId 
   * @param userId - để check quyền
   * @returns 
   */
  async getCashbackById(
    cashbackId: string,
    userId?: string
  ): Promise<CashbackResponse> {
    // Kiểm tra cache trước
    const cacheKey = CacheUtil.cashbackById(cashbackId);
    const cachedCashback = await redis.get(cacheKey);
    if (cachedCashback) {
      return JSON.parse(cachedCashback);
    }

    const cashback = await this.uow.cashbacks.findById(cashbackId, {
      payment: true,
      user: true,
      order: true,
    });

    if (!cashback) {
      throw new NotFoundError('Cashback không tồn tại');
    }

    // Kiểm tra quyền
    if (userId && cashback.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xem cashback này');
    }

    const cashbackResponse = this.mapToCashbackResponse(cashback);

    // Lưu vào cache 1 giờ
    await redis.set(cacheKey, JSON.stringify(cashbackResponse), 3600);

    return cashbackResponse;
  }

  /**
   * Lấy danh sách cashback của user
   * @param userId 
   * @param options 
   * @returns 
   */
  async getUserCashbacks(
    userId: string,
    options?: CashbackSearchFilters
  ): Promise<PaginatedResponse<CashbackResponse>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;

    // Tạo cache key
    const cacheKey = CacheUtil.userCashbacks(userId, page, limit);

    // Kiểm tra cache
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const cashbacks = await this.uow.cashbacks.findByUserId(userId, {
      skip: (page - 1) * limit,
      take: limit,
      ...(options?.status && { status: options.status }),
    });

    const total = await this.uow.cashbacks.count({
      userId,
      ...(options?.status && { status: options.status }),
    });

    const result = {
      data: cashbacks.map(this.mapToCashbackResponse),
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasNext: (page + 1) * limit < total,
        hasPrev: page > 1,
      },
    };

    // Lưu vào cache 15 phút
    await redis.set(cacheKey, JSON.stringify(result), 900);

    return result;
  }

  /**
   * Xử lý gửi cashback lên blockchain
   * @param cashbackId 
   * @returns 
   */
  async processCashback(cashbackId: string): Promise<ProcessCashbackResult> {
    return this.uow.executeInTransaction(async (uow) => {
      const cashback = await uow.cashbacks.findById(cashbackId);
      if (!cashback) {
        throw new NotFoundError('Cashback không tồn tại');
      }

      // Kiểm tra điều kiện xử lý
      if (cashback.status !== CashbackStatus.PENDING) {
        throw new ValidationError(
          `Cashback ở trạng thái ${cashback.status}, không thể xử lý`
        );
      }

      if (cashback.eligibleAt && cashback.eligibleAt > new Date()) {
        throw new ValidationError('Cashback chưa đến thời gian xử lý');
      }

      if (cashback.expiresAt && cashback.expiresAt < new Date()) {
        throw new ValidationError('Cashback đã hết hạn');
      }

      try {
        // Cập nhật status sang PROCESSING
        await uow.cashbacks.updateStatus(cashbackId, CashbackStatus.PROCESSING, {
          processedAt: new Date(),
        });

        // Gửi transaction lên blockchain
        const txResult = await this.blockchainService.sendCashback({
          toAddress: cashback.walletAddress,
          amount: Number(cashback.amount),
          network: cashback.blockchainNetwork || 'ethereum',
        });

        // Cập nhật thành công
        await uow.cashbacks.updateStatus(cashbackId, CashbackStatus.COMPLETED, {
          txHash: txResult.txHash,
          blockNumber: txResult.blockNumber,
          gasUsed: txResult.gasUsed,
          gasFee: txResult.gasFee,
          completedAt: new Date(),
        });

        // Invalidate cache
        await this.invalidateCashbackCache(cashbackId, cashback.userId);

        return {
          success: true,
          cashbackId,
          txHash: txResult.txHash,
          message: 'Cashback đã được gửi thành công',
        };
      } catch (error: any) {
        // Xử lý lỗi
        await uow.cashbacks.updateStatus(cashbackId, CashbackStatus.FAILED, {
          failedAt: new Date(),
          failureReason: error.message,
        });

        await uow.cashbacks.incrementRetryCount(cashbackId);

        // Invalidate cache
        await this.invalidateCashbackCache(cashbackId, cashback.userId);

        return {
          success: false,
          cashbackId,
          message: `Gửi cashback thất bại: ${error.message}`,
          error: error.message,
        };
      }
    });
  }

  /**
   * Xử lý hàng loạt cashback đang pending
   * @param limit 
   * @returns 
   */
  async processPendingCashbacks(
    limit: number = 50
  ): Promise<ProcessCashbackResult[]> {
    const pendingCashbacks = await this.uow.cashbacks.findPendingCashbacks(
      limit
    );

    const results: ProcessCashbackResult[] = [];
    for (const cashback of pendingCashbacks) {
      try {
        const result = await this.processCashback(cashback.id);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          cashbackId: cashback.id,
          message: `Lỗi xử lý: ${error.message}`,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Retry các cashback failed
   * @param maxRetries 
   * @returns 
   */
  async retryFailedCashbacks(
    maxRetries: number = 3
  ): Promise<ProcessCashbackResult[]> {
    const failedCashbacks = await this.uow.cashbacks.findFailedCashbacksForRetry(
      maxRetries
    );

    const results: ProcessCashbackResult[] = [];
    for (const cashback of failedCashbacks) {
      try {
        // Reset status về PENDING để xử lý lại
        await this.uow.cashbacks.updateStatus(cashback.id, CashbackStatus.PENDING);
        const result = await this.processCashback(cashback.id);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          cashbackId: cashback.id,
          message: `Retry thất bại: ${error.message}`,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Hủy cashback đã hết hạn
   * @returns số lượng cashback đã hủy
   */
  async cancelExpiredCashbacks(): Promise<number> {
    const expiredCashbacks = await this.uow.cashbacks.findExpiredCashbacks();

    let cancelledCount = 0;
    for (const cashback of expiredCashbacks) {
      try {
        await this.uow.cashbacks.updateStatus(
          cashback.id,
          CashbackStatus.CANCELLED,
          {
            failedAt: new Date(),
            failureReason: 'Cashback đã hết hạn',
          }
        );

        // Invalidate cache
        await this.invalidateCashbackCache(cashback.id, cashback.userId);

        cancelledCount++;
      } catch (error) {
        console.error(
          `Failed to cancel expired cashback ${cashback.id}:`,
          error
        );
      }
    }

    return cancelledCount;
  }

  /**
   * Verify blockchain transaction
   * @param cashbackId 
   * @returns 
   */
  async verifyCashbackTransaction(cashbackId: string): Promise<boolean> {
    const cashback = await this.uow.cashbacks.findById(cashbackId);
    if (!cashback) {
      throw new NotFoundError('Cashback không tồn tại');
    }

    if (!cashback.txHash) {
      throw new ValidationError('Cashback chưa có transaction hash');
    }

    // Verify trên blockchain
    const isValid = await this.blockchainService.verifyTransaction(
      cashback.txHash,
      cashback.blockchainNetwork || 'ethereum'
    );

    return isValid;
  }

  /**
   * Thống kê cashback
   * @param filters 
   * @returns 
   */
  async getCashbackStatistics(filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: CashbackStatus;
  }) {
    // Tạo cache key từ filters
    const cacheKey = CacheUtil.cashbackStatistics();
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const where: any = {
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && {
        createdAt: { gte: filters.startDate },
      }),
      ...(filters?.endDate && {
        createdAt: { ...{ lte: filters.endDate } },
      }),
    };

    const [totalAmount, totalCount] = await Promise.all([
      this.uow.cashbacks.sumAmount(where),
      this.uow.cashbacks.count(where),
    ]);

    const completedAmount = await this.uow.cashbacks.sumAmount({
      ...where,
      status: CashbackStatus.COMPLETED,
    });

    const stats = {
      totalAmount,
      totalCount,
      completedAmount,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
    };

    // Lưu vào cache 1 giờ
    await redis.set(cacheKey, JSON.stringify(stats), 3600);

    return stats;
  }

  //#region Private methods

  private calculateCashbackAmount(
    paymentAmount: number,
    percentage: number
  ): number {
    return (paymentAmount * percentage) / 100;
  }

  private mapToCashbackResponse(cashback: any): CashbackResponse {
    return {
      id: cashback.id,
      paymentId: cashback.paymentId,
      userId: cashback.userId,
      orderId: cashback.orderId,
      amount: Number(cashback.amount),
      percentage: Number(cashback.percentage),
      currency: cashback.currency,
      status: cashback.status,
      blockchainNetwork: cashback.blockchainNetwork,
      walletAddress: cashback.walletAddress,
      txHash: cashback.txHash,
      blockNumber: cashback.blockNumber,
      gasUsed: cashback.gasUsed,
      gasFee: cashback.gasFee ? Number(cashback.gasFee) : 0,
      eligibleAt: cashback.eligibleAt,
      processedAt: cashback.processedAt,
      completedAt: cashback.completedAt,
      failedAt: cashback.failedAt,
      expiresAt: cashback.expiresAt,
      failureReason: cashback.failureReason,
      retryCount: cashback.retryCount,
      lastRetryAt: cashback.lastRetryAt,
      metadata: cashback.metadata,
      createdAt: cashback.createdAt,
      updatedAt: cashback.updatedAt,
    };
  }

  //#endregion

  // ==================== PRIVATE CACHE METHODS ====================
  /**
   * Invalidate cache liên quan đến cashback
   */
  private async invalidateCashbackCache(
    cashbackId?: string,
    userId?: string
  ): Promise<void> {
    try {
      if (cashbackId) {
        await redis.del(CacheUtil.cashbackById(cashbackId));
      }

      // Xóa user cashbacks cache
      if (userId) {
        for (let page = 1; page <= 50; page++) {
          await redis.del(CacheUtil.userCashbacks(userId, page, 10));
          await redis.del(CacheUtil.userCashbacks(userId, page, 20));
          await redis.del(CacheUtil.userCashbacks(userId, page, 50));
        }
      }

      // Xóa cashback statistics
      await redis.del(CacheUtil.cashbackStatistics());
    } catch (error) {
      console.error('Error invalidating cashback cache:', error);
    }
  }
}