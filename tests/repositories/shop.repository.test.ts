import { PrismaClient, Shop, ShopStatus } from '@prisma/client';
import { ShopRepository } from '../../src/repositories/implements/shop.repository';

// Mock PrismaClient
const prismaMock = {
  shop: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ShopRepository', () => {
  let repo: ShopRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ShopRepository(prismaMock);
  });

  describe('create', () => {
    it('tạo shop thành công', async () => {
      const fakeShop = { id: '1', name: 'Shop A' } as Shop;
      (prismaMock.shop.create as jest.Mock).mockResolvedValue(fakeShop);

      const result = await repo.create({ name: 'Shop A', ownerId: 'o1' } as any);
      expect(prismaMock.shop.create).toHaveBeenCalledWith({
        data: { name: 'Shop A', ownerId: 'o1' },
      });
      expect(result).toEqual(fakeShop);
    });

    it('ném lỗi khi tạo shop thất bại', async () => {
      (prismaMock.shop.create as jest.Mock).mockRejectedValue(new Error('Lỗi DB'));
      await expect(repo.create({ name: 'X' } as any)).rejects.toThrow('Lỗi DB');
    });
  });

  describe('findById', () => {
    it('tìm shop theo id thành công', async () => {
      const fakeShop = { id: '2' } as Shop;
      (prismaMock.shop.findUnique as jest.Mock).mockResolvedValue(fakeShop);

      const result = await repo.findById('2');
      expect(prismaMock.shop.findUnique).toHaveBeenCalledWith({ where: { id: '2' } });
      expect(result).toEqual(fakeShop);
    });

    it('trả về null nếu không tìm thấy', async () => {
      (prismaMock.shop.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repo.findById('404');
      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('tìm shop theo ownerId', async () => {
      const fakeShop = { id: '3', ownerId: 'o1' } as Shop;
      (prismaMock.shop.findUnique as jest.Mock).mockResolvedValue(fakeShop);

      const result = await repo.findByOwnerId('o1');
      expect(prismaMock.shop.findUnique).toHaveBeenCalledWith({
        where: { ownerId: 'o1', deletedAt: null },
      });
      expect(result).toEqual(fakeShop);
    });
  });

  describe('update', () => {
    it('cập nhật shop thành công', async () => {
      const fakeShop = { id: '4', name: 'Updated' } as Shop;
      (prismaMock.shop.update as jest.Mock).mockResolvedValue(fakeShop);

      const result = await repo.update('4', { name: 'Updated' } as any);
      expect(prismaMock.shop.update).toHaveBeenCalledWith({
        where: { id: '4' },
        data: expect.objectContaining({
          name: 'Updated',
          updatedAt: expect.any(Date),
        }),
      });
      expect(result).toEqual(fakeShop);
    });
  });

  describe('softDelete', () => {
    it('xóa mềm shop (set deletedAt, deletedBy)', async () => {
      (prismaMock.shop.update as jest.Mock).mockResolvedValue({} as any);

      await repo.softDelete('5', 'admin');
      expect(prismaMock.shop.update).toHaveBeenCalledWith({
        where: { id: '5' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          deletedBy: 'admin',
          updatedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('findMany', () => {
    it('lọc, phân trang, sắp xếp danh sách shop', async () => {
      const fakeShops = [{ id: '6', name: 'ShopZ' }] as Shop[];
      (prismaMock.shop.findMany as jest.Mock).mockResolvedValue(fakeShops);

      const result = await repo.findMany({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        status: ShopStatus.ACTIVE,
        city: 'Hanoi',
      });

      expect(prismaMock.shop.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
          status: ShopStatus.ACTIVE,
          city: { contains: 'Hanoi', mode: 'insensitive' },
        }),
        orderBy: { name: 'asc' },
        skip: 5,
        take: 5,
      });
      expect(result).toEqual(fakeShops);
    });
  });

  describe('count', () => {
    it('đếm số shop theo bộ lọc', async () => {
      (prismaMock.shop.count as jest.Mock).mockResolvedValue(42);
      const result = await repo.count({ status: ShopStatus.INACTIVE, name: 'Cafe' });
      expect(prismaMock.shop.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
          status: ShopStatus.INACTIVE,
          name: { contains: 'Cafe', mode: 'insensitive' },
        }),
      });
      expect(result).toBe(42);
    });
  });

  describe('countByStatus', () => {
    it('đếm số shop theo status', async () => {
      (prismaMock.shop.count as jest.Mock).mockResolvedValue(10);
      const result = await repo.countByStatus(ShopStatus.ACTIVE);
      expect(prismaMock.shop.count).toHaveBeenCalledWith({
        where: { status: ShopStatus.ACTIVE, deletedAt: null },
      });
      expect(result).toBe(10);
    });
  });
});
