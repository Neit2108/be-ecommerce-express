/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "public"."roles"("type");
