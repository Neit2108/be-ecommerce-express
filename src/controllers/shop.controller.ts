import { Request, Response } from 'express';
import { ValidationError } from '../errors/AppError';
import { shopService } from '../config/container';
import { createDraftShopSchema, submitKycSchema, updateBankAccountSchema } from '../validators/shop.validator';
import { ApiResponse } from '../types/common';

export class ShopController {
  createDraftShop = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = createDraftShopSchema.validate(req.body);

    if (error) {
      throw new ValidationError(
        error.details?.[0]?.message || 'Validation error'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Không tìm thấy user');
    }

    const result = await shopService.createDraftShop(value, userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Tạo cửa hàng nháp thành công',
    };

    res.json(response);
  };

  updateBankAccount = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = updateBankAccountSchema.validate(req.body);

    if (error) {
      throw new ValidationError(
        error.details?.[0]?.message || 'Validation error'
      );
    }

    const { shopId } = req.params;
    if (!shopId) {
      throw new ValidationError('Không tìm thấy cửa hàng');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Không tìm thấy user');
    }

    const result = await shopService.updateBankAccount(shopId, value, userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Cập nhật thông tin tài khoản ngân hàng thành công',
    };

    res.json(response);
  };

  submitKyc = async (req: Request, res: Response): Promise<void> => {
    const { error, value } = submitKycSchema.validate(req.body);

    if (error) {
      throw new ValidationError(
        error.details?.[0]?.message || 'Validation error'
      );
    }
    const { shopId } = req.params;
    if (!shopId) {
      throw new ValidationError('Không tìm thấy cửa hàng');
    }
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Không tìm thấy user');
    }

    const result = await shopService.submitKyc(shopId, value, userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Gửi thông tin KYC thành công',
    };

    res.json(response);
  };

  submitForApproval = async (req: Request, res: Response): Promise<void> => {
    const { shopId } = req.params;
    if (!shopId) {
      throw new ValidationError('Không tìm thấy cửa hàng');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Không tìm thấy user');
    }

    const result = await shopService.submitForApproval(shopId, userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Gửi yêu cầu phê duyệt thành công',
    };

    res.json(response);
  }
}

export const shopController = new ShopController();
