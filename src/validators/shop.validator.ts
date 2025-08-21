import Joi, { object } from 'joi';
import {
  CreateDraftShopInput,
  UpdateBankAccountInput,
} from '../types/shop.types';
import { DocumentType } from '@prisma/client';

export const createDraftShopSchema = Joi.object<CreateDraftShopInput>({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Tên cửa hàng không được để trống',
    'string.min': 'Tên cửa hàng phải có ít nhất 3 ký tự',
    'string.max': 'Tên cửa hàng không được vượt quá 100 ký tự',
  }),

  category: Joi.string().trim().max(50).optional().messages({
    'string.empty': 'Danh mục không được để trống',
    'string.max': 'Danh mục không được vượt quá 50 ký tự',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
  }),
  phoneNumber: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),
  logoUrl: Joi.string().uri().optional().messages({
    'string.uri': 'URL logo không hợp lệ',
  }),
  street: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Địa chỉ đường không được vượt quá 100 ký tự',
  }),
  ward: Joi.string().trim().max(50).optional().messages({
    'string.max': 'Phường/xã không được vượt quá 50 ký tự',
  }),
  district: Joi.string().trim().max(50).optional().messages({
    'string.max': 'Quận/huyện không được vượt quá 50 ký tự',
  }),
  city: Joi.string().trim().max(50).optional().messages({
    'string.max': 'Thành phố không được vượt quá 50 ký tự',
  }),
});

export const updateBankAccountSchema = Joi.object<UpdateBankAccountInput>({
  accountNumber: Joi.string().trim().required().messages({
    'string.empty': 'Số tài khoản không được để trống',
  }),
  bankName: Joi.string().trim().required().messages({
    'string.empty': 'Tên ngân hàng không được để trống',
  }),
  bankAccount: Joi.string().trim().required().messages({
    'string.empty': 'Tên tài khoản ngân hàng không được để trống',
  }),

  taxCode: Joi.string().trim().max(20).optional().messages({
    'string.max': 'Mã số thuế không được vượt quá 20 ký tự',
  }),
}).messages({
  'object.base': 'Thông tin tài khoản ngân hàng không hợp lệ',
  'object.empty': 'Thông tin tài khoản ngân hàng không được để trống',
});

const documentSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(DocumentType))
    .required()
    .messages({
      'any.only': 'Loại tài liệu không hợp lệ.',
      'any.required': 'Loại tài liệu là bắt buộc.',
    }),
  fileName: Joi.string().trim().max(255).required().messages({
    'any.required': 'Tên file là bắt buộc.',
    'string.base': 'Tên file phải là chuỗi.',
    'string.max': 'Tên file tối đa {#limit} ký tự.',
  }),
  fileUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .messages({
      'any.required': 'Đường dẫn file là bắt buộc.',
      'string.uri': 'Đường dẫn file phải là URL hợp lệ (http/https).',
    }),
  fileSize: Joi.number().min(0).optional().messages({
    'number.base': 'Dung lượng file phải là số.',
    'number.min': 'Dung lượng file không được âm.',
  }),
  mimeType: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Định dạng MIME phải là chuỗi.',
    'string.max': 'Định dạng MIME tối đa {#limit} ký tự.',
  }),
}).messages({
  'object.base': 'Tài liệu không hợp lệ',
});

export const submitKycSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Họ và tên không được để trống',
    'string.min': 'Họ và tên phải có ít nhất 3 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự',
  }),
  birthday: Joi.date().required().messages({
    'date.base': 'Ngày sinh không hợp lệ',
    'date.empty': 'Ngày sinh không được để trống',
  }),
  personalAddress: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Địa chỉ thường trú không được để trống',
    'string.max': 'Địa chỉ thường trú không được vượt quá 200 ký tự',
  }),
  personalPhone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),
  personalEmail: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
  }),
  identityCard: Joi.string()
    .pattern(/^\d{9,12}$/)
    .required()
    .messages({
      'string.empty': 'Số CMND/CCCD không được để trống',
      'string.pattern.base': 'Số CMND/CCCD không hợp lệ',
    }),

  shopName: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Tên cửa hàng không được để trống',
    'string.min': 'Tên cửa hàng phải có ít nhất 3 ký tự',
    'string.max': 'Tên cửa hàng không được vượt quá 100 ký tự',
  }),
  taxCode: Joi.string().trim().max(20).optional().messages({
    'string.max': 'Mã số thuế không được vượt quá 20 ký tự',
  }),
  shopAddress: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Địa chỉ cửa hàng không được để trống',
    'string.max': 'Địa chỉ cửa hàng không được vượt quá 200 ký tự',
  }),
  shopPhone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Số điện thoại cửa hàng không được để trống',
      'string.pattern.base': 'Số điện thoại cửa hàng không hợp lệ',
    }),
  shopEmail: Joi.string().email().required().messages({
    'string.empty': 'Email cửa hàng không được để trống',
    'string.email': 'Email cửa hàng không hợp lệ',
  }),
  shopRegDate: Joi.date().required().messages({
    'date.base': 'Ngày đăng ký cửa hàng không hợp lệ',
    'date.empty': 'Ngày đăng ký cửa hàng không được để trống',
  }),
  documents: Joi.array().items(documentSchema).min(1).required().messages({
    'any.required': 'Danh sách tài liệu là bắt buộc.',
    'array.base': 'Danh sách tài liệu phải là mảng.',
    'array.min': 'Cần ít nhất {#limit} tài liệu.',
  }),
}).messages({
  'object.base': 'Thông tin KYC không hợp lệ',
  'object.empty': 'Thông tin KYC không được để trống',
});
