import {
  Permission,
  PermissionAction,
  PermissionModule,
  Prisma,
  RolePermission,
  UserPermission,
} from '@prisma/client';

/**
 * Interface repository cho việc quản lý quyền hạn (Permission)
 * Cung cấp các phương thức CRUD và truy vấn cho các quyền hạn trong hệ thống
 */
export interface IPermissionRepository {
  /**
   * Tìm kiếm quyền hạn theo ID
   * @param id - ID của quyền hạn cần tìm
   * @returns Promise trả về đối tượng Permission hoặc null nếu không tìm thấy
   */
  findById(id: string): Promise<Permission | null>;
  
  /**
   * Tìm kiếm quyền hạn theo module và hành động
   * @param module - Module của quyền hạn
   * @param action - Hành động của quyền hạn
   * @returns Promise trả về đối tượng Permission hoặc null nếu không tìm thấy
   */
  findByModuleAndAction(
    module: PermissionModule,
    action: PermissionAction
  ): Promise<Permission | null>;
  
  /**
   * Tìm kiếm tất cả quyền hạn theo module
   * @param module - Module cần tìm kiếm quyền hạn
   * @returns Promise trả về mảng các đối tượng Permission
   */
  findByModule(module: PermissionModule): Promise<Permission[]>;
  
  /**
   * Tìm kiếm nhiều quyền hạn với các điều kiện lọc
   * @param where - Điều kiện lọc theo Prisma where input
   * @returns Promise trả về mảng các đối tượng Permission
   */
  findManyWithFilters(
    where: Prisma.PermissionWhereInput
  ): Promise<Permission[]>;
  
  /**
   * Tạo mới một quyền hạn
   * @param data - Dữ liệu đầu vào để tạo quyền hạn mới
   * @returns Promise trả về đối tượng Permission đã được tạo
   */
  create(data: Prisma.PermissionCreateInput): Promise<Permission>;
  
  /**
   * Cập nhật thông tin quyền hạn
   * @param id - ID của quyền hạn cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns Promise trả về đối tượng Permission đã được cập nhật
   */
  update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission>;
  
  /**
   * Xóa quyền hạn
   * @param id - ID của quyền hạn cần xóa
   * @returns Promise trả về đối tượng Permission đã bị xóa
   */
  delete(id: string): Promise<Permission>;
  
  /**
   * Đếm số lượng quyền hạn theo điều kiện
   * @param where - Điều kiện lọc (tùy chọn)
   * @returns Promise trả về số lượng quyền hạn
   */
  count(where?: Prisma.PermissionWhereInput): Promise<number>;
}

/**
 * Interface repository cho việc quản lý quyền hạn của vai trò (RolePermission)
 * Cung cấp các phương thức để gán và quản lý quyền hạn cho từng vai trò
 */
export interface IRolePermissionRepository {
  /**
   * Tìm kiếm quyền hạn vai trò theo ID
   * @param id - ID của bản ghi quyền hạn vai trò
   * @returns Promise trả về đối tượng RolePermission hoặc null nếu không tìm thấy
   */
  findById(id: string): Promise<RolePermission | null>;
  
  /**
   * Tìm kiếm tất cả quyền hạn của một vai trò
   * @param roleId - ID của vai trò cần tìm quyền hạn
   * @returns Promise trả về mảng các đối tượng RolePermission
   */
  findByRoleId(roleId: string): Promise<RolePermission[]>;
  
  /**
   * Tìm kiếm quyền hạn của vai trò kèm thông tin chi tiết quyền hạn
   * @param roleId - ID của vai trò cần tìm quyền hạn
   * @returns Promise trả về mảng các đối tượng RolePermission kèm Permission
   */
  findByRoleIdWithPermissions(
    roleId: string
  ): Promise<(RolePermission & { permission: Permission })[]>;
  
  /**
   * Tìm kiếm tất cả vai trò có quyền hạn cụ thể
   * @param permissionId - ID của quyền hạn
   * @returns Promise trả về mảng các đối tượng RolePermission
   */
  findByPermissionId(permissionId: string): Promise<RolePermission[]>;
  
  /**
   * Tìm kiếm quyền hạn cụ thể của một vai trò
   * @param roleId - ID của vai trò
   * @param permissionId - ID của quyền hạn
   * @returns Promise trả về đối tượng RolePermission hoặc null nếu không tìm thấy
   */
  findByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null>;
  
  /**
   * Tạo mới một bản ghi quyền hạn cho vai trò
   * @param data - Dữ liệu đầu vào để tạo quyền hạn vai trò
   * @returns Promise trả về đối tượng RolePermission đã được tạo
   */
  create(data: Prisma.RolePermissionCreateInput): Promise<RolePermission>;
  
  /**
   * Tạo nhiều bản ghi quyền hạn cho vai trò cùng lúc
   * @param data - Mảng dữ liệu đầu vào để tạo nhiều quyền hạn vai trò
   * @returns Promise trả về thông tin về số lượng bản ghi đã được tạo
   */
  createMany(
    data: Prisma.RolePermissionCreateManyInput[]
  ): Promise<Prisma.BatchPayload>;
  
