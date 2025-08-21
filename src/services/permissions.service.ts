import { prisma } from '../config/prisma';
import redis from '../config/redis';
import {
  PermissionAction,
  PermissionModule,
  RoleType,
  UserStatus,
} from '@prisma/client';

export interface UserRole {
  id: string;
  name: string;
  type: RoleType;
  permissions: {
    module: PermissionModule;
    action: PermissionAction;
  }[];
}

export interface UserDirectPermission {
  module: PermissionModule;
  action: PermissionAction;
  isGranted: boolean;
  expiresAt?: Date | null;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  status: UserStatus;
  roles: UserRole[];
  directPermissions: UserDirectPermission[];
}

export class PermissionService {
  async getUserWithPermissions(userId: string) : Promise<UserWithPermissions | null>{
    const cacheKey = `user_permissions_${userId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error fetching user permissions from cache:', error);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
        status: {
          notIn: ['BANNED'],
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        roles: {
          where: {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            role: {
              isActive: true,
              deletedAt: null,
            },
          },
          select: {
            role: {
              select: {
                id: true,
                name: true,
                type: true,
                rolePermissions: {
                  where: {
                    permission: {
                      isActive: true,
                      deletedAt: null,
                    },
                  },
                  select: {
                    permission: {
                      select: {
                        module: true,
                        action: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        permissions: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            permission: {
              isActive: true,
              deletedAt: null,
            },
          },
          select: {
            isGranted: true,
            expiresAt: true,
            permission: {
              select: {
                module: true,
                action: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const userWithPermissions: UserWithPermissions = {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles.map(function (ur) {
        return {
          id: ur.role.id,
          name: ur.role.name,
          type: ur.role.type,
          permissions: ur.role.rolePermissions.map(function (rp) {
            return {
              module: rp.permission.module,
              action: rp.permission.action,
            };
          }),
        };
      }),
      directPermissions: user.permissions.map(function (up) {
        return {
          module: up.permission.module,
          action: up.permission.action,
          isGranted: up.isGranted,
          expiresAt: up.expiresAt,
        };
      }),
    };

    try {
      await redis.set(cacheKey, JSON.stringify(userWithPermissions), 300);
    } catch (error) {
      console.warn('Set user với permissions thất bại');
    }

    return userWithPermissions;
  }

  calculateEffectivePermissions(user: UserWithPermissions): Set<string> {
    const permissions = new Set<string>();

    // Thêm permissions từ roles
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissions.add(`${permission.module}:${permission.action}`);
      });
    });

    // Áp dụng direct permissions (có thể grant hoặc deny)
    user.directPermissions.forEach((permission) => {
      const key = `${permission.module}:${permission.action}`;
      if (permission.isGranted) {
        permissions.add(key);
      } else {
        permissions.delete(key); // Explicit deny ghi đè role permissions
      }
    });

    return permissions;
  }

  hasPermission(
    permissions: Set<string>,
    module: PermissionModule,
    action: PermissionAction
  ): boolean {
    return permissions.has(`${module}:${action}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    try {
      await redis.del(`user_permissions:${userId}`);
    } catch (error) {
      console.warn('Lỗi xảy ra khi xóa cache:', error);
    }
  }
}
