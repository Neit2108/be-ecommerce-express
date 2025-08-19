import Joi from "joi";

export const addProductCategoriesSchema = Joi.object({
    categoryIds: Joi.array()
    .items(Joi.string().uuid().messages({
      'string.uuid': 'Category ID phải là UUID hợp lệ'
    }))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'Ít nhất 1 danh mục là bắt buộc',
      'array.max': 'Tối đa 10 danh mục được phép',
      'any.required': 'ID danh mục là bắt buộc'
    })
});