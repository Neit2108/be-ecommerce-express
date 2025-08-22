import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import { RoleResponse } from '../types/role.types';

export class RoleService {
  constructor(private uow: IUnitOfWork) {}

  async getByName(name: string): Promise<RoleResponse | null> {
    const role = await this.uow.roles.findByName(name);
    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      description: role.description || '',
    };
  }

  assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    return this.uow.executeInTransaction(async (uow) => {
      const result = await uow.userRoles.create({
        user: {
          connect: { id: userId },
        },
        role: {
          connect: { id: roleId },
        },
      });
      return result !== null;
    });
  }

  removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    return this.uow.executeInTransaction(async (uow) => {
      const result = await uow.userRoles.deleteByUserAndRole(userId, roleId);
      return result !== null;
    });
  }
}
