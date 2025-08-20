import { Prisma } from "@prisma/client";

export interface IKycDataRepository {
  // Basic CRUD
  create(data: Prisma.KycDataCreateInput): Promise<KycData>;
  findById(id: string, include?: KycDataIncludes): Promise<KycDataWithRelations | null>;
  findByShopId(shopId: string): Promise<KycData | null>;
  update(id: string, data: Prisma.KycDataUpdateInput): Promise<KycData>;
  
  // Query methods
  findMany(filters: KycDataFilters): Promise<KycData[]>;
  findPendingReview(pagination?: PaginationParams): Promise<KycData[]>;
  findByStatus(status: KycStatus): Promise<KycData[]>;
  findExpiredKyc(): Promise<KycData[]>;
  
  // Status management
  updateStatus(
    id: string, 
    status: KycStatus, 
    reviewerUserId?: string, 
    reviewerNote?: string
  ): Promise<KycData>;
  
  // Document management
  addDocument(kycId: string, documentData: Prisma.KycDocumentCreateInput): Promise<KycDocument>;
  updateDocument(documentId: string, status: DocumentStatus, verifierNote?: string): Promise<KycDocument>;
  
  // History tracking
  addHistoryEntry(kycId: string, action: string, metadata?: any): Promise<KycHistory>;
  
  // Count methods
  count(filters?: KycDataFilters): Promise<number>;
  countByStatus(status: KycStatus): Promise<number>;
}