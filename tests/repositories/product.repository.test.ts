import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '../../src/repositories/implements/product.repository';

const prismaMock = {
    product: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn()
    },
    productImage: {
        createMany: jest.fn(),
        updateMany: jest.fn()
    },
    productOption: {
        create: jest.fn(),
        updateMany: jest.fn()
    },
    productOptionValue: {
        createMany: jest.fn(),
        updateMany: jest.fn()
    }
} as unknown as PrismaClient;

describe('ProductRepository', () => {
  let repo: ProductRepository;

  beforeEach(() => {
    repo = new ProductRepository(prismaMock as any);
    jest.clearAllMocks();
  });

  it('create product', async () => {
    const fakeProduct = { id: '1', name: 'Demo' } as any;
    (prismaMock.product.create as jest.Mock).mockResolvedValue(fakeProduct);

    const result = await repo.create({ name: 'Demo' } as any);
    expect(result).toEqual(fakeProduct);
    expect(prismaMock.product.create).toHaveBeenCalledWith({ data: { name: 'Demo' } });
  });

  it('findById with includes', async () => {
    const fakeProduct = { id: '1', name: 'Demo' } as any;
    (prismaMock.product.findFirst as jest.Mock).mockResolvedValue(fakeProduct);

    const result = await repo.findById('1', { images: true });
    expect(result).toEqual(fakeProduct);
    expect(prismaMock.product.findFirst).toHaveBeenCalled();
  });

  it('update product', async () => {
    const fakeProduct = { id: '1', name: 'Updated' } as any;
    (prismaMock.product.update as jest.Mock).mockResolvedValue(fakeProduct);

    const result = await repo.update('1', { name: 'Updated' });
    expect(result).toEqual(fakeProduct);
    expect(prismaMock.product.update).toHaveBeenCalled();
  });

  it('softDelete product', async () => {
    (prismaMock.product.update as jest.Mock).mockResolvedValue({} as any);
    await repo.softDelete('1', 'user1');
    expect(prismaMock.product.update).toHaveBeenCalled();
  });

  it('findMany products', async () => {
    const fakeList = [{ id: '1' }] as any;
    (prismaMock.product.findMany as jest.Mock).mockResolvedValue(fakeList);

    const result = await repo.findMany({ page: 1, limit: 10 });
    expect(result).toEqual(fakeList);
    expect(prismaMock.product.findMany).toHaveBeenCalled();
  });

  it('addImages', async () => {
    (prismaMock.productImage.createMany as jest.Mock).mockResolvedValue({} as any);
    await repo.addImages('1', [{ url: 'img.jpg' } as any], 'user1');
    expect(prismaMock.productImage.createMany).toHaveBeenCalled();
  });

  it('removeImages', async () => {
    (prismaMock.productImage.updateMany as jest.Mock).mockResolvedValue({} as any);
    await repo.removeImages('1', ['img1'], 'user1');
    expect(prismaMock.productImage.updateMany).toHaveBeenCalled();
  });

  it('setPrimaryImage', async () => {
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
    (prismaMock.productImage.updateMany as jest.Mock).mockResolvedValue({} as any);
    (prismaMock.productImage.update as jest.Mock).mockResolvedValue({} as any);

    await repo.setPrimaryImage('1', 'img1');
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.productImage.updateMany).toHaveBeenCalled();
    expect(prismaMock.productImage.update).toHaveBeenCalled();
  });

  it('addOptions with values', async () => {
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
    (prismaMock.productOption.create as jest.Mock).mockResolvedValue({ id: 'opt1' } as any);
    (prismaMock.productOptionValue.createMany as jest.Mock).mockResolvedValue({} as any);

    await repo.addOptions('1', [
      { name: 'Color', values: [{ value: 'Red' }] }
    ], 'user1');

    expect(prismaMock.productOption.create).toHaveBeenCalled();
    expect(prismaMock.productOptionValue.createMany).toHaveBeenCalled();
  });

  it('removeOptions', async () => {
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (cb) => cb(prismaMock));
    (prismaMock.productOptionValue.updateMany as jest.Mock).mockResolvedValue({} as any);
    (prismaMock.productOption.updateMany as jest.Mock).mockResolvedValue({} as any);

    await repo.removeOptions('1', ['opt1'], 'user1');
    expect(prismaMock.productOptionValue.updateMany).toHaveBeenCalled();
    expect(prismaMock.productOption.updateMany).toHaveBeenCalled();
  });

  it('addOptionValues', async () => {
    (prismaMock.productOptionValue.createMany as jest.Mock).mockResolvedValue({} as any);
    await repo.addOptionValues('opt1', [{ value: 'XL' }], 'user1');
    expect(prismaMock.productOptionValue.createMany).toHaveBeenCalled();
  });

  it('removeOptionValues', async () => {
    (prismaMock.productOptionValue.updateMany as jest.Mock).mockResolvedValue({} as any);
    await repo.removeOptionValues('opt1', ['val1'], 'user1');
    expect(prismaMock.productOptionValue.updateMany).toHaveBeenCalled();
  });

  it('updateAverageRating', async () => {
    (prismaMock.product.update as jest.Mock).mockResolvedValue({} as any);
    await repo.updateAverageRating('1', 4.5, 10);
    expect(prismaMock.product.update).toHaveBeenCalled();
  });

  it('count products', async () => {
    (prismaMock.product.count as jest.Mock).mockResolvedValue(5);
    const result = await repo.count();
    expect(result).toBe(5);
    expect(prismaMock.product.count).toHaveBeenCalled();
  });

  it('countByShop', async () => {
    (prismaMock.product.count as jest.Mock).mockResolvedValue(3);
    const result = await repo.countByShop('shop1');
    expect(result).toBe(3);
    expect(prismaMock.product.count).toHaveBeenCalled();
  });
});