  /**
   * Xóa một bản ghi quyền hạn vai trò
   * @param id - ID của bản ghi quyền hạn vai trò cần xóa
   * @returns Promise trả về đối tượng RolePermission đã bị xóa
   */
  delete(id: string): Promise<RolePermission>;
  
  /**
   * Xóa quyền hạn cụ thể của một vai trò
   * @param roleId - ID của vai trò
   * @param permissionId - ID của quyền hạn cần xóa
   * @returns Promise trả về đối tượng RolePermission đã bị xóa
   */
  deleteByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission>;
  
  /**
   * Xóa tất cả quyền hạn của một vai trò
   * @param roleId - ID của vai trò cần xóa tất cả quyền hạn
   * @returns Promise trả về thông tin về số lượng bản ghi đã được xóa
   */
  deleteManyByRoleId(roleId: string): Promise<Prisma.BatchPayload>;
}

/**
 * Interface repository cho việc quản lý quyền hạn cá nhân của người dùng (UserPermission)
 * Cung cấp các phương thức để gán quyền hạn trực tiếp cho người dùng, bao gồm cả việc cấp phép và từ chối
 */
export interface IUserPermissionRepository {
  /**
   * Tìm kiếm quyền hạn người dùng theo ID
   * @param id - ID của bản ghi quyền hạn người dùng
   * @returns Promise trả về đối tượng UserPermission hoặc null nếu không tìm thấy
   */
  findById(id: string): Promise<UserPermission | null>;
  
  /**
   * Tìm kiếm tất cả quyền hạn của một người dùng
   * @param userId - ID của người dùng cần tìm quyền hạn
   * @returns Promise trả về mảng các đối tượng UserPermission
   */
  findByUserId(userId: string): Promise<UserPermission[]>;
  
  /**
   * Tìm kiếm quyền hạn của người dùng kèm thông tin chi tiết quyền hạn
   * @param userId - ID của người dùng cần tìm quyền hạn
   * @returns Promise trả về mảng các đối tượng UserPermission kèm Permission
   */
  findByUserIdWithPermissions(userId: string): Promise<(UserPermission & { permission: Permission })[]>;
  
  /**
   * Tìm kiếm các quyền hạn được cấp phép cho người dùng
   * @param userId - ID của người dùng
   * @returns Promise trả về mảng các đối tượng UserPermission được cấp phép
   */
  findGrantedByUserId(userId: string): Promise<UserPermission[]>;
  
  /**
   * Tìm kiếm các quyền hạn bị từ chối cho người dùng
   * @param userId - ID của người dùng
   * @returns Promise trả về mảng các đối tượng UserPermission bị từ chối
   */
  findDeniedByUserId(userId: string): Promise<UserPermission[]>;
  
  /**
   * Tìm kiếm quyền hạn cụ thể của một người dùng
   * @param userId - ID của người dùng
   * @param permissionId - ID của quyền hạn
   * @returns Promise trả về đối tượng UserPermission hoặc null nếu không tìm thấy
   */
  findByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission | null>;
  
  /**
   * Tìm kiếm các quyền hạn người dùng đã hết hạn
   * @returns Promise trả về mảng các đối tượng UserPermission đã hết hạn
   */
  findExpired(): Promise<UserPermission[]>;
  
  /**
   * Tạo mới một bản ghi quyền hạn cho người dùng
   * @param data - Dữ liệu đầu vào để tạo quyền hạn người dùng
   * @returns Promise trả về đối tượng UserPermission đã được tạo
   */
  create(data: Prisma.UserPermissionCreateInput): Promise<UserPermission>;
  
  /**
   * Cập nhật thông tin quyền hạn người dùng
   * @param id - ID của bản ghi quyền hạn người dùng cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns Promise trả về đối tượng UserPermission đã được cập nhật
   */
  update(id: string, data: Prisma.UserPermissionUpdateInput): Promise<UserPermission>;
  
  /**
   * Xóa một bản ghi quyền hạn người dùng
   * @param id - ID của bản ghi quyền hạn người dùng cần xóa
   * @returns Promise trả về đối tượng UserPermission đã bị xóa
   */
  delete(id: string): Promise<UserPermission>;
  
  /**
   * Xóa quyền hạn cụ thể của một người dùng
   * @param userId - ID của người dùng
   * @param permissionId - ID của quyền hạn cần xóa
   * @returns Promise trả về đối tượng UserPermission đã bị xóa
   */
  deleteByUserAndPermission(userId: string, permissionId: string): Promise<UserPermission>;
  
  /**
   * Xóa tất cả quyền hạn của một người dùng
   * @param userId - ID của người dùng cần xóa tất cả quyền hạn
   * @returns Promise trả về thông tin về số lượng bản ghi đã được xóa
   */
  deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload>;
}