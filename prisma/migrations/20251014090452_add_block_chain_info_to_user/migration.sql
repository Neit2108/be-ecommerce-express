-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferred_network" TEXT DEFAULT 'BSC',
ADD COLUMN     "wallet_address" TEXT;
