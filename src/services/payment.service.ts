import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import {
  CreatePaymentInput,
  PaymentResponse,
  PaymentSearchFilters,
  UpdatePaymentStatusInput,
  PaymentWebhookData,
} from '../types/payment.types';
import { PaginatedResponse } from '../types/common';
import redis from '../config/redis';
import { CacheUtil } from '../utils/cache.util';

export class PaymentService {
  constructor(private uow: IUnitOfWork) {}

  /**
   * Tạo payment cho đơn hàng
   * @param orderId 
   * @param input 
   * @returns 
   */
  async createPayment(
    orderId: string,
    input: CreatePaymentInput
  ): Promise<PaymentResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      // Kiểm tra order tồn tại
      const order = await uow.orders.findById(orderId);
      if (!order) {
        throw new NotFoundError('Đơn hàng không tồn tại');
      }

      // Kiểm tra order đã có payment chưa
      const existingPayment = await uow.payments.findByOrderId(orderId);
      if (existingPayment && existingPayment.status !== PaymentStatus.FAILED) {
        throw new ValidationError('Đơn hàng đã có thanh toán');
      }

      // Tính expiredAt (mặc định 15 phút)
      const expiredAt = input.expiredAt || new Date(Date.now() + 15 * 60 * 1000);

      // Tạo payment
      const payment = await uow.payments.create({
        order: { connect: { id: orderId } },
        amount: input.amount,
        currency: input.currency || 'VND',
        method: input.method,
        status: PaymentStatus.PENDING,
        expiredAt,
        note: input.note || null,
      });

      // Invalidate cache
      await this.invalidatePaymentCache(undefined, orderId);

