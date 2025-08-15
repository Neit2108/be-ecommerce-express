import jwt from 'jsonwebtoken';
import {
  InvalidTokenError,
  TokenExpiredError,
  UnauthorizedError,
} from './AppError';

export class JwtErrorHandler {
  static handle(error: any): never {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError('Yêu cầu của bạn đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (error instanceof jwt.NotBeforeError) {
        throw new InvalidTokenError('Token chưa hoạt động. Vui lòng thử lại sau.');
      }

      throw new InvalidTokenError('Định dạng token không hợp lệ');
    }

    throw new UnauthorizedError('Xác thực token thất bại');
  }
}