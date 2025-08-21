import { Shop, ApprovalStatus, ShopStatus, KycStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import {
  CreateDraftShopInput,
  KycResponse,
  ShopResponse,
  SubmitKycInput,
  UpdateBankAccountInput,
} from '../types/shop.types';

import { DateUtils } from '../utils/date.util';
import { PaginationParams } from '../types/common';

export class ShopService {
  constructor(private uow: IUnitOfWork) {}

  async createDraftShop(
    data: CreateDraftShopInput,
    createdBy: string
  ): Promise<ShopResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const user = await uow.users.findById(createdBy);
      if (!user) {
        throw new NotFoundError('User với id : ' + createdBy);
      }

      const existingShop = await uow.shops.findByOwnerId(createdBy);
      if (existingShop) {
        throw new ValidationError(
          'Người dùng đã có một cửa hàng. Vui lòng cập nhật cửa hàng hiện tại.'
        );
      }

      const shop = await uow.shops.create({
        name: data.name,
        owner: { connect: { id: createdBy } },
        status: ShopStatus.DRAFT,
        approvalStatus: ApprovalStatus.PENDING_APPROVAL,
        category: data.category ?? null,
        email: data.email ?? null,
        phoneNumber: data.phoneNumber ?? null,
        logoUrl: data.logoUrl ?? null,
        street: data.street ?? null,
        ward: data.ward ?? null,
        district: data.district ?? null,
        city: data.city ?? null,
        createdBy: createdBy,
        updatedBy: createdBy,
      });

      return {
        id: shop.id,
        name: shop.name,
        category: shop.category,
        logoUrl: shop.logoUrl,
      } as ShopResponse;
    });
  }

  async updateBankAccount(
    shopId: string,
    data: UpdateBankAccountInput,
    updatedBy: string
  ): Promise<ShopResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const shop = await uow.shops.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Cửa hàng với id: ' + shopId);
      }
      if (shop.ownerId !== updatedBy) {
        throw new ValidationError(
          'Bạn không có quyền cập nhật thông tin ngân hàng của cửa hàng này.'
        );
      }

      const updatedShop = await uow.shops.update(shopId, {
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankAccountNumber: data.accountNumber,
        updatedBy: updatedBy,
        updatedAt: DateUtils.now(),
      });

      return {
        id: updatedShop.id,
        name: updatedShop.name,
        category: updatedShop.category,
        logoUrl: updatedShop.logoUrl,
      } as ShopResponse;
    });
  }

  async submitKyc(
    shopId: string,
    data: SubmitKycInput,
    updatedBy: string
  ): Promise<KycResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const shop = await uow.shops.findById(shopId);
      if (!shop) {
        throw new NotFoundError('Cửa hàng với id: ' + shopId);
      }
      if (shop.ownerId !== updatedBy) {
        throw new ValidationError(
          'Bạn không có quyền gửi KYC cho cửa hàng này.'
        );
      }

      const kycData = await uow.kycDatas.create({
        user: { connect: { id: updatedBy } },
        shop: { connect: { id: shopId } },
        status: KycStatus.PENDING,
        submittedAt: new Date(),

        // Personal info
        fullName: data.fullName,
        birthday: data.birthday,
        personalAddress: data.personalAddress,
        personalPhone: data.personalPhone,
        personalEmail: data.personalEmail,
        identityCard: data.identityCard,

        // Shop info
        shopName: data.shopName,
        taxCode: data.taxCode ?? null,
        shopAddress: data.shopAddress ?? null,
        shopPhone: data.shopPhone ?? null,
        shopEmail: data.shopEmail ?? null,
        shopRegDate: data.shopRegDate ?? null,
      });

      for (const doc of data.documents) {
        await uow.kycDocuments.create({
          kycDataId: kycData.id,
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
        });
      }

      await uow.shops.updateApprovalStatus(shopId, ApprovalStatus.PENDING_KYC);
      await uow.shops.updateCurrentKyc(shopId, kycData.id);

      await uow.kycDatas.addHistoryEntry(kycData.id, 'SUBMIT', {
        submittedBy: updatedBy,
        documentsCount: data.documents.length,
      });

      return {} as KycResponse;
    });
  }

  async submitForApproval(
    shopId: string,
    userId: string
  ): Promise<ShopResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const shop = await uow.shops.findById(shopId, { currentKyc: true });
      if (!shop) {
        throw new NotFoundError('Shop với id : ' + shopId);
      }
      if (shop.ownerId !== userId) {
        throw new ValidationError('Bạn không có quyền của cửa hàng này');
      }

      if (!shop.currentKyc || shop.currentKyc.status !== KycStatus.APPROVED) {
        throw new ValidationError('Cần đính kèm tài liệu trước khi gửi');
      }

      const updatedShop = await uow.shops.updateApprovalStatus(
        shopId,
        ApprovalStatus.REVIEWING
      );

      return {
        id: shop.id,
        name: shop.name,
      } as ShopResponse;
    });
  }

  async approveShop(
    shopId: string,
    approvedBy: string,
    autoActivate: boolean = true
  ): Promise<ShopResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const shop = await uow.shops.findById(shopId, { currentKyc: true });
      if (!shop) {
        throw new NotFoundError('Shop với id : ' + shopId);
      }

      if (!shop.currentKyc || shop.currentKyc.status !== KycStatus.APPROVED) {
        throw new ValidationError('Phải được xác thực Kyc trước');
      }

      const updatedShop = await uow.shops.updateApprovalStatus(
        shopId,
        ApprovalStatus.APPROVED,
        approvedBy
      );

      if (autoActivate) {
        await uow.shops.activate(shopId);
      }

      return {} as ShopResponse;
    });
  }

  async rejectShop(
    shopId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<ShopResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const updatedShop = await uow.shops.updateApprovalStatus(
        shopId,
        ApprovalStatus.REJECTED,
        rejectedBy,
        rejectionReason
      );

      return {} as ShopResponse;
    });
  }
}
