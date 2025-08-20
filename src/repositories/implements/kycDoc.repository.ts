import { IKycDocumentRepository } from "../interfaces/kycDoc.interface";

export class KycDocumentRepository implements IKycDocumentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.KycDocumentCreateInput): Promise<KycDocument> {
    return this.prisma.kycDocument.create({ data });
  }

  async findById(id: string): Promise<KycDocument | null> {
    return this.prisma.kycDocument.findUnique({ where: { id } });
  }

  async findByKycId(kycId: string): Promise<KycDocument[]> {
    return this.prisma.kycDocument.findMany({ where: { kycId } });
  }

  async findByType(kycId: string, type: DocumentType): Promise<KycDocument | null> {
    return this.prisma.kycDocument.findFirst({ where: { kycId, type } });
  }

  async update(id: string, data: Prisma.KycDocumentUpdateInput): Promise<KycDocument> {
    return this.prisma.kycDocument.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kycDocument.delete({ where: { id } });
  }

  async updateStatus(id: string, status: DocumentStatus, verifierNote?: string): Promise<KycDocument> {
    return this.prisma.kycDocument.update({
      where: { id },
      data: { status, verifierNote }
    });
  }

  async findPendingVerification(): Promise<KycDocument[]> {
    return this.prisma.kycDocument.findMany({ where: { status: 'PENDING' } });
  }
}