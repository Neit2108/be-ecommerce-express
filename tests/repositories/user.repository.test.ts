import { PrismaClient, User, UserStatus } from '@prisma/client';
import { UserRepository } from '../../src/repositories/implements/user.repository';
import { DatabaseError } from '../../src/errors/AppError';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
} as unknown as PrismaClient;

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks(); // reset mock mỗi test
    repo = new UserRepository(prismaMock);
  });

  it('findById phải trả về user', async () => {
    const fakeUser = { id: '1', email: 'test@example.com' } as User;
    prismaMock.user.findUnique = jest.fn().mockResolvedValue(fakeUser);

    const result = await repo.findById('1');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: null,
    });
    expect(result).toEqual(fakeUser);
  });

  it('create phải thêm thành công một user mới', async () => {
    const fakeUser = { id: '2', email: 'new@example.com' } as User;
    prismaMock.user.create = jest.fn().mockResolvedValue(fakeUser);

    const result = await repo.create({ email: 'new@example.com', name: 'test' } as any);
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(result).toEqual(fakeUser);
  });

  it('softDelete phải cập nhật trạng thái user thành SUSPENDED', async () => {
    const fakeUser = { id: '3', status: UserStatus.SUSPENDED } as User;
    prismaMock.user.update = jest.fn().mockResolvedValue(fakeUser);

    const result = await repo.softDelete('3', 'admin');
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '3' },
      data: expect.objectContaining({
        status: UserStatus.SUSPENDED,
        deletedBy: 'admin',
        deletedAt: expect.any(Date),
      }),
    });
    expect(result.status).toBe(UserStatus.SUSPENDED);
  });

  it('Phải ném DatabaseError khi prisma ném lỗi không phải là Prisma', async () => {
    prismaMock.user.findUnique = jest.fn().mockRejectedValue(new Error('DB crashed'));

    await expect(repo.findById('x')).rejects.toThrow(DatabaseError);
  });
});
