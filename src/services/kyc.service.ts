import { NotFoundError } from '../errors/AppError';
import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import { PaginationParams } from '../types/common';
import { KycDataResponse, KycDocumentResponse } from '../types/kyc.types';

export class KycService {
  constructor(private uow: IUnitOfWork) {}

  async reviewKyc(
    kycId: string,
    status: KycStatus,
    reviewerId: string,
    reviewerNote?: string
  ): Promise<KycDataResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const kyc = await uow.kycDatas.findById(kycId, { shop: true });
      if (!kyc) {
        throw new NotFoundError('Kyc với id : ' + kycId);
      }

      const updatedKyc = await uow.kycDatas.updateStatus(
        kycId,
        status,
        reviewerId,
        reviewerNote
      );

      if (status === KycStatus.APPROVED) {
        await uow.shops.updateApprovalStatus(
          kyc.shopId,
          ApprovalStatus.APPROVED
        );
      } else if (status === KycStatus.REJECTED) {
        await uow.shops.updateApprovalStatus(
          kyc.shopId,
          ApprovalStatus.REQUIRES_DOCUMENTS,
          undefined,
          reviewerNote
        );
      }

      await uow.kycDatas.addHistoryEntry(
        kycId,
        status.toUpperCase(),
        { reviewedBy: reviewerId, note: reviewerNote }
      )

      return {

      } as KycDataResponse;
    });
  }


  async reviewDocument(
    documentId: string, 
    status: DocumentStatus, 
    verifierNote?: string
  ): Promise<KycDocumentResponse> {
    return this.uow.executeInTransaction(async (uow) => {
      const document = await uow.kycDocuments.updateStatus(
        documentId, 
        status, 
        verifierNote
      );

      return document;
    });
  }

  async getPendingReviews(pagination?: PaginationParams) {
    return this.uow.kycDatas.findPendingReview(pagination);
  }
}
