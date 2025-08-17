// src/app.ts
import express, { Application, Request, Response } from 'express';
import { applyBasicMiddleware } from './middleware';
import { corsMiddleware, corsErrorHandler } from './middleware/cors';
import { generalRateLimiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './middleware/errorHandler';
import rootRouter from './routes';

export function createApp(): Application {
  const app = express();

  // 1) Middleware cơ bản (helmet, parsers, logger)
  applyBasicMiddleware(app);

  // 2) CORS nâng cao (chỉ DÙNG MỘT bản CORS – tránh trùng lặp)
  app.use(corsMiddleware);
  app.use(corsErrorHandler);

  // 3) Rate limiting chung
  app.use(generalRateLimiter);

  // 4) Routes
  app.use('/', rootRouter);

  // 5) 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found', code: 'ROUTE_NOT_FOUND' });
  });

  // 6) Error handler cuối cùng
  app.use(globalErrorHandler);

  return app;
}
