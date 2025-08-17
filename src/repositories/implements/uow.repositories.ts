import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from '../interfaces/uow.interfaces'; 
import { IUserRepository } from '../interfaces/user.interfaces'; 
import { UserRepository } from './user.repositories'; 

export class UnitOfWork implements IUnitOfWork {
  private _users: IUserRepository;

  constructor(private prisma: PrismaClient) {
    this._users = new UserRepository(this.prisma);
  }

  get users(): IUserRepository {
    return this._users;
  }

  async executeInTransaction<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const transactionalUow = new UnitOfWork(tx as PrismaClient);
      return await operation(transactionalUow);
    });
  }
}