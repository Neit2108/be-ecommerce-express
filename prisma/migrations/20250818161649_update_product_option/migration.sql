/*
  Warnings:

  - A unique constraint covering the columns `[product_option_id,value]` on the table `product_option_values` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id,name]` on the table `product_options` will be added. If there are existing duplicate values, this will fail.

*/

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

-- AlterTable
ALTER TABLE "public"."product_option_values" ALTER COLUMN "value" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "public"."product_options" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_option_values_product_option_id_value_key" ON "public"."product_option_values"("product_option_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "product_options_product_id_name_key" ON "public"."product_options"("product_id", "name");
