import Joi from 'joi';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required().messages({
    'string.empty': 'Order ID là bắt buộc',
    'string.guid': 'Order ID không hợp lệ',
  }),
  amount: Joi.number().positive().required().messages({
    'number.base': 'Số tiền phải là số',
    'number.positive': 'Số tiền phải lớn hơn 0',
  }),
  method: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required()
    .messages({
      'any.only': 'Phương thức thanh toán không hợp lệ',
    }),
  currency: Joi.string().default('VND'),
  expiredAt: Joi.date().optional(),
  note: Joi.string().max(500).optional(),
});

export const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .required()
    .messages({
      'any.only': 'Trạng thái thanh toán không hợp lệ',
    }),
  transactionId: Joi.string().optional(),
  gatewayResponse: Joi.object().optional(),
  failureReason: Joi.string().max(500).optional(),
});

export const paymentWebhookSchema = Joi.object({
  transactionId: Joi.string().required(),
  status: Joi.string().required(),
  message: Joi.string().optional(),
  rawData: Joi.object().required(),
});

export const getPaymentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  method: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .optional(),
});