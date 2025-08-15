import { Prisma } from '@prisma/client';
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
  DatabaseError,
  EmailExistsError,
  PhoneExistsError,
} from './AppError';

export class PrismaErrorHandler {
  static handle(error: any): AppError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return this.handleUniqueConstraintError(error);
        case 'P2025':
          return new NotFoundError('Record');
        case 'P2003':
          return new ValidationError('Foreign key constraint failed');
        case 'P2014':
          return new ValidationError('Invalid ID provided');
        case 'P2015':
          return new NotFoundError('Related record');
        case 'P2016':
          return new ValidationError('Query interpretation error');
        case 'P2017':
          return new ValidationError('Records not connected');
        case 'P2018':
          return new NotFoundError('Required connected records');
        case 'P2019':
          return new ValidationError('Input error');
        case 'P2020':
          return new ValidationError('Value out of range');
        case 'P2021':
          return new DatabaseError('Table does not exist');
        case 'P2022':
          return new DatabaseError('Column does not exist');
        case 'P2023':
          return new DatabaseError('Inconsistent column data');
        case 'P2024':
          return new DatabaseError('Timed out fetching connection from pool');
        case 'P2026':
          return new DatabaseError('Current provider doesn\'t support this feature');
        case 'P2027':
          return new DatabaseError('Multiple errors occurred');
        default:
          return new DatabaseError(`Database error: ${error.message}`);
      }
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return new DatabaseError('Unknown database error occurred');
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return new DatabaseError('Database engine crashed');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new DatabaseError('Failed to initialize database connection');
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new ValidationError('Invalid query parameters');
    }

    // If it's not a Prisma error, return a generic database error
    return new DatabaseError(error.message || 'Database operation failed');
  }

  private static handleUniqueConstraintError(error: Prisma.PrismaClientKnownRequestError): AppError {
    const target = error.meta?.target as string[] | undefined;
    
    if (!target || !Array.isArray(target)) {
      return new ConflictError('Unique constraint violation');
    }

    // Check which field caused the constraint violation
    if (target.includes('email')) {
      return new EmailExistsError();
    }

    if (target.includes('phoneNumber') || target.includes('phone_number')) {
      return new PhoneExistsError();
    }

    // Generic conflict for other unique constraints
    const field = target[0];
    return new ConflictError(`${field} already exists`);
  }
}