-- CreateEnum
CREATE TYPE "public"."ShopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK', 'DISCONTINUED');

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_deleted_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_updated_by_fkey";

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ShopStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "street" TEXT,
    "ward" TEXT,
    "district" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Vietnamese',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "product_status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "image_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_options" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_option_values" (
    "id" TEXT NOT NULL,
    "product_option_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variant_option_values" (
    "id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "product_option_id" TEXT NOT NULL,
    "product_option_value_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_variant_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "parent_category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_owner_id_key" ON "public"."shops"("owner_id");

-- CreateIndex
CREATE INDEX "shops_owner_id_idx" ON "public"."shops"("owner_id");

-- CreateIndex
CREATE INDEX "shops_status_idx" ON "public"."shops"("status");

-- CreateIndex
CREATE INDEX "shops_name_idx" ON "public"."shops"("name");

-- CreateIndex
CREATE INDEX "shops_city_idx" ON "public"."shops"("city");

-- CreateIndex
CREATE INDEX "shops_created_at_idx" ON "public"."shops"("created_at");

-- CreateIndex
CREATE INDEX "shops_deleted_at_idx" ON "public"."shops"("deleted_at");

-- CreateIndex
CREATE INDEX "products_shop_id_idx" ON "public"."products"("shop_id");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "public"."products"("status");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "public"."products"("name");

-- CreateIndex
CREATE INDEX "products_average_rating_idx" ON "public"."products"("average_rating");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "public"."products"("created_at");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "public"."products"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "public"."product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_status_idx" ON "public"."product_variants"("product_status");

-- CreateIndex
CREATE INDEX "product_variants_price_idx" ON "public"."product_variants"("price");

-- CreateIndex
CREATE INDEX "product_variants_created_at_idx" ON "public"."product_variants"("created_at");

-- CreateIndex
CREATE INDEX "product_variants_deleted_at_idx" ON "public"."product_variants"("deleted_at");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "public"."product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "public"."product_images"("variant_id");

-- CreateIndex
CREATE INDEX "product_images_is_primary_idx" ON "public"."product_images"("is_primary");

-- CreateIndex
CREATE INDEX "product_images_sort_order_idx" ON "public"."product_images"("sort_order");

-- CreateIndex
CREATE INDEX "product_images_created_at_idx" ON "public"."product_images"("created_at");

-- CreateIndex
CREATE INDEX "product_images_deleted_at_idx" ON "public"."product_images"("deleted_at");

-- CreateIndex
CREATE INDEX "product_options_product_id_idx" ON "public"."product_options"("product_id");

-- CreateIndex
CREATE INDEX "product_options_name_idx" ON "public"."product_options"("name");

-- CreateIndex
CREATE INDEX "product_options_created_at_idx" ON "public"."product_options"("created_at");

-- CreateIndex
CREATE INDEX "product_options_deleted_at_idx" ON "public"."product_options"("deleted_at");

-- CreateIndex
CREATE INDEX "product_option_values_product_option_id_idx" ON "public"."product_option_values"("product_option_id");

-- CreateIndex
CREATE INDEX "product_option_values_sort_order_idx" ON "public"."product_option_values"("sort_order");

-- CreateIndex
CREATE INDEX "product_option_values_value_idx" ON "public"."product_option_values"("value");

-- CreateIndex
CREATE INDEX "product_option_values_created_at_idx" ON "public"."product_option_values"("created_at");

-- CreateIndex
CREATE INDEX "product_option_values_deleted_at_idx" ON "public"."product_option_values"("deleted_at");

-- CreateIndex
CREATE INDEX "product_variant_option_values_product_variant_id_idx" ON "public"."product_variant_option_values"("product_variant_id");

-- CreateIndex
CREATE INDEX "product_variant_option_values_product_option_id_idx" ON "public"."product_variant_option_values"("product_option_id");

-- CreateIndex
CREATE INDEX "product_variant_option_values_product_option_value_id_idx" ON "public"."product_variant_option_values"("product_option_value_id");

-- CreateIndex
CREATE INDEX "product_variant_option_values_created_at_idx" ON "public"."product_variant_option_values"("created_at");

-- CreateIndex
CREATE INDEX "product_variant_option_values_deleted_at_idx" ON "public"."product_variant_option_values"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_option_values_product_variant_id_product_op_key" ON "public"."product_variant_option_values"("product_variant_id", "product_option_id");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "public"."categories"("name");

-- CreateIndex
CREATE INDEX "categories_parent_category_id_idx" ON "public"."categories"("parent_category_id");

-- CreateIndex
CREATE INDEX "categories_created_at_idx" ON "public"."categories"("created_at");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "public"."categories"("deleted_at");

-- CreateIndex
CREATE INDEX "product_categories_product_id_idx" ON "public"."product_categories"("product_id");

-- CreateIndex
CREATE INDEX "product_categories_category_id_idx" ON "public"."product_categories"("category_id");

-- CreateIndex
CREATE INDEX "product_categories_created_at_idx" ON "public"."product_categories"("created_at");

-- CreateIndex
CREATE INDEX "product_categories_deleted_at_idx" ON "public"."product_categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_product_id_category_id_key" ON "public"."product_categories"("product_id", "category_id");

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_options" ADD CONSTRAINT "product_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_option_values" ADD CONSTRAINT "product_option_values_product_option_id_fkey" FOREIGN KEY ("product_option_id") REFERENCES "public"."product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_product_option_id_fkey" FOREIGN KEY ("product_option_id") REFERENCES "public"."product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_product_option_value_id_fkey" FOREIGN KEY ("product_option_value_id") REFERENCES "public"."product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
