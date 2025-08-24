import { Cart, CartItem, Prisma, PrismaClient } from "@prisma/client";
import { ICartItemRepository, ICartRepository } from "../interfaces/cart.interface";
import { NotFoundError } from "../../errors/AppError";
import { CartIncludes } from "../../types/cart.type";

export class CartRepository implements ICartRepository{
    constructor(private prisma: PrismaClient){}

    async create(data: Prisma.CartCreateInput): Promise<Cart> {
        return this.prisma.cart.create({ data });
    }

    async findById(id: string, include?: CartIncludes): Promise<Cart | null> {
        return this.prisma.cart.findUnique({ where: { id }, include: { ...include } });
    }

    async findByIdWithItems(id: string): Promise<(Cart & { items: CartItem[]; }) | null> {
        return this.prisma.cart.findUnique({
            where: { id },
            include: { items: true }
        });
    }

    async findByUserId(userId: string): Promise<Cart | null> {
        return this.prisma.cart.findFirst({ where: { userId } });
    }

    async findByUserIdWithItems(userId: string): Promise<(Cart & { items: CartItem[]; }) | null> {
        return this.prisma.cart.findFirst({
            where: { userId },
            include: { items: true }
        });
    }

    async findBySessionId(sessionId: string): Promise<Cart | null> {
        return this.prisma.cart.findFirst({ where: { sessionId } });
    }

    async findBySessionIdWithItems(sessionId: string): Promise<(Cart & { items: CartItem[]; }) | null> {
        return this.prisma.cart.findFirst({
            where: { sessionId },
            include: { items: true }
        });
    }

    async findExpiredCarts(): Promise<Cart[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return this.prisma.cart.findMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });
    }

    async update(id: string, data: Prisma.CartUpdateInput): Promise<Cart> {
        return this.prisma.cart.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.cart.delete({ where: { id } });
    }

    async deleteByUserId(userId: string): Promise<Prisma.BatchPayload> {
        return this.prisma.cart.deleteMany({ where: { userId } });
    }

    async deleteBySessionId(sessionId: string): Promise<Prisma.BatchPayload> {
        return this.prisma.cart.deleteMany({ where: { sessionId } });
    }

    async deleteExpiredCarts(): Promise<Prisma.BatchPayload> {
        const expiredCarts = await this.findExpiredCarts();
        const ids = expiredCarts.map(cart => cart.id);
        
        return this.prisma.cart.deleteMany({
            where: { id: { in: ids } }
        });
    }

    async transferCartToUser(sessionId: string, userId: string): Promise<Cart> {
        const cart = await this.findBySessionId(sessionId);
        if (!cart) {
            throw new NotFoundError("Cart");
        }

        return this.prisma.cart.update({
            where: { id: cart.id },
            data: { userId, sessionId: null } // Clear sessionId when transferring to user
        });
    }
}

export class CartItemRepository implements ICartItemRepository {
    constructor(private prisma: PrismaClient) {}

    async create(data: Prisma.CartItemCreateInput): Promise<CartItem> {
        return this.prisma.cartItem.create({ data });
    }

    async findById(id: string): Promise<CartItem | null> {
        return this.prisma.cartItem.findUnique({ where: { id } });
    }

    async findByCartId(cartId: string): Promise<CartItem[]> {
        return this.prisma.cartItem.findMany({ where: { cartId } });
    }

    async findByCartAndVariant(cartId: string, productVariantId: string): Promise<CartItem | null> {
        return this.prisma.cartItem.findFirst({
            where: {
                cartId,
                productVariantId
            }
        });
    }

    async update(id: string, data: Prisma.CartItemUpdateInput): Promise<CartItem> {
        return this.prisma.cartItem.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.cartItem.delete({ where: { id } });
    }

    async deleteByCartId(cartId: string): Promise<Prisma.BatchPayload> {
        return this.prisma.cartItem.deleteMany({ where: { cartId } });
    }

    async countByCartId(cartId: string): Promise<number> {
        return this.prisma.cartItem.count({ where: { cartId } });
    }

    async sumTotalByCartId(cartId: string): Promise<number> {
        const items = await this.findByCartId(cartId);
        return items.reduce((total, item) => total + Number(item.totalPrice || 0) * (item.quantity || 1), 0);
    }

    async sumQuantityByCartId(cartId: string): Promise<number> {
        const items = await this.findByCartId(cartId);
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    }
}