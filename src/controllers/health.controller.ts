import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { DatabaseError, ExternalServiceError } from '../errors/AppError';

export const healthController = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new DatabaseError('Không thể kết nối đến cơ sở dữ liệu');
  }

  let redisStatus = 'disconnected';
  try {
    await redis.set('health_check', 'ok', 10);
    const v = await redis.get('health_check');
    redisStatus = v === 'ok' ? 'connected' : 'disconnected';
  } catch {
    throw new ExternalServiceError('Redis', 'Không thể kết nối đến Redis');
  }

  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: { database: 'connected', redis: redisStatus },
    },
  });
};
