export const PERMISSIONS = {
  // Shop Management
  SHOP: {
    CREATE: 'shop:create',
    READ: 'shop:read',
    UPDATE: 'shop:update', 
    DELETE: 'shop:delete',
    APPROVE: 'shop:approve',
    MANAGE_STAFF: 'shop:manage_staff'
  },
  
  // Product Management  
  PRODUCT: {
    CREATE: 'product:create',
    READ: 'product:read',
    UPDATE: 'product:update',
    DELETE: 'product:delete',
    PUBLISH: 'product:publish'
  },
  
  // User Management
  USER: {
    CREATE: 'user:create',
    READ: 'user:read', 
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    ASSIGN_ROLE: 'user:assign_role'
  },
  
  // KYC Management
  KYC: {
    READ: 'kyc:read',
    REVIEW: 'kyc:review', 
    APPROVE: 'kyc:approve',
    REJECT: 'kyc:reject'
  }
} as const