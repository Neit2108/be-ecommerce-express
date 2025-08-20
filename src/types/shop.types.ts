import { ShopStatus, ApprovalStatus, Shop } from '@prisma/client';
import { PaginationParams } from './common';

export interface ShopFilters extends PaginationParams {
  status?: ShopStatus;
  approvalStatus?: ApprovalStatus;
  category?: string;
  isVerified?: boolean;
  city?: string;
  name?: string;
  location?: {
    city?: string;
    district?: string;
  };
}

export interface CreateDraftShopInput {
  name: string;
  category?: string;
  logoUrl?: string;

  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;

  email?: string;
  phoneNumber?: string;
}

export interface DraftShopResponse {
  id: string;
  name: string;
}

export interface SetBankAccountInput {
  taxCode: string;
  bankName: string;
  bankAccount: string;
  accountNumber: string;
}

export interface ShopResponse{
  id: string;
  name: string;

  logoUrl?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    country?: string;
  };

  bankAccount?: {
    taxCode?: string;
    bankName?: string;
    bankAccount?: string;
    accountNumber?: string;
  };
}

export interface CheckKycInput {
  shopId: string;
}

export interface CheckKycResponse {
  isApproved: boolean;
  approvedBy?: string;
}