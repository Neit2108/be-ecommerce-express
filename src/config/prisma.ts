import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test connection
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Kết nối cơ sở dữ liệu thành công');
  } catch (error) {
    console.error('❌ Kết nối cơ sở dữ liệu thất bại:', error);
    throw error;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Đã ngắt kết nối cơ sở dữ liệu');
};