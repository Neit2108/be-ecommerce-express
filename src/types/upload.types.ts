export enum UploadFolder {
  USERS = 'users',
  SHOPS = 'shops', 
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  KYC_DOCUMENTS = 'kyc-documents',
  GENERAL = 'general'
}

export interface UploadOptions {
  folder: UploadFolder;
  userId?: string;
  shopId?: string;
  productId?: string;
  maxFileSize?: number; // bytes
  allowedMimeTypes?: string[];
  transformation?: CloudinaryTransformation;
  generateThumbnail?: boolean;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'mpad';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  originalUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  folder: string;
}

export interface UploadError {
  message: string;
  code: string;
  field?: string;
}