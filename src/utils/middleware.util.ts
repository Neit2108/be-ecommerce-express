import { Request, Response, NextFunction } from 'express';
import { requireOwnership } from '../middleware/auth.middleware';

export const combineMiddleware = (...middlewares: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;
    
    const runNext = (err?: any) => {
      if (err) return next(err);
      
      if (index >= middlewares.length) return next();
      
      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    };
    
    runNext();
  };
};

export const canAccessShop = (shopOwnerId: string) => {
  return requireOwnership(async (req: Request) => shopOwnerId);
};