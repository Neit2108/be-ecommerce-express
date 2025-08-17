import { PrismaClient, Prisma } from '@prisma/client';

// Test 1: Check if field exists
type UpdateInput = Prisma.UserUpdateInput;
type UpdateKeys = keyof UpdateInput;

// Test 2: Try assignment
const test: Prisma.UserUpdateInput = {
  firstName: 'test',
};

// This should show error or not
const test2: Prisma.UserUpdateInput = {
  updatedBy: 'test',
};

console.log('Types loaded correctly');