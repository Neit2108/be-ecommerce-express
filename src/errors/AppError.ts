export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, 401, 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token has expired') {
    super(message, 401, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token') {
    super(message, 401, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message: string = 'Account is suspended or banned') {
    super(message, 403, 'ACCOUNT_SUSPENDED');
    this.name = 'AccountSuspendedError';
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(message: string = 'Email verification required') {
    super(message, 403, 'EMAIL_NOT_VERIFIED');
    this.name = 'EmailNotVerifiedError';
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404, 'USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}

// 409 - Conflict
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class EmailExistsError extends AppError {
  constructor(message: string = 'Email already exists') {
    super(message, 409, 'EMAIL_EXISTS');
    this.name = 'EmailExistsError';
  }
}

export class PhoneExistsError extends AppError {
  constructor(message: string = 'Phone number already exists') {
    super(message, 409, 'PHONE_EXISTS');
    this.name = 'PhoneExistsError';
  }
}

// 422 - Unprocessable Entity
export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
    this.name = 'UnprocessableEntityError';
  }
}

export class WeakPasswordError extends AppError {
  constructor(message: string = 'Password does not meet security requirements', details?: any) {
    super(message, 422, 'WEAK_PASSWORD', details);
    this.name = 'WeakPasswordError';
  }
}

// 429 - Too Many Requests
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, 'TOO_MANY_REQUESTS', { retryAfter });
    this.name = 'TooManyRequestsError';
  }
}

// 500 - Internal Server Error
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service unavailable') {
    super(`${service}: ${message}`, 500, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}