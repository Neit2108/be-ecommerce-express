-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2);
