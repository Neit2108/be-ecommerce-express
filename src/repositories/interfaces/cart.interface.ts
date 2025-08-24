import { Prisma, Cart, CartItem } from "@prisma/client";
import { CartIncludes } from "../../types/cart.type";

export interface ICartRepository {
  /**
   * Tạo giỏ hàng mới
   * @param data - Dữ liệu tạo giỏ hàng
   * @returns Promise<Cart>
   */
  create(data: Prisma.CartCreateInput): Promise<Cart>;
  
  /**
   * Tìm giỏ hàng theo ID
   * @param id - ID của giỏ hàng
   * @returns Promise<Cart | null>
   */
  findById(id: string, include?: CartIncludes): Promise<Cart | null>;
  
  /**
   * Tìm giỏ hàng theo ID kèm danh sách items
   * @param id - ID của giỏ hàng
   * @returns Promise<Cart & { items: CartItem[] } | null>
   */
  findByIdWithItems(id: string): Promise<Cart & { items: CartItem[] } | null>;
  
  /**
   * Tìm giỏ hàng theo user ID
   * @param userId - ID của user
   * @returns Promise<Cart | null>
   */
  findByUserId(userId: string): Promise<Cart | null>;
  
  /**
   * Tìm giỏ hàng theo user ID kèm danh sách items
   * @param userId - ID của user
   * @returns Promise<Cart & { items: CartItem[] } | null>
   */
  findByUserIdWithItems(userId: string): Promise<Cart & { items: CartItem[] } | null>;
  
  /**
   * Tìm giỏ hàng theo session ID
   * @param sessionId - Session ID của guest user
   * @returns Promise<Cart | null>
   */
  findBySessionId(sessionId: string): Promise<Cart | null>;
  
  /**
   * Tìm giỏ hàng theo session ID kèm danh sách items
   * @param sessionId - Session ID của guest user
   * @returns Promise<Cart & { items: CartItem[] } | null>
   */
  findBySessionIdWithItems(sessionId: string): Promise<Cart & { items: CartItem[] } | null>;
  
  /**
   * Cập nhật thông tin giỏ hàng
   * @param id - ID của giỏ hàng
   * @param data - Dữ liệu cập nhật
   * @returns Promise<Cart>
   */
  update(id: string, data: Prisma.CartUpdateInput): Promise<Cart>;
  
  /**
   * Xóa giỏ hàng theo ID
   * @param id - ID của giỏ hàng
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;
  
  /**
   * Xóa tất cả giỏ hàng của user
   * @param userId - ID của user
   * @returns Promise<Prisma.BatchPayload>
   */
  deleteByUserId(userId: string): Promise<Prisma.BatchPayload>;
  
  /**
   * Xóa tất cả giỏ hàng theo session ID
   * @param sessionId - Session ID của guest user
   * @returns Promise<Prisma.BatchPayload>
   */
  deleteBySessionId(sessionId: string): Promise<Prisma.BatchPayload>;
  
  /**
   * Tìm các giỏ hàng đã hết hạn
   * @returns Promise<Cart[]>
   */
  findExpiredCarts(): Promise<Cart[]>;
  
  /**
   * Xóa các giỏ hàng đã hết hạn
   * @returns Promise<Prisma.BatchPayload>
   */
  deleteExpiredCarts(): Promise<Prisma.BatchPayload>;
  
  /**
   * Chuyển giỏ hàng guest thành giỏ hàng của user
   * @param sessionId - Session ID của guest cart
   * @param userId - ID của user nhận cart
   * @returns Promise<Cart>
   */
  transferCartToUser(sessionId: string, userId: string): Promise<Cart>;
}

export interface ICartItemRepository {
  /**
   * Tạo item mới trong giỏ hàng
   * @param data - Dữ liệu tạo cart item
   * @returns Promise<CartItem>
   */
  create(data: Prisma.CartItemCreateInput): Promise<CartItem>;
  
  /**
   * Tìm cart item theo ID
   * @param id - ID của cart item
   * @returns Promise<CartItem | null>
   */
  findById(id: string): Promise<CartItem | null>;
  
  /**
   * Lấy tất cả items trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @returns Promise<CartItem[]>
   */
  findByCartId(cartId: string): Promise<CartItem[]>;
  
  /**
   * Tìm item theo cart ID và variant ID
   * @param cartId - ID của giỏ hàng
   * @param productVariantId - ID của product variant
   * @returns Promise<CartItem | null>
   */
  findByCartAndVariant(cartId: string, productVariantId: string): Promise<CartItem | null>;
  
  /**
   * Cập nhật thông tin cart item
   * @param id - ID của cart item
   * @param data - Dữ liệu cập nhật
   * @returns Promise<CartItem>
   */
  update(id: string, data: Prisma.CartItemUpdateInput): Promise<CartItem>;
  
  /**
   * Xóa cart item
   * @param id - ID của cart item
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;
  
  /**
   * Xóa tất cả items trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @returns Promise<Prisma.BatchPayload>
   */
  deleteByCartId(cartId: string): Promise<Prisma.BatchPayload>;
  
  /**
   * Đếm số lượng items trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @returns Promise<number>
   */
  countByCartId(cartId: string): Promise<number>;
  
  /**
   * Tính tổng tiền của tất cả items trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @returns Promise<number>
   */
  sumTotalByCartId(cartId: string): Promise<number>;
  
  /**
   * Tính tổng số lượng sản phẩm trong giỏ hàng
   * @param cartId - ID của giỏ hàng
   * @returns Promise<number>
   */
  sumQuantityByCartId(cartId: string): Promise<number>;
}
