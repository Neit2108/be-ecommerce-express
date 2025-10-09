import { NotFoundError, ValidationError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import { CartItemResponse, CartResponse } from '../types/cart.type';

export class CartService {
  constructor(private uow: IUnitOfWork) {}

  async getOrCreateByUser(userId: string): Promise<CartResponse> {
    const cart = await this.uow.cart.findByUserIdWithItems(userId);
    if (cart) {
      return {
        id: cart.id,
        userId: cart.userId ?? userId,
        items: cart.items.map((item) => {
          return {
            id: item.id,
            productId: item.productId,
            variantId: item.productVariantId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
          };
        }),
        totalAmount: Number(cart.totalAmount),
        itemsCount: cart.totalItems,
      };
    }

    // Nếu không tìm thấy giỏ hàng, tạo mới
    const newCart = await this.uow.cart.create({
      user: { connect: { id: userId } },
      items: {
        create: [],
      },
    });

    return {
      id: newCart.id,
      userId: newCart.userId ?? '',
      items: [],
      totalAmount: 0,
      itemsCount: 0,
    };
  }

  async getOrCreateBySession(sessionId: string): Promise<CartResponse> {
    const cart = await this.uow.cart.findBySessionIdWithItems(sessionId);
    if (cart) {
      return {
        id: cart.id,
        sessionId: cart.sessionId ?? sessionId,
        items: cart.items.map((item) => {
          return {
            id: item.id,
            productId: item.productId,
            variantId: item.productVariantId,
            productName: item.productName,
            quantity: item.quantity,
            totalPrice: Number(item.totalPrice),
            unitPrice: Number(item.unitPrice),
          };
        }),
        totalAmount: Number(cart.totalAmount),
        itemsCount: Number(cart.totalItems),
      };
    }

    // Nếu không tìm thấy giỏ hàng, tạo mới
    const newCart = await this.uow.cart.create({
      sessionId,
      items: {
        create: [],
      },
    });

    return {
      id: newCart.id,
      userId: newCart.userId ?? '',
      items: [],
      totalAmount: 0,
      itemsCount: 0,
    };
  }

  async addItem(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<CartItemResponse> {
    if (quantity <= 0) {
      throw new ValidationError('Số lượng phải lớn hơn 0');
    }

    return this.uow.executeInTransaction(async (uow) => {
      const existingItem = await uow.cartItem.findByCartAndVariant(
        cartId,
        variantId
      );

      if (existingItem) {
        const unitPrice = Number(existingItem.unitPrice ?? 0);
        const newQuantity = existingItem.quantity + quantity;
        const updatedItem = await uow.cartItem.update(existingItem.id, {
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity,
        });

        return {
          id: updatedItem.id,
          cartId: updatedItem.cartId,
          productId: updatedItem.productId,
          variantId: updatedItem.productVariantId,
          productName: updatedItem.productName,
          quantity: newQuantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice * newQuantity,
        } as CartItemResponse;
      }

      const variant = await uow.productVariants.findById(variantId, {
        product: true,
      });
      if (!variant) throw new NotFoundError('Product variant');

      const unitPrice = Number(variant.price ?? 0);
      const createdItem = await uow.cartItem.create({
        cart: { connect: { id: cartId } },
        productVariant: { connect: { id: variantId } },
        product: { connect: { id: variant.productId } },
        productName: variant.product?.name,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
      });

      return {
        id: createdItem.id,
        cartId: createdItem.cartId,
        productId: createdItem.productId,
        variantId: createdItem.productVariantId,
        productName: createdItem.productName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      } as CartItemResponse;
    });
  }

  async setItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItemResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const cartItem = await uow.cartItem.findById(itemId);
      if (!cartItem || cartItem.cartId !== cartId) {
        throw new NotFoundError('Cart item');
      }

      if (quantity <= 0) {
        await uow.cartItem.delete(itemId);
      }

      const unitPrice = Number(cartItem.unitPrice ?? 0);

      const updatedItem = await uow.cartItem.update(itemId, {
        quantity,
        totalPrice: unitPrice * quantity,
      });

      return {
        id: updatedItem.id,
        cartId: updatedItem.cartId,
        productId: updatedItem.productId,
        variantId: updatedItem.productVariantId,
        productName: updatedItem.productName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      } as CartItemResponse;
    });
  }

  async removeItem(cartId: string, itemId: string): Promise<CartItemResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const cartItem = await uow.cartItem.findById(itemId);
      if (!cartItem || cartItem.cartId !== cartId) {
        throw new NotFoundError('Cart item not found');
      }

      await uow.cartItem.delete(itemId);

      return {
        id: cartItem.id,
        cartId: cartItem.cartId,
        productId: cartItem.productId,
        variantId: cartItem.productVariantId,
        productName: cartItem.productName,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      } as CartItemResponse;
    });
  }

  async clearCart(cartId: string): Promise<CartResponse> {
    await this.uow.cartItem.deleteByCartId(cartId);
    return {
      id: cartId,
      userId: '',
      items: [],
      totalAmount: 0,
      itemsCount: 0,
    };
  }

  async transferCartToUser(
    sessionId: string,
    userId: string
  ): Promise<CartResponse> {
    const cart = await this.uow.cart.findBySessionIdWithItems(sessionId);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Gán lại userId cho giỏ hàng
    cart.userId = userId;
    await this.uow.cart.update(cart.id, { user: { connect: { id: userId } } });

    return {
      id: cart.id,
      userId: cart.userId ?? '',
      items: cart.items.map((item) => {
        return {
          id: item.id,
          productId: item.productId,
            variantId: item.productVariantId,
            productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        };
      }),
      totalAmount: Number(cart.totalAmount),
      itemsCount: cart.totalItems,
    };
  }
}
