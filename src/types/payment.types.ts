import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  method: PaymentMethod;
  expiredAt?: Date;
  note?: string;
}

export interface UpdatePaymentStatusInput {
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
}

export interface PaymentWebhookData {
  transactionId: string;
  status: string;
  message?: string;
  rawData: any;
  signature?: string;
}

export interface PaymentSearchFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  where?: Prisma.PaymentWhereInput;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  gatewayResponse?: any;
  paidAt?: Date | null;
  expiredAt?: Date | null;
  failedAt?: Date | null;
  failureReason?: string | null;
  note?: string | null;
  cashback?: {
    id: string;
    amount: number;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}