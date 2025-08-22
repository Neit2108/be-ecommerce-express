import { Prisma, PrismaClient, Role, RolePermission, RoleType, UserRole } from "@prisma/client";
import { IRoleRepository, IUserRoleRepository } from "../interfaces/role.interface";
import { RoleFilters } from "../../types/role.types";
import { NotFoundError } from "../../errors/AppError";

export class RoleRepository implements IRoleRepository{
    constructor(private prisma: PrismaClient) {}

    async create(data: Prisma.RoleCreateInput): Promise<Role> {
        return await this.prisma.role.create({
            data
        });
    }

    async findById(id: string): Promise<Role | null> {
        return await this.prisma.role.findUnique({
            where: { id }
        });
    }

    async findByName(name: string): Promise<Role | null> {
        return await this.prisma.role.findUnique({
            where: { name }
        });
    }

    async findByType(type: RoleType): Promise<Role[]> {
        return await this.prisma.role.findMany({
            where: { type }
        });
    }

    async findMany(filters: RoleFilters): Promise<Role[]> {
        const where: Prisma.RoleWhereInput = {}

        return await this.prisma.role.findMany({ where });
    }

    async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
        return await this.prisma.role.update({
            where: { id },
            data
        });
    }

    async softDelete(id: string, deletedBy: string): Promise<Role> {
        return await this.prisma.role.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy
            }
        });
    }

    async restore(id: string): Promise<Role> {
        return await this.prisma.role.update({
            where: { id },
            data: {
                deletedAt: null,
                deletedBy: null
            }
        });
    }

    async count(filters: RoleFilters): Promise<number> {
        const where: Prisma.RoleWhereInput = {}

        return await this.prisma.role.count({ where });
    }

    async findWithPermissions(id: string): Promise<Role & { rolePermissions: RolePermission[]; }> {
        const roleWithPermission = await this.prisma.role.findUnique({
            where: { id },
            include: {
                rolePermissions: true
            }
        });

        if(!roleWithPermission){
            throw new NotFoundError("Role");
        }

        return roleWithPermission;
    }
}

export class UserRoleRepository implements IUserRoleRepository{
    constructor(private prisma: PrismaClient) {}

    async findById(id: string): Promise<UserRole | null> {
        return await this.prisma.userRole.findUnique({
            where: { id }
        });
    }

    async findByUserId(userId: string): Promise<UserRole[]> {
        return await this.prisma.userRole.findMany({
            where: { userId }
        });
    }

    async findByRoleId(roleId: string): Promise<UserRole[]> {
        return await this.prisma.userRole.findMany({
            where: { roleId }
        });
    }

    async findActiveByUserId(userId: string): Promise<UserRole[]> {
        return await this.prisma.userRole.findMany({
            where: {
                userId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });
    }

    async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
        return await this.prisma.userRole.findFirst({
            where: { userId, roleId }
        });
    }

    async findByUserIdWithRoles(userId: string): Promise<(UserRole & { role: Role; })[]> {
        return await this.prisma.userRole.findMany({
            where: { userId },
            include: { role: true }
        });
    }

    async findExpired(): Promise<UserRole[]> {
        return await this.prisma.userRole.findMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
    }

    async create(data: Prisma.UserRoleCreateInput): Promise<UserRole> {
        return await this.prisma.userRole.create({
            data
        });
    }

    async update(id: string, data: Prisma.UserRoleUpdateInput): Promise<UserRole> {
        return await this.prisma.userRole.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<UserRole> {
        return await this.prisma.userRole.delete({
            where: { id }
        });
    }

    async deleteByUserAndRole(userId: string, roleId: string): Promise<UserRole> {
        const userRole = await this.prisma.userRole.findFirst({
            where: { userId, roleId }
        });

        if(!userRole){
            throw new NotFoundError("UserRole");
        }

        return await this.prisma.userRole.delete({
            where: { id: userRole.id }
        });
    }

    async deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload> {
        return await this.prisma.userRole.deleteMany({
            where: { userId }
        });
    }
}