import { ShopStatus, ApprovalStatus } from "@prisma/client";
import { PaginationParams } from "./common";

export interface ShopFilters extends PaginationParams{
    status?: ShopStatus;
    approvalStatus?: ApprovalStatus;
    category?: string;
    isVerified?: boolean;
    city?: string;
    name?: string;
    location?: {
        city?: string;
        district?: string;
    }
}

export interface CreateShopInput {
    name: string;
    category?: string;
    logoUrl?: string;

    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    country?: string;

    taxCode?: string;
    bankName?: string;
    bankAccount?: string;
    accountNumber?: string;

    autoApprove?: boolean;
}