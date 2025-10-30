import redis from "../config/redis";
import { IUnitOfWork } from "../repositories/interfaces/uow.interface";
import { CategoryResponse } from "../types/category.types";
import { CacheUtil } from "../utils/cache.util";

export class CategoryService {
  constructor(private uow: IUnitOfWork) {}

  async getCategories(name?: string): Promise<CategoryResponse[]> {
    const cacheKey = CacheUtil.categoriesByName(name || '');
    const cacheResult = await redis.get(cacheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    return this.uow.executeInTransaction(async (uow) => {
      const categories = await uow.categories.searchByName(name || '');
      return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description ?? '',
      }));
    });
  }
}
