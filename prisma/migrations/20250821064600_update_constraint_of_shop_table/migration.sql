/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `shops` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bank_name,bank_account_number]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."shops_bank_account_number_key";

-- AlterTable
ALTER TABLE "public"."shops" ALTER COLUMN "country" SET DEFAULT 'Việt Nam';

-- CreateIndex
CREATE UNIQUE INDEX "shops_name_key" ON "public"."shops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shops_bank_name_bank_account_number_key" ON "public"."shops"("bank_name", "bank_account_number");
