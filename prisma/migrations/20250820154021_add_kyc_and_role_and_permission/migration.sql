/*
  Warnings:

  - The values [PENDING] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `account_number` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `tax_code` on the `shops` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[current_kyc_id]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('SYSTEM_ADMIN', 'SELLER', 'CUSTOMER', 'GUEST', 'KYC_REVIEWER');

-- CreateEnum
CREATE TYPE "public"."PermissionModule" AS ENUM ('USER_MANAGEMENT', 'SHOP_MANAGEMENT', 'PRODUCT_MANAGEMENT', 'ORDER_MANAGEMENT', 'KYC_MANAGEMENT', 'CATEGORY_MANAGEMENT', 'SYSTEM_SETTINGS', 'REPORTS_ANALYTICS');

-- CreateEnum
CREATE TYPE "public"."PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'ASSIGN', 'REVOKE');

-- CreateEnum
CREATE TYPE "public"."KycStatus" AS ENUM ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('IDENTITY_CARD');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ApprovalStatus_new" AS ENUM ('PENDING_APPROVAL', 'PENDING_KYC', 'APPROVED', 'REJECTED', 'REVIEWING', 'REQUIRES_DOCUMENTS');
ALTER TABLE "public"."shops" ALTER COLUMN "approval_status" DROP DEFAULT;
ALTER TABLE "public"."shops" ALTER COLUMN "approval_status" TYPE "public"."ApprovalStatus_new" USING ("approval_status"::text::"public"."ApprovalStatus_new");
ALTER TYPE "public"."ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "public"."ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "public"."ApprovalStatus_old";
ALTER TABLE "public"."shops" ALTER COLUMN "approval_status" SET DEFAULT 'PENDING_APPROVAL';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."ShopStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "public"."shops" DROP COLUMN "account_number",
DROP COLUMN "bank_account",
DROP COLUMN "bank_name",
DROP COLUMN "tax_code",
ADD COLUMN     "current_kyc_id" TEXT,
ALTER COLUMN "approval_status" SET DEFAULT 'PENDING_APPROVAL';

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."RoleType" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "module" "public"."PermissionModule" NOT NULL,
    "action" "public"."PermissionAction" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_data" (
    "id" TEXT NOT NULL,
    "status" "public"."KycStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "reviewerNote" TEXT,
    "expiryDate" TIMESTAMP(3),
    "fullName" TEXT,
    "birthday" TIMESTAMP(3),
    "personalAddress" TEXT,
    "personalPhone" TEXT,
    "personalEmail" TEXT,
    "identityCard" TEXT,
    "shopName" TEXT,
    "taxCode" TEXT,
    "shopAddress" TEXT,
    "shopPhone" TEXT,
    "shopEmail" TEXT,
    "shopRegDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "reviewer_user_id" TEXT,

    CONSTRAINT "kyc_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_documents" (
    "id" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "verifierNote" TEXT,
    "kycDataId" TEXT NOT NULL,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_history" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldStatus" "public"."KycStatus",
    "newStatus" "public"."KycStatus",
    "reason" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "kycDataId" TEXT NOT NULL,

    CONSTRAINT "kyc_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_settings" (
    "id" TEXT NOT NULL,
    "requiredDocuments" TEXT[],
    "kycExpiryDays" INTEGER NOT NULL DEFAULT 365,
    "autoApprovalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxFileSize" INTEGER NOT NULL DEFAULT 10485760,
    "allowedMimeTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE INDEX "roles_type_idx" ON "public"."roles"("type");

-- CreateIndex
CREATE INDEX "roles_is_active_idx" ON "public"."roles"("is_active");

-- CreateIndex
CREATE INDEX "roles_created_at_idx" ON "public"."roles"("created_at");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "public"."roles"("deleted_at");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "public"."permissions"("module");

-- CreateIndex
CREATE INDEX "permissions_action_idx" ON "public"."permissions"("action");

-- CreateIndex
CREATE INDEX "permissions_is_active_idx" ON "public"."permissions"("is_active");

-- CreateIndex
CREATE INDEX "permissions_created_at_idx" ON "public"."permissions"("created_at");

-- CreateIndex
CREATE INDEX "permissions_deleted_at_idx" ON "public"."permissions"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_action_key" ON "public"."permissions"("module", "action");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "public"."role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "public"."role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "role_permissions_created_at_idx" ON "public"."role_permissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "public"."role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "public"."user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_is_active_idx" ON "public"."user_roles"("is_active");

-- CreateIndex
CREATE INDEX "user_roles_expires_at_idx" ON "public"."user_roles"("expires_at");

-- CreateIndex
CREATE INDEX "user_roles_created_at_idx" ON "public"."user_roles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "public"."user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "user_permissions_user_id_idx" ON "public"."user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "user_permissions_permission_id_idx" ON "public"."user_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "user_permissions_is_granted_idx" ON "public"."user_permissions"("is_granted");

-- CreateIndex
CREATE INDEX "user_permissions_expires_at_idx" ON "public"."user_permissions"("expires_at");

-- CreateIndex
CREATE INDEX "user_permissions_created_at_idx" ON "public"."user_permissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "public"."user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_idx" ON "public"."user_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_activities_action_idx" ON "public"."user_activities"("action");

-- CreateIndex
CREATE INDEX "user_activities_module_idx" ON "public"."user_activities"("module");

-- CreateIndex
CREATE INDEX "user_activities_resource_id_idx" ON "public"."user_activities"("resource_id");

-- CreateIndex
CREATE INDEX "user_activities_performed_at_idx" ON "public"."user_activities"("performed_at");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_data_shopId_key" ON "public"."kyc_data"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shops_current_kyc_id_key" ON "public"."shops"("current_kyc_id");

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_current_kyc_id_fkey" FOREIGN KEY ("current_kyc_id") REFERENCES "public"."kyc_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_data" ADD CONSTRAINT "kyc_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_data" ADD CONSTRAINT "kyc_data_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_data" ADD CONSTRAINT "kyc_data_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_documents" ADD CONSTRAINT "kyc_documents_kycDataId_fkey" FOREIGN KEY ("kycDataId") REFERENCES "public"."kyc_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_history" ADD CONSTRAINT "kyc_history_kycDataId_fkey" FOREIGN KEY ("kycDataId") REFERENCES "public"."kyc_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
