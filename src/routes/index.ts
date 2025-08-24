// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import shopRoutes from './shop.routes';
import cartRoutes from './cart.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Express.js + Prisma + JWT Authentication API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        health: '/health',
        users: '/api/users',
        products: '/api/products',
        shops: '/api/shops',
        cart: '/api/cart',
      },
    },
  });
});

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/products', productRoutes);
router.use('/api/shops', shopRoutes);
router.use('/health', healthRoutes);
router.use('/api/cart', cartRoutes);

export default router;
