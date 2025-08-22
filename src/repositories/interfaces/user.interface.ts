import { User, UserStatus, Prisma } from '@prisma/client';

/**
 * Interface repository cho việc quản lý người dùng (User)
 * Cung cấp các phương thức CRUD đầy đủ, truy vấn nâng cao, và các chức năng đặc biệt cho quản lý người dùng
 */
export interface IUserRepository {
  // Basic CRUD Operations - Các thao tác CRUD cơ bản
  
  /**
   * Tìm kiếm người dùng theo ID
   * @param id - ID của người dùng cần tìm
   * @param include - Các quan hệ cần include khi truy vấn (tùy chọn)
   * @returns Promise trả về đối tượng User hoặc null nếu không tìm thấy
   */
  findById(id: string, include?: Prisma.UserInclude): Promise<User | null>;
  
  /**
   * Tìm kiếm người dùng duy nhất theo điều kiện
   * @param where - Điều kiện tìm kiếm unique
   * @param include - Các quan hệ cần include khi truy vấn (tùy chọn)
   * @returns Promise trả về đối tượng User hoặc null nếu không tìm thấy
   */
  findUnique(where: Prisma.UserWhereUniqueInput, include?: Prisma.UserInclude): Promise<User | null>;
  
  /**
   * Tìm kiếm người dùng đầu tiên theo điều kiện
   * @param where - Điều kiện tìm kiếm
   * @param include - Các quan hệ cần include khi truy vấn (tùy chọn)
   * @returns Promise trả về đối tượng User đầu tiên hoặc null nếu không tìm thấy
   */
  findFirst(where: Prisma.UserWhereInput, include?: Prisma.UserInclude): Promise<User | null>;
  
  /**
   * Tìm kiếm nhiều người dùng với các tùy chọn nâng cao
   * @param args - Các tham số tìm kiếm bao gồm where, include, orderBy, pagination, v.v.
   * @returns Promise trả về mảng các đối tượng User
   */
  findMany(args: Prisma.UserFindManyArgs): Promise<User[]>;
  
  /**
   * Tạo mới một người dùng
   * @param data - Dữ liệu đầu vào để tạo người dùng mới
   * @returns Promise trả về đối tượng User đã được tạo
   */
  create(data: Prisma.UserCreateInput): Promise<User>;
  
  /**
   * Cập nhật thông tin người dùng
   * @param where - Điều kiện xác định người dùng cần cập nhật
   * @param data - Dữ liệu cần cập nhật
   * @returns Promise trả về đối tượng User đã được cập nhật
   */
  update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User>;
  
  /**
   * Cập nhật nhiều người dùng cùng lúc
   * @param where - Điều kiện lọc những người dùng cần cập nhật
   * @param data - Dữ liệu cần cập nhật cho tất cả người dùng
   * @returns Promise trả về thông tin về số lượng bản ghi đã được cập nhật
   */
  updateMany(where: Prisma.UserWhereInput, data: Prisma.UserUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
  
  /**
   * Xóa một người dùng
   * @param where - Điều kiện xác định người dùng cần xóa
   * @returns Promise trả về đối tượng User đã bị xóa
   */
  delete(where: Prisma.UserWhereUniqueInput): Promise<User>;
  
  /**
   * Xóa nhiều người dùng cùng lúc
   * @param where - Điều kiện lọc những người dùng cần xóa
   * @returns Promise trả về thông tin về số lượng bản ghi đã được xóa
   */
  deleteMany(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload>;
  
  /**
   * Đếm số lượng người dùng theo điều kiện
   * @param where - Điều kiện lọc (tùy chọn)
   * @returns Promise trả về số lượng người dùng
   */
  count(where?: Prisma.UserWhereInput): Promise<number>;
  
  // Advanced Query Operations - Các thao tác truy vấn nâng cao
  
  /**
   * Nhóm người dùng theo các trường và thực hiện tính toán thống kê
   * @param args - Tham số group by bao gồm các trường nhóm và tính toán
   * @returns Promise trả về mảng kết quả được nhóm
   */
  groupBy<T extends Prisma.UserGroupByArgs>(args: Prisma.SelectSubset<T, Prisma.UserGroupByArgs>): Promise<Prisma.GetUserGroupByPayload<T>[]>;
  
  /**
   * Thực hiện các phép tính tổng hợp trên dữ liệu người dùng
   * @param args - Tham số aggregate bao gồm các phép tính như count, sum, avg, min, max
   * @returns Promise trả về kết quả tổng hợp
   */
  aggregate<T extends Prisma.UserAggregateArgs>(args: Prisma.SelectSubset<T, Prisma.UserAggregateArgs>): Promise<Prisma.GetUserAggregateType<T>>;

  // Specialized Query Methods - Các phương thức truy vấn chuyên biệt
  
  /**
   * Tìm kiếm người dùng theo địa chỉ email
   * @param email - Địa chỉ email cần tìm kiếm
   * @param include - Các quan hệ cần include khi truy vấn (tùy chọn)
   * @returns Promise trả về đối tượng User hoặc null nếu không tìm thấy
   */
  findByEmail(email: string, include?: Prisma.UserInclude): Promise<User | null>;
  
  /**
   * Tìm kiếm người dùng theo số điện thoại
   * @param phoneNumber - Số điện thoại cần tìm kiếm
   * @param include - Các quan hệ cần include khi truy vấn (tùy chọn)
   * @returns Promise trả về đối tượng User hoặc null nếu không tìm thấy
   */
  findByPhoneNumber(phoneNumber: string, include?: Prisma.UserInclude): Promise<User | null>;
  
  /**
   * Kiểm tra xem email đã tồn tại trong hệ thống chưa
   * @param email - Địa chỉ email cần kiểm tra
   * @returns Promise trả về true nếu email đã tồn tại, false nếu chưa
   */
  existsByEmail(email: string): Promise<boolean>;
  
  /**
   * Kiểm tra xem số điện thoại đã tồn tại trong hệ thống chưa
   * @param phoneNumber - Số điện thoại cần kiểm tra
   * @returns Promise trả về true nếu số điện thoại đã tồn tại, false nếu chưa
   */
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
  
  // Special Operations - Các thao tác đặc biệt
  
  /**
   * Xóa mềm người dùng (soft delete)
   * @param id - ID của người dùng cần xóa mềm
   * @param deletedBy - ID của người thực hiện xóa (tùy chọn)
   * @returns Promise trả về đối tượng User đã bị xóa mềm
   */
  softDelete(id: string, deletedBy?: string): Promise<User>;
  
  /**
   * Khôi phục người dùng đã bị xóa mềm
   * @param id - ID của người dùng cần khôi phục
   * @returns Promise trả về đối tượng User đã được khôi phục
   */
  restore(id: string): Promise<User>;

  /**
   * Kiểm tra xem người dùng đã được xác minh chưa
   * @param id - ID của người dùng cần kiểm tra
   * @returns Promise trả về true nếu người dùng đã được xác minh, false nếu chưa
   */
  isVerified(id: string): Promise<boolean>;
}