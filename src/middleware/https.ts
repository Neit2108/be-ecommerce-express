import { Request, Response, NextFunction } from 'express';

/**
 * Middleware để force HTTPS trong production
 */
export const forceHttps = (req: Request, res: Response, next: NextFunction) => {
  // Chỉ force HTTPS trong production
  if (process.env.NODE_ENV === 'production') {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      const httpsUrl = `https://${req.get('host')}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }
  next();
};

/**
 * Middleware để set security headers cho HTTPS
 */
export const httpsSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Strict Transport Security (HSTS)
  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Upgrade Insecure Requests
  res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
  
  next();
};

/**
 * Middleware để log protocol được sử dụng
 */
export const logProtocol = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    const protocol = req.secure ? 'HTTPS' : 'HTTP';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${protocol} ${req.method} ${req.originalUrl}`);
  }
  next();
};

/**
 * Middleware để check certificate status
 */
export const certificateInfo = (req: Request, res: Response, next: NextFunction) => {
  if (req.secure) {
    // Thêm thông tin certificate vào request object nếu cần
    (req as any).isSecure = true;
    (req as any).protocol = 'https';
  } else {
    (req as any).isSecure = false;
    (req as any).protocol = 'http';
  }
  next();
};