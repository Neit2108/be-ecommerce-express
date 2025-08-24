import Joi from 'joi';
import { UploadFolder } from '../types/upload.types';

const cloudinaryTransformationSchema = Joi.object({
  width: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': 'Chiều rộng phải là số',
      'number.min': 'Chiều rộng phải lớn hơn 0',
    }),
  height: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': 'Chiều cao phải là số',
      'number.min': 'Chiều cao phải lớn hơn 0',
    }),
  crop: Joi.string()
    .valid('fill', 'fit', 'scale', 'crop', 'thumb', 'limit', 'mfit', 'mpad')
    .messages({
      'any.only': 'Crop phải là một trong các giá trị: fill, fit, scale, crop, thumb, limit, mfit, mpad',
    }),
  quality: Joi.alternatives().try(
    Joi.string().valid('auto'),
    Joi.number().integer().min(1).max(100)
  ),
  format: Joi.string()
    .valid('auto', 'jpg', 'png', 'webp')
    .messages({
      'any.only': 'Format phải là auto, jpg, png hoặc webp',
    }),
  gravity: Joi.string()
    .valid('auto', 'face', 'center', 'north', 'south', 'east', 'west')
    .messages({
      'any.only': 'Gravity phải là auto, face, center, north, south, east, west',
    }),
});

export const uploadOptionsSchema = Joi.object({
  folder: Joi.string()
    .valid(...Object.values(UploadFolder))
    .required()
    .messages({
      'any.required': 'Folder là bắt buộc',
      'any.only': 'Folder không hợp lệ',
    }),

  userId: Joi.string()
    .when('folder', {
      is: UploadFolder.USERS,
      then: Joi.required().messages({ 'any.required': 'userId là bắt buộc khi folder = users' }),
      otherwise: Joi.optional(),
    }),

  shopId: Joi.string()
    .when('folder', {
      is: UploadFolder.SHOPS,
      then: Joi.required().messages({ 'any.required': 'shopId là bắt buộc khi folder = shops' }),
      otherwise: Joi.optional(),
    }),

  productId: Joi.string()
    .when('folder', {
      is: UploadFolder.PRODUCTS,
      then: Joi.required().messages({ 'any.required': 'productId là bắt buộc khi folder = products' }),
      otherwise: Joi.optional(),
    }),

  maxFileSize: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'maxFileSize phải là số',
      'number.min': 'maxFileSize phải lớn hơn 0',
    }),

  allowedMimeTypes: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.base': 'allowedMimeTypes phải là mảng chuỗi',
    }),

  transformation: cloudinaryTransformationSchema.optional(),

  generateThumbnail: Joi.boolean().optional(),
});
