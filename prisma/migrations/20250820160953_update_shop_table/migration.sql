/*
  Warnings:

  - A unique constraint covering the columns `[bank_account_number]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."shops" ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "shops_bank_account_number_key" ON "public"."shops"("bank_account_number");
