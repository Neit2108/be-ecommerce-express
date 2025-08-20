import { NotFoundError, ValidationError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import {
  CheckKycInput,
  CheckKycResponse,
  CreateDraftShopInput,
  DraftShopResponse,
  SetBankAccountInput,
  ShopResponse,
} from '../types/shop.types';
import { DateUtils } from '../utils/date.util';

export class ShopService {
  constructor(private uow: IUnitOfWork) {}

  async createDraftShop(
    data: CreateDraftShopInput,
    createdBy: string
  ): Promise<DraftShopResponse> {
    const user = this.uow.users.findById(createdBy);
    if (!user) throw new NotFoundError(`User : ${createdBy}`);
    const isUserVerified = await this.uow.users.isVerified(createdBy);
    if (!isUserVerified)
      throw new ValidationError(`User : ${createdBy} chưa được xác thực`);
    const existingShop = await this.uow.shops.findByOwnerId(createdBy);
    if (existingShop)
      throw new ValidationError(`User : ${createdBy} đã có cửa hàng`);

    const shop = await this.uow.shops.create({
      owner: { connect: { id: createdBy } },
      name: data.name,
      category: data.category ?? null,
      logoUrl: data.logoUrl ?? null,
      street: data.street ?? null,
      ward: data.ward ?? null,
      district: data.district ?? null,
      city: data.city ?? null,
      country: data.country ?? 'Vietnamese',
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      createdAt: DateUtils.now(),
      createdBy: createdBy
    });

    return {
      id: shop.id,
      name: shop.name,
    };
  }

  async setBankAccount(
    shopId: string,
    data: SetBankAccountInput,
    updatedBy: string
  ): Promise<ShopResponse> {
    const user = this.uow.users.findById(updatedBy);
    if (!user) throw new NotFoundError(`User : ${updatedBy}`);
    const isUserVerified = await this.uow.users.isVerified(updatedBy);
    if (!isUserVerified)
      throw new ValidationError(`User : ${updatedBy} chưa được xác thực`);

    const shop = await this.uow.shops.findById(shopId);
    if (!shop) throw new NotFoundError(`Shop : ${shopId}`);

    const updatedShop = await this.uow.shops.update(shopId, {
      taxCode: data.taxCode,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      accountNumber: data.accountNumber,
      updatedAt: DateUtils.now(),
      updatedBy: updatedBy
    });

    return {
      id: updatedShop.id,
      name: updatedShop.name,
    };
  }

  async checkKyc(shopId: string, data: CheckKycInput): Promise<CheckKycResponse> {
    
  }
}
