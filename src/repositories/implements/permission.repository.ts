import { prisma } from './../../config/prisma';
import { Permission, PermissionAction, PermissionModule, Prisma, PrismaClient, RolePermission, UserPermission } from "@prisma/client";
import { IPermissionRepository, IRolePermissionRepository, IUserPermissionRepository } from "../interfaces/permission.interface";

export class PermissionRepository implements IPermissionRepository{
    constructor(private prisma: PrismaClient) {}

    async findById(id: string): Promise<Permission | null> {
        return await this.prisma.permission.findUnique({
            where: { id }
        });
    }

    async findByModule(module: PermissionModule): Promise<Permission[]> {
        return await this.prisma.permission.findMany({
            where: { module }
        });
    }

    async findByModuleAndAction(module: PermissionModule, action: PermissionAction): Promise<Permission | null> {
        return await this.prisma.permission.findFirst({
            where: { module, action }
        });
    }

    async findManyWithFilters(where: Prisma.PermissionWhereInput): Promise<Permission[]> {
        return await this.prisma.permission.findMany({
            where
        });
    }

    async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
        return await this.prisma.permission.create({
            data
        });
    }

    async update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission> {
        return await this.prisma.permission.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Permission> {
        return await this.prisma.permission.delete({
            where: { id }
        });
    }

    async count(where?: Prisma.PermissionWhereInput): Promise<number> {
        return 0;
    }
}

export class RolePermissionRepository implements IRolePermissionRepository{
    constructor (private prisma: PrismaClient) {}

    async findById(id: string): Promise<RolePermission | null> {
        return await this.prisma.rolePermission.findUnique({
            where: { id }
        });
    }

    async findByRoleId(roleId: string): Promise<RolePermission[]> {
        return await this.prisma.rolePermission.findMany({
            where: { roleId }
        });
    }

    async findByRoleIdWithPermissions(roleId: string): Promise<(RolePermission & { permission: Permission; })[]> {
        return await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true }
        });
    }

    async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
        return await this.prisma.rolePermission.findMany({
            where: { permissionId }
        });
    }

    async findByRoleAndPermission(roleId: string, permissionId: string): Promise<RolePermission | null> {
        return await this.prisma.rolePermission.findFirst({
            where: { roleId, permissionId }
        });
    }

    async create(data: Prisma.RolePermissionCreateInput): Promise<RolePermission> {
        return await this.prisma.rolePermission.create({
            data
        });
    }

    async createMany(data: Prisma.RolePermissionCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return await this.prisma.rolePermission.createMany({
            data
        });
    }

    async delete(id: string): Promise<RolePermission> {
        return await this.prisma.rolePermission.delete({
            where: { id }
        });
    }

    async deleteByRoleAndPermission(roleId: string, permissionId: string): Promise<RolePermission> {
        return await this.prisma.rolePermission.deleteMany({
            where: { roleId, permissionId }
        }).then(res => {
            if (res.count > 0) {
                return this.prisma.rolePermission.findFirst({
                    where: { roleId, permissionId }
                }) as Promise<RolePermission>;
            }
            throw new Error('RolePermission not found');
        });
    }

    async deleteManyByRoleId(roleId: string): Promise<Prisma.BatchPayload> {
        return await this.prisma.rolePermission.deleteMany({
            where: { roleId }
        });
    }
}

export class UserPermissionRepository implements IUserPermissionRepository{
    constructor(private prisma: PrismaClient){}

    async findById(id: string): Promise<UserPermission | null> {
        return await this.prisma.userPermission.findUnique({
            where: { id }
        });
    }

    async findByUserId(userId: string): Promise<UserPermission[]> {
        return await this.prisma.userPermission.findMany({
            where: { userId }
        });
    }

    async findByUserIdWithPermissions(userId: string): Promise<(UserPermission & { permission: Permission; })[]> {
        return await this.prisma.userPermission.findMany({
            where: { userId },
            include: { permission: true }
        });
    }

    async findGrantedByUserId(userId: string): Promise<UserPermission[]> {
        return await this.prisma.userPermission.findMany({
            where: { userId, isGranted: true }
        });
    }

    async findDeniedByUserId(userId: string): Promise<UserPermission[]> {
        return await this.prisma.userPermission.findMany({
            where: { userId, isGranted: false }
        });
    }

    async findByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission | null> {
        return await this.prisma.userPermission.findFirst({
            where: { userId, permissionId }
        });
    }

    async findExpired(): Promise<UserPermission[]> {
        return await this.prisma.userPermission.findMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
    }

    async create(data: Prisma.UserPermissionCreateInput): Promise<UserPermission> {
        return await this.prisma.userPermission.create({
            data
        });
    }

    async update(id: string, data: Prisma.UserPermissionUpdateInput): Promise<UserPermission> {
        return await this.prisma.userPermission.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<UserPermission> {
        return await this.prisma.userPermission.delete({
            where: { id }
        });
    }

    async deleteByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission> {
        return await this.prisma.userPermission.deleteMany({
            where: { userId, permissionId }
        }).then(res => {
            if (res.count > 0) {
                return this.prisma.userPermission.findFirst({
                    where: { userId, permissionId }
                }) as Promise<UserPermission>;
            }
            throw new Error('UserPermission not found');
        });
    }

    async deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload> {
        return await this.prisma.userPermission.deleteMany({
            where: { userId }
        });
    }
}