import { OrderStatus, PaymentMethod, Prisma, ShippingMethod } from "@prisma/client";
import { PaginationParams } from "./common";

export interface OrderSearchFilters extends PaginationParams{
  createdFrom?: Date;
  createdTo?: Date;
  status?: OrderStatus;
  paymentStatus?: string;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  shopId?: string;
}

export type OrderIncludes = {
  user?: boolean;
  shop?: boolean;
  items?: boolean | {
    include?: {
      product?: boolean;
      productVariant?: boolean;
    };
  };
  statusHistory?: boolean;
};

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    shop: true;
    items: {
      include: {
        product: true;
        productVariant: true;
      };
    };
    statusHistory: true;
  };
}>;

export type CreateOrderInput = {
  shippingMethod: ShippingMethod;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
  shippingFee?: number;
  discount?: number;
};

export type UpdateOrderStatusInput = {
  status: OrderStatus;
  note?: string;
};

export type OrderItemResponse = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl?: string;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  userId: string;
  shopId: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currency: string;
  customerNote?: string;
  shopNote?: string;
  cancelReason?: string;
  items: OrderItemResponse[];
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
};

export type OrderListResponse = {
  orders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: string;
    totalAmount: number;
    createdAt: Date;
  }[];
  total: number;
  skip: number;
  take: number;
};