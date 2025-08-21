import { Prisma, Role, RolePermission, RoleType, UserRole } from "@prisma/client";
import { RoleFilters } from "../../types/role.types";

export interface IRoleRepository {
  create(data: Prisma.RoleCreateInput): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByType(type: RoleType): Promise<Role[]>;
  findMany(filters: RoleFilters): Promise<Role[]>;
  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role>;
  softDelete(id: string, deletedBy: string): Promise<Role>;
  restore(id: string): Promise<Role>;
  count(filters: RoleFilters) : Promise<number>;
  findWithPermissions(id: string): Promise<Role & { rolePermissions: RolePermission[] }>;
}

export interface IUserRoleRepository {
  findById(id: string): Promise<UserRole | null>;
  findByUserId(userId: string): Promise<UserRole[]>;
  findByUserIdWithRoles(userId: string): Promise<(UserRole & { role: Role })[]>;
  findActiveByUserId(userId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  findExpired(): Promise<UserRole[]>;
  create(data: Prisma.UserRoleCreateInput): Promise<UserRole>;
  update(id: string, data: Prisma.UserRoleUpdateInput): Promise<UserRole>;
  delete(id: string): Promise<UserRole>;
  deleteByUserAndRole(userId: string, roleId: string): Promise<UserRole>;
  deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload>;
}