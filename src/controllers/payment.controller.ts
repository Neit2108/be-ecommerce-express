import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentWebhookSchema,
  getPaymentsQuerySchema,
} from '../validators/payment.validators';
import { ValidationError } from '../errors/AppError';
import { paymentService } from '../config/container';
import { ApiResponse } from '../types/common';

export class PaymentController {
  /**
   * @desc Tạo payment cho đơn hàng
   * @route POST /api/payments
   */
  createPayment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { error, value } = createPaymentSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Dữ liệu không hợp lệ'
        );
      }

      const result = await paymentService.createPayment(value.orderId, {
        amount: value.amount,
        method: value.method,
        currency: value.currency,
        expiredAt: value.expiredAt,
        note: value.note,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Tạo thanh toán thành công',
        data: result,
      };
      res.status(201).json(response);
    }
  );

  /**
   * @desc Lấy thông tin payment theo ID
   * @route GET /api/payments/:paymentId
   */
  getPaymentById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new ValidationError('Payment ID là bắt buộc');
      }

      const userId = req.user?.id;
      const result = await paymentService.getPaymentById(paymentId, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Lấy thông tin thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * @desc Lấy payment theo order ID
   * @route GET /api/orders/:orderId/payment
   */
  getPaymentByOrderId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { orderId } = req.params;
      if (!orderId) {
        throw new ValidationError('Order ID là bắt buộc');
      }

      const result = await paymentService.getPaymentByOrderId(orderId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Lấy thông tin thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * @desc Lấy danh sách payments với filter
   * @route GET /api/payments
   */
  getPayments = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { error, value } = getPaymentsQuerySchema.validate(req.query);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Dữ liệu không hợp lệ'
        );
      }

      const result = await paymentService.getPayments({
        page: value.page,
        limit: value.limit,
        status: value.status,
        method: value.method,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Lấy danh sách thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * @desc Cập nhật trạng thái payment
   * @route PATCH /api/payments/:paymentId/status
   */
  updatePaymentStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new ValidationError('Payment ID là bắt buộc');
      }

      const { error, value } = updatePaymentStatusSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Dữ liệu không hợp lệ'
        );
      }

      const result = await paymentService.updatePaymentStatus(paymentId, {
        status: value.status,
        transactionId: value.transactionId,
        gatewayResponse: value.gatewayResponse,
        failureReason: value.failureReason,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Cập nhật trạng thái thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * @desc Xử lý webhook từ payment gateway
   * @route POST /api/payments/webhook/:gateway
   */
  handleWebhook = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { gateway } = req.params;
      if (!gateway) {
        throw new ValidationError('Gateway là bắt buộc');
      }

      // Parse webhook data theo từng gateway
      const webhookData = this.parseWebhookData(gateway, req.body);

      const { error, value } = paymentWebhookSchema.validate(webhookData);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Webhook data không hợp lệ'
        );
      }

      const result = await paymentService.handlePaymentWebhook(value);

      const response: ApiResponse = {
        success: true,
        message: 'Xử lý webhook thành công',
        data: result,
      };
      res.json(response);
    }
  );

  /**
   * @desc Hủy payment
   * @route POST /api/payments/:paymentId/cancel
   */
  cancelPayment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new ValidationError('Payment ID là bắt buộc');
      }

      const { reason } = req.body;

      const result = await paymentService.cancelPayment(paymentId, reason);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Hủy thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * @desc Thống kê payments
   * @route GET /api/payments/statistics
   */
  getStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { startDate, endDate, method } = req.query;

      const result = await paymentService.getPaymentStatistics({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        method: method as any,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Lấy thống kê thanh toán thành công',
      };
      res.json(response);
    }
  );

  /**
   * Parse webhook data từ các gateway khác nhau
   */
  private parseWebhookData(gateway: string, data: any): any {
    switch (gateway.toLowerCase()) {
      case 'vnpay':
        return {
          transactionId: data.vnp_TxnRef,
          status: data.vnp_ResponseCode === '00' ? 'success' : 'failed',
          message: data.vnp_Message,
          rawData: data,
        };

      case 'momo':
        return {
          transactionId: data.orderId,
          status: data.resultCode === 0 ? 'success' : 'failed',
          message: data.message,
          rawData: data,
        };

      case 'zalopay':
        return {
          transactionId: data.apptransid,
          status: data.status === 1 ? 'success' : 'failed',
          message: data.discountamount,
          rawData: data,
        };

      default:
        throw new ValidationError(`Gateway ${gateway} không được hỗ trợ`);
    }
  }
}

export const paymentController = new PaymentController();