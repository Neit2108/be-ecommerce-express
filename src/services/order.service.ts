import { OrderStatus, PaymentStatus } from '@prisma/client';
import { ForbiddenError, NotFoundError, ValidationError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import { CreateOrderInput, OrderResponse, OrderSearchFilters, UpdateOrderStatusInput } from '../types/order.types';
import { PaginatedResponse } from '../types/common';

export class OrderService {
  constructor(private uow: IUnitOfWork) {}

  /**
   * Tạo đơn hàng từ giỏ hàng của người dùng
   * @param userId 
   * @param input thông tin tạo đơn hàng
   * @returns 
   */
  async createOrderFromCart(
    userId: string,
    input: CreateOrderInput
  ): Promise<OrderResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      // lấy giỏ hàng
      const cart = await uow.cart.findByUserIdWithItems(userId);
      if (!cart || cart.items.length === 0) {
        throw new ValidationError('Giỏ hàng trống');
      }

      // validate item còn hàng và thông tin shop
      const firstItem = cart.items[0];
      if (!firstItem) {
        throw new ValidationError('Giỏ hàng trống');
      }
      const firstVariant = await uow.productVariants.findById(
        firstItem.productVariantId,
        { product: true }
      );

      if (!firstVariant?.product?.shopId) {
        throw new NotFoundError('Cửa hàng không tồn tại');
      }

      const shopId = firstVariant.product.shopId;

      // kiểm tra tất cả item trong cart có cùng shop không
      for (const item of cart.items) {
        const variant = await uow.productVariants.findById(
          item.productVariantId,
          { product: true }
        );

        if (!variant) {
          throw new NotFoundError(`Sản phẩm không tồn tại`);
        }

        if (variant.product?.shopId !== shopId) {
          throw new ValidationError(
            'Tất cả sản phẩm trong giỏ hàng phải thuộc cùng một cửa hàng'
          );
        }

        if (variant.stock < item.quantity) {
          throw new ValidationError(
            `Sản phẩm ${item.productName} không đủ số lượng trong kho`
          );
        }
      }

      // tính tiền
      const subTotal = cart.items.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0
      );

      const shippingFee = input.shippingFee ?? 0;
      const discount = input.discount ?? 0;
      const totalAmount = subTotal + shippingFee - discount;

      // tạo order
      const orderNumber = await this.generateOrderNumber();

      const order = await uow.orders.create({
        orderNumber,
        user: { connect: { id: userId } },
        shop: { connect: { id: shopId } },
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: subTotal,
        shippingFee,
        discount,
        totalAmount,
        shippingMethod: input.shippingMethod,
        shippingAddress: input.shippingAddress,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        paymentMethod: input.paymentMethod,
        customerNote: input.customerNote ?? null,
        createdBy: userId,
      });

      // thêm item vào order
      const orderItemsData = cart.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productName: item.productName,
        variantName: item.variantName,
        productImageUrl: item.productImageUrl,
        sku: '',
      }));

      await uow.orderItems.createMany(orderItemsData);

      // giảm tồn kho
      for (const item of cart.items) {
        const variant = await uow.productVariants.findById(
          item.productVariantId
        );
        if (variant) {
          await uow.productVariants.update(item.productVariantId, {
            stock: variant.stock - item.quantity,
          });
        }
      }

      // history

      // xóa giỏ hàng
      await uow.cartItem.deleteByCartId(cart.id);

      // trả về đơn hàng
      const createdOrder = await uow.orders.findByIdWithItems(order.id);
      if (!createdOrder) {
        throw new NotFoundError('Đơn hàng không tồn tại');
      }

      return this.mapToOrderResponse(createdOrder);
    });
  }

  /**
   * Lấy thông tin đơn hàng theo ID
   * @param orderId 
   * @param userId 
   * @returns 
   */
  async getOrderById(orderId:string, userId?: string) : Promise<OrderResponse>{
    const order = await this.uow.orders.findByIdWithItems(orderId);
    if(!order) throw new NotFoundError('Đơn hàng không tồn tại');
    if(userId && order.userId !== userId){
        // nếu không phải chủ đơn hàng, kiểm tra có phải chủ shop không
        const shop = await this.uow.shops.findById(order.shopId);
        if(!shop || shop.ownerId !== userId){
            throw new ForbiddenError('Bạn không có quyền xem đơn hàng này');
        }
    }
    return this.mapToOrderResponse(order);
  }

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @param userId 
   * @param options 
   * @returns 
   */
  async getUserOrders(userId: string, options?: OrderSearchFilters) : Promise<PaginatedResponse<OrderResponse>>{
    const orders = await this.uow.orders.findByUserId(userId, {
        skip: options?.page || 0,
        take: options?.limit || 10,
        ...(options?.status !== undefined ? { status: options.status } : {}),
    });

    const total = await this.uow.orders.count({
        userId,
        ...(options?.status && {status: options.status}),
    });

    return {
        data: orders.map(this.mapToOrderResponse),
        pagination:{
            total,
            totalPages: Math.ceil(total / (options?.limit || 10)),
            currentPage: options?.page || 0,
            limit: options?.limit || 10,
            hasNext: (options?.page || 0) * (options?.limit || 10) < total,
            hasPrev: (options?.page || 0) > 0,
        }
    }
  }

  /**
   * Lấy danh sách đơn hàng của cửa hàng
   * @param shopId 
   * @param ownerId 
   * @param options 
   * @returns 
   */
  async getShopOrders(shopId:string, ownerId: string, options?: OrderSearchFilters) : Promise<PaginatedResponse<OrderResponse>>{
    const shop = await this.uow.shops.findById(shopId);
    if(!shop) throw new NotFoundError('Cửa hàng không tồn tại');
    if(shop.ownerId !== ownerId) throw new ForbiddenError('Bạn không có quyền xem đơn hàng của cửa hàng này');

    const orders = await this.uow.orders.findByShopId(shopId, {
        skip: options?.page || 0,
        take: options?.limit || 10,
        ...(options?.status !== undefined ? { status: options.status } : {}),
    });

    const total = await this.uow.orders.count({
        shopId,
        ...(options?.status && {status: options.status}),
    });

    return {
        data: orders.map(this.mapToOrderResponse),
        pagination:{
            total,
            totalPages: Math.ceil(total / (options?.limit || 10)),
            currentPage: options?.page || 0,
            limit: options?.limit || 10,
            hasNext: (options?.page || 0) * (options?.limit || 10) < total,
            hasPrev: (options?.page || 0) > 0,
        }
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param orderId 
   * @param input 
   * @param updatedBy 
   * @returns 
   */
  async updateOrderStatus(orderId:string, input: UpdateOrderStatusInput, updatedBy:string) : Promise<OrderResponse>{
    return this.uow.executeInTransaction(async (uow) => {
        const order = await uow.orders.findById(orderId);
        if(!order) throw new NotFoundError('Đơn hàng không tồn tại');

        // kiểm tra tính hợp lệ của việc chuyển trạng thái
        this.validateStatusTransition(order.status, input.status);

        const updatedOrder = await uow.orders.updateStatus(orderId, input.status, input.note, updatedBy);

        // nếu hủy đơn hàng, hoàn trả tiền và trả lại tồn kho
        if(input.status === OrderStatus.CANCELLED){
            const orderItems = await uow.orderItems.findByOrderId(orderId);
            for(const item of orderItems){
                const variant = await uow.productVariants.findById(item.productVariantId);
                if(variant){
                    await uow.productVariants.update(variant.id, {
                        stock: variant.stock + item.quantity,
                    });
                }
            }
        }

        const result = await uow.orders.findByIdWithItems(orderId);
        if(!result) throw new NotFoundError('Đơn hàng không tồn tại');

        return this.mapToOrderResponse(result);
    });
  }

  /**
   * Hủy đơn hàng
   * @param orderId 
   * @param userId 
   * @param reason 
   * @returns 
   */
  async cancelOrder(orderId:string, userId:string, reason?:string) : Promise<OrderResponse>{
    const order = await this.uow.orders.findById(orderId);
    if(!order) throw new NotFoundError('Đơn hàng không tồn tại');
    if(order.userId !== userId) throw new ForbiddenError('Bạn không có quyền hủy đơn hàng này');
    if(order.status === OrderStatus.CANCELLED) throw new ValidationError('Đơn hàng đã bị hủy');
    if(order.status === OrderStatus.COMPLETED) throw new ValidationError('Đơn hàng đã hoàn thành, không thể hủy');

    return this.updateOrderStatus(orderId, { status: OrderStatus.CANCELLED, note: reason ?? '' }, userId);
  }

  /**
   * Xác nhận đơn hàng
   * @param orderId 
   * @param ownerId 
   * @returns 
   */
  async confirmOrder(orderId:string, ownerId:string) : Promise<OrderResponse>{
    const order = await this.uow.orders.findById(orderId, {shop: true});
    if(!order) throw new NotFoundError('Đơn hàng không tồn tại');

    const shop = await this.uow.shops.findById(order.shopId);
    if(!shop || shop.ownerId !== ownerId){
        throw new ForbiddenError('Bạn không có quyền xác nhận đơn hàng này');
    }

    if(order.status !== OrderStatus.PENDING){
        throw new ValidationError('Chỉ có thể xác nhận đơn hàng đang chờ xử lý');
    }

    return this.updateOrderStatus(orderId, { status: OrderStatus.CONFIRMED }, ownerId);
  }

  async getOrderStatusHistory(orderId:string){
    const order = await this.uow.orders.findById(orderId);
    if(!order) throw new NotFoundError('Đơn hàng không tồn tại');

    return this.uow.orderStatusHistory.findByOrderId(orderId);
  }

  //#region private 
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  /**
   *  Kiểm tra tính hợp lệ của việc chuyển trạng thái đơn hàng
   * @param currentStatus 
   * @param newStatus 
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED], // đang chờ -> có thể hủy/confirm
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED], // đã xác nhận -> có thể hủy/processing
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED], // đang xử lý -> có thể hủy/shipping
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED], // đang giao hàng -> có thể delivered
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED], // đã giao -> có thể hoàn thành/refund
      [OrderStatus.COMPLETED]: [], 
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(
        `Không thể chuyển từ ${currentStatus} sang ${newStatus}`
      );
    }
  }

  private mapToOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      shopId: order.shopId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      shippingAddress: order.shippingAddress,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discount: Number(order.discount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      customerNote: order.customerNote,
      shopNote: order.shopNote,
      cancelReason: order.cancelReason,
      items:
        order.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.productVariantId,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          productImageUrl: item.productImageUrl,
        })) || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
    };
  }

  //#endregion
}
