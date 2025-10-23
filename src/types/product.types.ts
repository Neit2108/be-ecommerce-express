import { Prisma, ProductStatus } from '@prisma/client';
import { PaginationParams } from './common';

export interface ProductIncludes {
  shop?: boolean;
  variants?: boolean;
  images?: boolean;
  options?: boolean;
  categories?: boolean;
}

export interface VariantIncludes {
  product?: boolean;
  images?: boolean;
  optionValues?: boolean;
}

export interface ProductFilters extends PaginationParams {
  status?: ProductStatus;
  categoryId?: string;
  searchTerm?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'createdAt' | 'price' | 'name';
}

export interface VariantFilters extends PaginationParams {
  productId?: string;
  status?: ProductStatus;
  searchTerm?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface ProductResponse {
  id: string;
  name: string;
  shopId: string;
  status: ProductStatus;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface CreateProductOptionData {
  name: string;
  values?: CreateProductOptionValueData[];
}

export interface CreateProductOptionValueData {
  value: string;
  sortOrder?: number;
}

export interface VariantOptionValueMapping {
  optionId: string;
  optionValueId: string;
}

export interface BatchUpdateVariantData {
  id: string;
  data: Prisma.ProductVariantUpdateInput;
}

//   imageUrl: string;
//   isPrimary?: boolean;
//   sortOrder?: number;
//   description?: string;
// }

// export interface CreateProductOptionValueInput {
//   value: string;
//   sortOrder?: number;
// }

// export interface CreateProductOptionInput {
//   name: string;
//   values: CreateProductOptionValueInput[];
// }

// export interface CreateProductVariantInput {
//   name: string;
//   value: string;
//   price: number;
//   currency?: string;
//   description?: string;
//   images?: CreateProductImageInput[];
//   optionValues?: { optionName: string; value: string }[];
// }

// export interface CreateProductInput {
//   name: string;
//   shopId: string;
//   // status?: ProductStatus;
//   categoryIds?: string[];
//   images: CreateProductImageInput[];
//   variants: CreateProductVariantInput[];
//   option?: CreateProductOptionInput[];
// }

// export interface CreateProductResponse {
//   id: string;
//   name: string;
//   shopId: string;
//   status: ProductStatus;
//   averageRating: number;
//   reviewCount: number;
//   createdAt: Date;
//   variants: {
//     id: string;
//     name: string;
//     value: string;
//     price: number;
//     currency: string;
//     sku: string;
//   }[];
//   images: {
//     id: string;
//     imageUrl: string;
//     isPrimary: boolean;
//     sortOrder: number;
//   }[];
// }

//category
export interface AddProductCategoriesInput {
  categoryIds: string[];
}

export interface ProductCategoriesResponse{
  productId: string;
  categories:{
    id: string;
    name: string;
    description?: string;
  }[];
}

//product
export interface CreateDraftProductInput{
  name: string;
  shopId: string;
  description?: string;
}

export interface DraftProductResponse{
  id: string;
  name: string;
  shopId: string;
  status: ProductStatus;
  description?: string;
  createdAt: Date;
}

// option
export interface CreateProductOptionValueInput{
  value: string;
  sortOrder?: number;
}

export interface CreateProductOptionInput{
  name: string;
  values: CreateProductOptionValueInput[];
}

export interface AddProductOptionsInput{
  // productId: string;
  options: CreateProductOptionInput[];
}

export interface ProductOptionsResponse {
  productId: string;
  options: {
    id: string;
    name: string;
    values: {
      id: string;
      value: string;
      sortOrder: number;
    }[];
  }[];
}

// Variant
export interface CreateProductVariantInput{
  name: string;
  value: string;
  price: number;
  currency?: string;
  description?: string;
  optionCombination?: Record<string, string>; // { "color": "red", "size": "M" }
}

export interface AddProductVariantsInput{
  variants: CreateProductVariantInput[];
}

export interface ProductVariantsResponse {
  productId: string;
  variants: {
    id: string;
    name: string;
    value: string;
    price: number;
    currency: string;
    sku: string;
    optionValues?: {
      optionName: string;
      optionValue: string;
    }[];
  }[];
}

// add image
export interface AddProductImageInput{
  imageUrl: string;
  isPrimary?: boolean;
  sortOrder?: number;
  description?: string;
}

export interface AddProductImagesInput{
  images: AddProductImageInput[];
}

export interface ProductImagesResponse {
  productId: string;
  images: {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
    description?: string;
  }[];
}

// publish
export interface UpdateProductStatusInput {
  status: ProductStatus;
}

export interface ProductStatusResponse {
  id: string;
  status: ProductStatus;
  updatedAt: Date;
}