-- CreateEnum
CREATE TYPE "CashbackStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "gateway_response" JSONB,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cashbacks" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" "CashbackStatus" NOT NULL DEFAULT 'PENDING',
    "blockchain_network" TEXT,
    "wallet_address" TEXT NOT NULL,
    "tx_hash" TEXT,
    "block_number" INTEGER,
    "gas_used" TEXT,
    "gas_fee" DECIMAL(15,8),
    "eligible_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_retry_at" TIMESTAMP(3),
    "metadata" JSONB,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cashbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cashbacks_payment_id_key" ON "cashbacks"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "cashbacks_tx_hash_key" ON "cashbacks"("tx_hash");

-- CreateIndex
CREATE INDEX "cashbacks_payment_id_idx" ON "cashbacks"("payment_id");

-- CreateIndex
CREATE INDEX "cashbacks_user_id_idx" ON "cashbacks"("user_id");

-- CreateIndex
CREATE INDEX "cashbacks_order_id_idx" ON "cashbacks"("order_id");

-- CreateIndex
CREATE INDEX "cashbacks_status_idx" ON "cashbacks"("status");

-- CreateIndex
CREATE INDEX "cashbacks_wallet_address_idx" ON "cashbacks"("wallet_address");

-- CreateIndex
CREATE INDEX "cashbacks_tx_hash_idx" ON "cashbacks"("tx_hash");

-- CreateIndex
CREATE INDEX "cashbacks_blockchain_network_idx" ON "cashbacks"("blockchain_network");

-- CreateIndex
CREATE INDEX "cashbacks_eligible_at_idx" ON "cashbacks"("eligible_at");

-- CreateIndex
CREATE INDEX "cashbacks_created_at_idx" ON "cashbacks"("created_at");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashbacks" ADD CONSTRAINT "cashbacks_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashbacks" ADD CONSTRAINT "cashbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cashbacks" ADD CONSTRAINT "cashbacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
