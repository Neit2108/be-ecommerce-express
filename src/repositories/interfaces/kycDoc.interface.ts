export interface IKycDocumentRepository {
  create(data: Prisma.KycDocumentCreateInput): Promise<KycDocument>;
  findById(id: string): Promise<KycDocument | null>;
  findByKycId(kycId: string): Promise<KycDocument[]>;
  findByType(kycId: string, type: DocumentType): Promise<KycDocument | null>;
  update(id: string, data: Prisma.KycDocumentUpdateInput): Promise<KycDocument>;
  delete(id: string): Promise<void>;
  
  updateStatus(id: string, status: DocumentStatus, verifierNote?: string): Promise<KycDocument>;
  findPendingVerification(): Promise<KycDocument[]>;
}