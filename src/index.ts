import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { applyBasicMiddleware } from './middleware';
import { testDatabaseConnection, disconnectDatabase } from './config/prisma';
import { redis } from './config/redis';
import { generalRateLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, asyncHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import { ApiResponse } from './types/common';
import { ExternalServiceError, DatabaseError } from './errors/AppError';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize connections and middleware
const initializeApp = async (): Promise<void> => {
  try {
    // Apply basic middleware
    applyBasicMiddleware(app);

    // Apply general rate limiting
    app.use(generalRateLimiter);

    // Test database connection (Prisma)
    await testDatabaseConnection();

    // Connect to Redis
    await redis.connect();

    // Health check route
    app.get('/health', asyncHandler(async (req: Request, res: Response) => {
      try {
        // Check Prisma connection
        const { prisma } = await import('./config/prisma');
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        throw new DatabaseError('Database connection failed');
      }

      let redisStatus = 'disconnected';
      try {
        await redis.set('health_check', 'ok', 10);
        const redisCheck = await redis.get('health_check');
        redisStatus = redisCheck === 'ok' ? 'connected' : 'disconnected';
      } catch (error) {
        throw new ExternalServiceError('Redis', 'Redis connection failed');
      }

      const response: ApiResponse = {
        success: true,
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          services: {
            database: 'connected',
            redis: redisStatus,
          },
        },
      };

      res.json(response);
    }));

    // API routes
    app.get('/', (req: Request, res: Response) => {
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Express.js + Prisma + JWT Authentication API',
          version: '1.0.0',
          endpoints: {
            auth: '/api/auth',
            health: '/health',
          },
        },
      };
      res.json(response);
    });

    // Mount auth routes
    app.use('/api/auth', authRoutes);

    // 404 handler
    app.use((req: Request, res: Response) => {
      const response: ApiResponse = {
        success: false,
        error: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
      };
      res.status(404).json(response);
    });

    // Global error handler (must be last)
    app.use(globalErrorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 API Documentation:`);
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   Auth Endpoints: http://localhost:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('Shutting down gracefully...');
  await disconnectDatabase();
  await redis.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize the application
initializeApp();

export default app;