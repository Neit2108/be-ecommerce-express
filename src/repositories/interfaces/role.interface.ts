import { Prisma, Role, RolePermission, RoleType, UserRole } from "@prisma/client";
import { RoleFilters } from "../../types/role.types";

export interface IRoleRepository {
  /**
   * Tạo mới một vai trò
   * @param data - Dữ liệu đầu vào để tạo vai trò mới
   * @returns Promise trả về đối tượng Role đã được tạo
   */
  create(data: Prisma.RoleCreateInput): Promise<Role>;
  
  /**
   * Tìm kiếm vai trò theo ID
   * @param id - ID của vai trò cần tìm
   * @returns Promise trả về đối tượng Role hoặc null nếu không tìm thấy
   */
  findById(id: string): Promise<Role | null>;
  
  /**
   * Tìm kiếm vai trò theo tên
   * @param name - Tên của vai trò cần tìm
   * @returns Promise trả về đối tượng Role hoặc null nếu không tìm thấy
   */
  findByName(name: string): Promise<Role | null>;
  
  /**
   * Tìm kiếm tất cả vai trò theo loại
   * @param type - Loại vai trò cần tìm kiếm
   * @returns Promise trả về mảng các đối tượng Role
   */
  findByType(type: RoleType): Promise<Role[]>;
  
  /**
   * Tìm kiếm nhiều vai trò với các điều kiện lọc
   * @param filters - Các điều kiện lọc cho vai trò
   * @returns Promise trả về mảng các đối tượng Role
   */
  findMany(filters: RoleFilters): Promise<Role[]>;
  
  /**
   * Cập nhật thông tin vai trò
   * @param id - ID của vai trò cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns Promise trả về đối tượng Role đã được cập nhật
   */
  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role>;
  
  /**
   * Xóa mềm vai trò (soft delete)
   * @param id - ID của vai trò cần xóa
   * @param deletedBy - ID của người thực hiện xóa
   * @returns Promise trả về đối tượng Role đã bị xóa mềm
   */
  softDelete(id: string, deletedBy: string): Promise<Role>;
  
  /**
   * Khôi phục vai trò đã bị xóa mềm
   * @param id - ID của vai trò cần khôi phục
   * @returns Promise trả về đối tượng Role đã được khôi phục
   */
  restore(id: string): Promise<Role>;
  
  /**
   * Đếm số lượng vai trò theo điều kiện lọc
   * @param filters - Các điều kiện lọc cho vai trò
   * @returns Promise trả về số lượng vai trò
   */
  count(filters: RoleFilters): Promise<number>;
  
  /**
   * Tìm kiếm vai trò kèm thông tin quyền hạn
   * @param id - ID của vai trò cần tìm
   * @returns Promise trả về đối tượng Role kèm mảng RolePermission
   */
  findWithPermissions(id: string): Promise<Role & { rolePermissions: RolePermission[] }>;
}

/**
 * Interface repository cho việc quản lý vai trò của người dùng (UserRole)
 * Cung cấp các phương thức để gán và quản lý vai trò cho từng người dùng, bao gồm cả quản lý thời hạn
 */
export interface IUserRoleRepository {
  /**
   * Tìm kiếm vai trò người dùng theo ID
   * @param id - ID của bản ghi vai trò người dùng
   * @returns Promise trả về đối tượng UserRole hoặc null nếu không tìm thấy
   */
  findById(id: string): Promise<UserRole | null>;
  
  /**
   * Tìm kiếm tất cả vai trò của một người dùng
   * @param userId - ID của người dùng cần tìm vai trò
   * @returns Promise trả về mảng các đối tượng UserRole
   */
  findByUserId(userId: string): Promise<UserRole[]>;
  
  /**
   * Tìm kiếm vai trò của người dùng kèm thông tin chi tiết vai trò
   * @param userId - ID của người dùng cần tìm vai trò
   * @returns Promise trả về mảng các đối tượng UserRole kèm Role
   */
  findByUserIdWithRoles(userId: string): Promise<(UserRole & { role: Role })[]>;
  
  /**
   * Tìm kiếm các vai trò đang hoạt động của người dùng
   * @param userId - ID của người dùng
   * @returns Promise trả về mảng các đối tượng UserRole đang hoạt động
   */
  findActiveByUserId(userId: string): Promise<UserRole[]>;
  
  /**
   * Tìm kiếm tất cả người dùng có vai trò cụ thể
   * @param roleId - ID của vai trò
   * @returns Promise trả về mảng các đối tượng UserRole
   */
  findByRoleId(roleId: string): Promise<UserRole[]>;
  
  /**
   * Tìm kiếm vai trò cụ thể của một người dùng
   * @param userId - ID của người dùng
   * @param roleId - ID của vai trò
   * @returns Promise trả về đối tượng UserRole hoặc null nếu không tìm thấy
   */
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  
  /**
   * Tìm kiếm các vai trò người dùng đã hết hạn
   * @returns Promise trả về mảng các đối tượng UserRole đã hết hạn
   */
  findExpired(): Promise<UserRole[]>;
  
  /**
   * Tạo mới một bản ghi vai trò cho người dùng
   * @param data - Dữ liệu đầu vào để tạo vai trò người dùng
   * @returns Promise trả về đối tượng UserRole đã được tạo
   */
  create(data: Prisma.UserRoleCreateInput): Promise<UserRole>;
  
  /**
   * Cập nhật thông tin vai trò người dùng
   * @param id - ID của bản ghi vai trò người dùng cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns Promise trả về đối tượng UserRole đã được cập nhật
   */
  update(id: string, data: Prisma.UserRoleUpdateInput): Promise<UserRole>;
  
  /**
   * Xóa một bản ghi vai trò người dùng
   * @param id - ID của bản ghi vai trò người dùng cần xóa
   * @returns Promise trả về đối tượng UserRole đã bị xóa
   */
  delete(id: string): Promise<UserRole>;
  
  /**
   * Xóa vai trò cụ thể của một người dùng
   * @param userId - ID của người dùng
   * @param roleId - ID của vai trò cần xóa
   * @returns Promise trả về đối tượng UserRole đã bị xóa
   */
  deleteByUserAndRole(userId: string, roleId: string): Promise<UserRole>;
  
  /**
   * Xóa tất cả vai trò của một người dùng
   * @param userId - ID của người dùng cần xóa tất cả vai trò
   * @returns Promise trả về thông tin về số lượng bản ghi đã được xóa
   */
  deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload>;
}