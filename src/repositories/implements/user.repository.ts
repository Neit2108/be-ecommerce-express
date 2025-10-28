import { PrismaClient, Prisma, User, UserStatus } from '@prisma/client';
import { IUserRepository } from '../interfaces/user.interface';
import { PrismaErrorHandler } from '../../errors/PrismaErrorHandler';
import { DatabaseError } from '../../errors/AppError';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(
    id: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: include ?? null,
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User fetch failed');
    }
  }

  async findUnique(
    where: Prisma.UserWhereUniqueInput,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where,
        include: include ?? null,
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User fetch failed');
    }
  }

  async findFirst(
    where: Prisma.UserWhereInput,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where,
        include: include ?? null,
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User fetch failed');
    }
  }

  async findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    try {
      return await this.prisma.user.findMany(args);
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('Users fetch failed');
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User creation failed');
    }
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    try {
      return await this.prisma.user.update({ where, data });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User update failed');
    }
  }

  async updateMany(
    where: Prisma.UserWhereInput,
    data: Prisma.UserUpdateManyMutationInput
  ): Promise<Prisma.BatchPayload> {
    try {
      return await this.prisma.user.updateMany({ where, data });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('Bulk update failed');
    }
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      return await this.prisma.user.delete({ where });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User deletion failed');
    }
  }

  async deleteMany(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload> {
    try {
      return await this.prisma.user.deleteMany({ where });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('Bulk deletion failed');
    }
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      if (where && Object.keys(where).length > 0) {
        return await this.prisma.user.count({ where });
      }
      return await this.prisma.user.count();
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      // log chi tiết để debug dễ hơn
      console.error('Prisma count error', error);
      throw new DatabaseError('Count failed');
    }
  }

  async groupBy<T extends Prisma.UserGroupByArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserGroupByArgs>
  ): Promise<Prisma.GetUserGroupByPayload<T>[]> {
    try {
      return await this.prisma.user.groupBy(args as any);
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('Group by failed');
    }
  }

  async aggregate<T extends Prisma.UserAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserAggregateArgs>
  ): Promise<Prisma.GetUserAggregateType<T>> {
    try {
      return await this.prisma.user.aggregate(args as any);
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('Aggregation failed');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email, deletedAt: null },
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User fetch by email failed');
    }
  }

  async findByPhoneNumber(phoneNumber: string, include?: Prisma.UserInclude): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { phoneNumber },
        include: include ?? null,
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User fetch by phone number failed');
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user !== null;
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User existence check by email failed');
    }
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phoneNumber },
      });
      return user !== null;
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User existence check by phone number failed');
    }
  }

  async softDelete(id: string, deletedBy?: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.SUSPENDED,
          deletedBy: deletedBy ?? null,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User soft delete failed');
    }
  }

  async restore(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.ACTIVE,
          deletedBy: null,
          deletedAt: null,
        },
      });
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User restore failed');
    }
  }

  async isVerified(id: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { status: true , emailVerified: true, identityCard: true },
      });
      return user?.status === UserStatus.ACTIVE && user?.emailVerified === true && user?.identityCard !== null;
    } catch (error) {
      if ((error as any).code?.startsWith('P')) {
        throw PrismaErrorHandler.handle(error);
      }
      throw new DatabaseError('User verification check failed');
    }
  }
}
