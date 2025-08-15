import Joi from 'joi';

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt',
      'any.required': 'Mật khẩu là bắt buộc',
    }),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(nameRegex)
    .required()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên phải không vượt quá 50 ký tự',
      'string.pattern.base': 'Tên chỉ có thể chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu nháy đơn',
      'any.required': 'Tên là bắt buộc',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(nameRegex)
    .required()
    .messages({
      'string.min': 'Họ phải có ít nhất 2 ký tự',
      'string.max': 'Họ phải không vượt quá 50 ký tự',
      'string.pattern.base': 'Họ chỉ có thể chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu nháy đơn',
      'any.required': 'Họ là bắt buộc',
    }),

  phoneNumber: Joi.string()
    .pattern(phoneRegex)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Vui lòng nhập số điện thoại hợp lệ',
    }),

  address: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Địa chỉ không được vượt quá 500 ký tự',
    }),

  birthday: Joi.date()
    .max('now')
    .min('1900-01-01')
    .optional()
    .messages({
      'date.max': 'Ngày sinh không được ở tương lai',
      'date.min': 'Ngày sinh không được trước năm 1900',
    }),

  gender: Joi.string()
    .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
    .optional()
    .messages({
      'any.only': 'Giới tính phải là một trong các giá trị: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu là bắt buộc',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc',
    }),

  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt',
      'any.required': 'Mật khẩu mới là bắt buộc',
    }),
});

export const passwordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
});

export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token là bắt buộc',
    }),

  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt',
      'any.required': 'Mật khẩu mới là bắt buộc',
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token là bắt buộc',
    }),
});