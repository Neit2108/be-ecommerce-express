/*
  Warnings:

  - The values [PENDING_APPROVAL] on the enum `ShopStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVIEWING', 'REQUIRES_DOCUMENTS');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ShopStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');
ALTER TABLE "public"."shops" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."shops" ALTER COLUMN "status" TYPE "public"."ShopStatus_new" USING ("status"::text::"public"."ShopStatus_new");
ALTER TYPE "public"."ShopStatus" RENAME TO "ShopStatus_old";
ALTER TYPE "public"."ShopStatus_new" RENAME TO "ShopStatus";
DROP TYPE "public"."ShopStatus_old";
ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."shops" ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "auto_approve" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "rating" DECIMAL(3,2),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tax_code" TEXT,
ADD COLUMN     "total_orders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
