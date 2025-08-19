import { User, UserStatus, Prisma } from '@prisma/client';

export interface IUserRepository {
  findById(id: string, include?: Prisma.UserInclude): Promise<User | null>;
  findUnique(where: Prisma.UserWhereUniqueInput, include?: Prisma.UserInclude): Promise<User | null>;
  findFirst(where: Prisma.UserWhereInput, include?: Prisma.UserInclude): Promise<User | null>;
  findMany(args: Prisma.UserFindManyArgs): Promise<User[]>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User>;
  updateMany(where: Prisma.UserWhereInput, data: Prisma.UserUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
  delete(where: Prisma.UserWhereUniqueInput): Promise<User>;
  deleteMany(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload>;
  count(where?: Prisma.UserWhereInput): Promise<number>;
  
  groupBy<T extends Prisma.UserGroupByArgs>(args: Prisma.SelectSubset<T, Prisma.UserGroupByArgs>): Promise<Prisma.GetUserGroupByPayload<T>[]>;
  aggregate<T extends Prisma.UserAggregateArgs>(args: Prisma.SelectSubset<T, Prisma.UserAggregateArgs>): Promise<Prisma.GetUserAggregateType<T>>;

  findByEmail(email: string, include?: Prisma.UserInclude): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string, include?: Prisma.UserInclude): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
  softDelete(id: string, deletedBy?: string): Promise<User>;
  restore(id: string): Promise<User>;
}