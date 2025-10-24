export interface CartIncludes{
    user?: boolean;
    items?: boolean;
}

export interface CartResponse{
    id: string;
    userId?: string;
    sessionId?: string;
    items: CartItemResponse[];
    itemsCount: number;
    totalAmount: number;
}

export interface CartItemResponse{
    id: string;
    cartId?: string;
    productId: string;
    variantId: string;
    productName?: string;
    productImage?: string;
    productCategory?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

