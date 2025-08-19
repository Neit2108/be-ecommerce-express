import { Request, Response, NextFunction } from 'express';
import { addProductImagesSchema, addProductOptionsSchema, addProductVariantsSchema, createDraftProductSchema, updateProductStatusSchema } from '../validators/product.validators';
import { ValidationError } from '../errors/AppError';
import { productService } from '../config/container';
import { ApiResponse } from '../types/common';
import { addProductCategoriesSchema } from '../validators/category.validator';

export class ProductController {

  findById = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;

    if (!productId) {
      throw new ValidationError('Product ID is required');
    }

    const product = await productService.findById(productId);
    if (!product) {
      throw new ValidationError('Product not found');
    }

    const response: ApiResponse = {
      success: true,
      data: product,
      message: 'Lấy thành công product',
    };

    res.json(response);
  }

  createDraftProduct = async (req: Request, res: Response): Promise<void> => {
    // try {
      const { error, value } = createDraftProductSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      const result = await productService.createDraftProduct(value, userId);
      console.log('Đã tạo thành công draft', result);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Tạo sản phẩm nháp thành công',
      };

      res.json(response);
    // } catch (err) {
    //   const response: ApiResponse = {
    //     success: false,
    //     data: null,
    //     message:
    //       err instanceof ValidationError
    //         ? err.message
    //         : 'Internal server error',
    //   };
    //   res.status(400).json(response);
    // }
  };

  addCategoriesToProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError('Product ID is required');
      }

      const { error, value } = addProductCategoriesSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      var result = await productService.addCategoriesToProduct(productId, value, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Thêm danh mục vào sản phẩm thành công',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message:
          error instanceof ValidationError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Internal server error',
      };
      res.status(400).json(response);
    }
  };

  addOptionsToProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    // try {
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError('Product ID is required');
      }

      const { error, value } = addProductOptionsSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      var result = await productService.addOptionsToProduct(productId, value, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Thêm tùy chọn vào sản phẩm thành công',
      };

      res.status(200).json(response);
    // } catch (error) {
    //   const response: ApiResponse = {
    //     success: false,
    //     data: null,
    //     message:
    //       error instanceof ValidationError
    //         ? error.message
    //         : 'Internal server error',
    //   };
    //   res.status(400).json(response);
    // }
  }

  addVariantsToProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError('Product ID is required');
      }

      const { error, value } = addProductVariantsSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      var result = await productService.addVariantsToProduct(productId, value, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Thêm biến thể vào sản phẩm thành công',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message:
          error instanceof ValidationError
            ? error.message
            : 'Internal server error',
      };
      res.status(400).json(response);
    }
  };

  addImagesToProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError('Product ID is required');
      }
      const { error, value } = addProductImagesSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      var result = await productService.addImagesToProduct(productId, value, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Thêm hình ảnh vào sản phẩm thành công',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message:
          error instanceof ValidationError
            ? error.message
            : 'Internal server error',
      };
      res.status(400).json(response);
    }
  };

  updateProductStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError('Product ID is required');
      }
      const { error, value } = updateProductStatusSchema.validate(req.body);
      if (error) {
        throw new ValidationError(
          error.details?.[0]?.message || 'Validation error'
        );
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User chưa đăng nhập');
      }

      var result = await productService.updateProductStatus(productId, value, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Cập nhật trạng thái sản phẩm thành công',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message:
          error instanceof ValidationError
            ? error.message
            : 'Internal server error',
      };
      res.status(400).json(response);
    }
  }

}

export const productController = new ProductController();