      return this.mapToPaymentResponse(payment);
    });
  }

  /**
   * Lấy thông tin payment theo ID
   * @param paymentId 
   * @param userId (optional) - để check quyền
   * @returns 
   */
  async getPaymentById(
    paymentId: string,
    userId?: string
  ): Promise<PaymentResponse> {
    // Kiểm tra cache trước
    const cacheKey = CacheUtil.paymentById(paymentId);
    const cachedPayment = await redis.get(cacheKey);
    if (cachedPayment) {
      return JSON.parse(cachedPayment);
    }

    const payment = await this.uow.payments.findById(paymentId, {
      order: true,
      cashback: true,
    });

    if (!payment) {
      throw new NotFoundError('Thanh toán không tồn tại');
    }

    // Nếu có userId, kiểm tra quyền
    // 🔥 OPTIMIZED: Use already-fetched order instead of querying again
    if (userId && payment.orderId && payment.order) {
      // Kiểm tra có phải chủ đơn hàng hoặc chủ shop
      if (payment.order.userId !== userId) {
        const shop = await this.uow.shops.findById(payment.order.shopId);
        if (!shop || shop.ownerId !== userId) {
          throw new ForbiddenError('Bạn không có quyền xem thanh toán này');
        }
      }
    }

    const paymentResponse = this.mapToPaymentResponse(payment);

    // Lưu vào cache 30 phút
    await redis.set(cacheKey, JSON.stringify(paymentResponse), 1800);

    return paymentResponse;
  }

  /**
   * Lấy payment theo order ID
   * @param orderId 
   * @returns 
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentResponse | null> {
    // Kiểm tra cache trước
    const cacheKey = CacheUtil.paymentByOrderId(orderId);
    const cachedPayment = await redis.get(cacheKey);
    if (cachedPayment) {
      return JSON.parse(cachedPayment);
    }

    const payment = await this.uow.payments.findByOrderId(orderId, {
      order: true,
      cashback: true,
    });

    if (!payment) {
      return null;
    }

    const paymentResponse = this.mapToPaymentResponse(payment);

    // Lưu vào cache 30 phút
    await redis.set(cacheKey, JSON.stringify(paymentResponse), 1800);

    return paymentResponse;
  }

  /**
   * Lấy danh sách payments với filter
   * @param options 
   * @returns 
   */
  async getPayments(
    options?: PaymentSearchFilters
  ): Promise<PaginatedResponse<PaymentResponse>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;

    // Tạo cache key
    const cacheKey = CacheUtil.paymentsList(page, limit);

    // Kiểm tra cache
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const payments = await this.uow.payments.findMany({
      skip: (page - 1) * limit,
      take: limit,
      ...(options?.status && { status: options.status }),
      ...(options?.method && { method: options.method }),
      ...(options?.where && { where: options.where }),
    });

    const total = await this.uow.payments.count(options?.where);

    const result = {
      data: payments.map(this.mapToPaymentResponse),
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
   * Cập nhật trạng thái payment
   * @param paymentId 
   * @param input 
   * @returns 
   */
  async updatePaymentStatus(
    paymentId: string,
    input: UpdatePaymentStatusInput
  ): Promise<PaymentResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const payment = await uow.payments.findById(paymentId, { order: true });
      if (!payment) {
        throw new NotFoundError('Thanh toán không tồn tại');
      }

      // Validate status transition
      this.validateStatusTransition(payment.status, input.status);

      // Cập nhật payment
      const updatedPayment = await uow.payments.updateStatus(
        paymentId,
        input.status,
        {
          transactionId: input.transactionId ?? '',
          gatewayResponse: input.gatewayResponse,
          ...(input.status === PaymentStatus.PAID && { paidAt: new Date() }),
          ...(input.status === PaymentStatus.FAILED && {
            failedAt: new Date(),
            failureReason: input.failureReason,
          }),
        }
      );

      // Nếu thanh toán thành công, cập nhật order và tạo cashback
      if (input.status === PaymentStatus.PAID && payment.orderId) {
        // Cập nhật order payment status
        await uow.orders.update(payment.orderId, {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        });

        // TODO: Tạo cashback nếu đủ điều kiện
        // Sẽ được xử lý bởi CashbackService
      }

      const result = await uow.payments.findById(paymentId, {
        order: true,
        cashback: true,
      });
      if (!result) {
        throw new NotFoundError('Thanh toán không tồn tại');
      }

      // Invalidate cache
      await this.invalidatePaymentCache(paymentId, payment.orderId);

      return this.mapToPaymentResponse(result);
    });
  }

  /**
   * Xử lý webhook từ payment gateway
   * @param webhookData 
   * @returns 
   */
  async handlePaymentWebhook(
    webhookData: PaymentWebhookData
  ): Promise<PaymentResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      // Tìm payment theo transactionId
      const payment = await uow.payments.findByTransactionId(
        webhookData.transactionId
      );

      if (!payment) {
        throw new NotFoundError(
          `Payment với transaction ${webhookData.transactionId} không tồn tại`
        );
      }

      // Verify signature (tùy gateway)
      // this.verifyWebhookSignature(webhookData);

      // Cập nhật payment status dựa vào webhook
      let newStatus: PaymentStatus;
      switch (webhookData.status) {
        case 'success':
        case 'completed':
          newStatus = PaymentStatus.PAID;
          break;
        case 'failed':
        case 'error':
          newStatus = PaymentStatus.FAILED;
          break;
        default:
          newStatus = PaymentStatus.PENDING;
      }

      return this.updatePaymentStatus(payment.id, {
        status: newStatus,
        transactionId: webhookData.transactionId,
        gatewayResponse: webhookData.rawData,
        ...(newStatus === PaymentStatus.FAILED && {
          failureReason: webhookData.message,
        }),
      });
    });
  }

  /**
   * Hủy payment (chỉ cho PENDING)
   * @param paymentId 
   * @param reason 
   * @returns 
   */
  async cancelPayment(
    paymentId: string,
    reason?: string
  ): Promise<PaymentResponse> {
    const payment = await this.uow.payments.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Thanh toán không tồn tại');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ValidationError('Chỉ có thể hủy thanh toán đang chờ xử lý');
    }

    return this.updatePaymentStatus(paymentId, {
      status: PaymentStatus.FAILED,
      failureReason: reason || 'Đã hủy thanh toán',
    });
  }

  /**
   * Xử lý các payment đã hết hạn
   * @returns số lượng payment đã xử lý
   */
  async processExpiredPayments(): Promise<number> {
    const expiredPayments = await this.uow.payments.findExpiredPendingPayments();

    let processedCount = 0;
    for (const payment of expiredPayments) {
      try {
        await this.updatePaymentStatus(payment.id, {
          status: PaymentStatus.FAILED,
          failureReason: 'Thanh toán đã hết hạn',
        });
        processedCount++;
      } catch (error) {
        console.error(
          `Failed to process expired payment ${payment.id}:`,
          error
        );
      }
    }

    return processedCount;
  }

  /**
   * Thống kê doanh thu từ payments
   * @param filters 
   * @returns 
   */
  async getPaymentStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    method?: PaymentMethod;
  }) {
    // Kiểm tra cache trước
    const cacheKey = CacheUtil.paymentStatistics();
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const where: any = {
      status: PaymentStatus.PAID,
      ...(filters?.startDate && {
        paidAt: { gte: filters.startDate },
      }),
      ...(filters?.endDate && {
        paidAt: { ...{ lte: filters.endDate } },
      }),
      ...(filters?.method && { method: filters.method }),
    };

    const [totalAmount, totalCount] = await Promise.all([
      this.uow.payments.sumAmount(where),
      this.uow.payments.count(where),
    ]);

    const stats = {
      totalAmount,
      totalCount,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
    };

    // Lưu vào cache 1 giờ
    await redis.set(cacheKey, JSON.stringify(stats), 3600);

    return stats;
  }

  //#region Private methods

  private validateStatusTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus
  ): void {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.FAILED],
      [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [], // không thể chuyển từ failed
      [PaymentStatus.REFUNDED]: [], // không thể chuyển từ refunded
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(
        `Không thể chuyển từ ${currentStatus} sang ${newStatus}`
      );
    }
  }

  private mapToPaymentResponse(payment: any): PaymentResponse {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      gatewayResponse: payment.gatewayResponse,
      paidAt: payment.paidAt,
      expiredAt: payment.expiredAt,
      failedAt: payment.failedAt,
      failureReason: payment.failureReason,
      note: payment.note,
      cashback: {
        id: payment.cashback.id,
        amount: Number(payment.cashback.amount),
        status: payment.cashback.status,
      },
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  //#endregion

  // ==================== PRIVATE CACHE METHODS ====================
  /**
   * Invalidate cache liên quan đến payment
   */
  private async invalidatePaymentCache(
    paymentId?: string,
    orderId?: string
  ): Promise<void> {
    try {
      if (paymentId) {
        await redis.del(CacheUtil.paymentById(paymentId));
      }

      if (orderId) {
        await redis.del(CacheUtil.paymentByOrderId(orderId));
      }

      // Xóa payment list caches
      for (let page = 1; page <= 50; page++) {
        await redis.del(CacheUtil.paymentsList(page, 10));
        await redis.del(CacheUtil.paymentsList(page, 20));
        await redis.del(CacheUtil.paymentsList(page, 50));
      }

      // Xóa payment statistics
      await redis.del(CacheUtil.paymentStatistics());
    } catch (error) {
      console.error('Error invalidating payment cache:', error);
    }
  }
}