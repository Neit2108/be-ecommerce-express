import {
  Permission,
  PermissionAction,
  PermissionModule,
  Prisma,
  RolePermission,
  UserPermission,
} from '@prisma/client';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByModuleAndAction(
    module: PermissionModule,
    action: PermissionAction
  ): Promise<Permission | null>;
  findByModule(module: PermissionModule): Promise<Permission[]>;
  findManyWithFilters(
    where: Prisma.PermissionWhereInput
  ): Promise<Permission[]>;
  create(data: Prisma.PermissionCreateInput): Promise<Permission>;
  update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission>;
  delete(id: string): Promise<Permission>;
  count(where?: Prisma.PermissionWhereInput): Promise<number>;
}

export interface IRolePermissionRepository {
  findById(id: string): Promise<RolePermission | null>;
  findByRoleId(roleId: string): Promise<RolePermission[]>;
  findByRoleIdWithPermissions(
    roleId: string
  ): Promise<(RolePermission & { permission: Permission })[]>;
  findByPermissionId(permissionId: string): Promise<RolePermission[]>;
  findByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null>;
  create(data: Prisma.RolePermissionCreateInput): Promise<RolePermission>;
  createMany(
    data: Prisma.RolePermissionCreateManyInput[]
  ): Promise<Prisma.BatchPayload>;
  delete(id: string): Promise<RolePermission>;
  deleteByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission>;
  deleteManyByRoleId(roleId: string): Promise<Prisma.BatchPayload>;
}

export interface IUserPermissionRepository {
  findById(id: string): Promise<UserPermission | null>;
  findByUserId(userId: string): Promise<UserPermission[]>;
  findByUserIdWithPermissions(userId: string): Promise<(UserPermission & { permission: Permission })[]>;
  findGrantedByUserId(userId: string): Promise<UserPermission[]>;
  findDeniedByUserId(userId: string): Promise<UserPermission[]>;
  findByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission | null>;
  findExpired(): Promise<UserPermission[]>;
  create(data: Prisma.UserPermissionCreateInput): Promise<UserPermission>;
  update(id: string, data: Prisma.UserPermissionUpdateInput): Promise<UserPermission>;
  delete(id: string): Promise<UserPermission>;
  deleteByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission>;
  deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload>;
}