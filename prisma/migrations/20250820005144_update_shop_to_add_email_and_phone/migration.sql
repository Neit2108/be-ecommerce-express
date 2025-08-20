/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `shops` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."shops" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "shops_email_key" ON "public"."shops"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shops_phone_number_key" ON "public"."shops"("phone_number");
