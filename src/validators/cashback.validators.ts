import Joi from 'joi';
import { CashbackStatus } from '@prisma/client';

export const createCashbackSchema = Joi.object({
  paymentId: Joi.string().uuid().required().messages({
    'string.empty': 'Payment ID là bắt buộc',
    'string.guid': 'Payment ID không hợp lệ',
  }),
  userId: Joi.string().uuid().required(),
  amount: Joi.number().positive().optional(),
  percentage: Joi.number().min(0).max(100).required().messages({
    'number.min': 'Phần trăm cashback phải >= 0',
    'number.max': 'Phần trăm cashback phải <= 100',
  }),
  walletAddress: Joi.string().required().messages({
    'string.empty': 'Địa chỉ ví là bắt buộc',
  }),
  blockchainNetwork: Joi.string()
    .valid('BSC', 'ETH', 'POLYGON')
    .required()
    .messages({
      'any.only': 'Blockchain network không hợp lệ',
    }),
  eligibleAt: Joi.date().optional(),
  expiresAt: Joi.date().optional(),
  metadata: Joi.object().optional(),
});

export const getCashbacksQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid(...Object.values(CashbackStatus))
    .optional(),
});

export const processCashbackSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  maxRetries: Joi.number().integer().min(1).max(10).default(3),
});