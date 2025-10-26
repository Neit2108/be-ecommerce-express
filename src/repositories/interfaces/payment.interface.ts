import { Payment, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

export interface PaymentIncludes {
  order?: boolean;
  cashback?: boolean;
}

export interface IPaymentRepository {
  // Create
  create(data: Prisma.PaymentCreateInput): Promise<Payment>;

  // Read
  findById(id: string, include?: Prisma.PaymentInclude): Promise<Prisma.PaymentGetPayload<{include: Prisma.PaymentInclude}> | null>;
  findByOrderId(orderId: string, include?: PaymentIncludes): Promise<Payment | null>;
  findByTransactionId(transactionId: string, include?: PaymentIncludes): Promise<Payment | null>;
  findMany(options?: {
    skip?: number;
    take?: number;
    status?: PaymentStatus;
    method?: PaymentMethod;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
    where?: Prisma.PaymentWhereInput;
  }): Promise<Payment[]>;

  // Update
  update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;
  updateStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: {
      paidAt?: Date;
      failedAt?: Date;
      failureReason?: string;
      transactionId?: string;
      gatewayResponse?: any;
    }
  ): Promise<Payment>;

  // Delete
  delete(id: string): Promise<Payment>;

  // Statistics
  count(where?: Prisma.PaymentWhereInput): Promise<number>;
  sumAmount(where?: Prisma.PaymentWhereInput): Promise<number>;
  
  // Find pending payments that expired
  findExpiredPendingPayments(): Promise<Payment[]>;
}