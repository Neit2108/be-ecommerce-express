/*
  Warnings:

  - A unique constraint covering the columns `[identityCard]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identityCard` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "identityCard" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_identityCard_key" ON "public"."users"("identityCard");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users"("phone_number");
