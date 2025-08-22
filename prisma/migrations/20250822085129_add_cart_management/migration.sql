-- CreateTable
CREATE TABLE "public"."carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "expires_at" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "product_name" TEXT NOT NULL,
    "variant_name" TEXT,
    "product_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carts_user_id_idx" ON "public"."carts"("user_id");

-- CreateIndex
CREATE INDEX "carts_session_id_idx" ON "public"."carts"("session_id");

-- CreateIndex
CREATE INDEX "carts_expires_at_idx" ON "public"."carts"("expires_at");

-- CreateIndex
CREATE INDEX "carts_last_active_at_idx" ON "public"."carts"("last_active_at");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "public"."carts"("user_id");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "public"."cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_product_id_idx" ON "public"."cart_items"("product_id");

-- CreateIndex
CREATE INDEX "cart_items_product_variant_id_idx" ON "public"."cart_items"("product_variant_id");

-- CreateIndex
CREATE INDEX "cart_items_created_at_idx" ON "public"."cart_items"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_variant_id_key" ON "public"."cart_items"("cart_id", "product_variant_id");

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
