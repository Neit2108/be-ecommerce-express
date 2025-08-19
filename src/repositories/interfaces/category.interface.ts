import { Category, Prisma, Product, ProductCategory } from '@prisma/client';
import { CategoryFilters, CategoryIncludes } from '../../types/category.types';
import { PaginationParams } from '../../types/common';

// export type CategoryWithRelations = Category & {
//   parentCategory?: Category;
//   childCategories?: Category[];
//   products?: ProductCategory[];
// };

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    parentCategory: true;
    childCategories: true;
    products: true;
  };
}>;

export interface ICategoryRepository {
  /**
   * Tạo mới một danh mục
   * @param {Prisma.CategoryCreateInput} data - Dữ liệu tạo danh mục
   * @returns {Promise<Category>} - Danh mục vừa được tạo
   */
  create(data: Prisma.CategoryCreateInput): Promise<Category>;
  /**
   * Tìm danh mục theo ID với tùy chọn include các quan hệ
   * @param {string} id - ID của danh mục
   * @param {CategoryIncludes} [include] - Tùy chọn include các quan hệ
   * @returns {Promise<CategoryWithRelations | null>} - Danh mục với quan hệ hoặc null
   */
  findById(
    id: string,
    include?: CategoryIncludes
  ): Promise<CategoryWithRelations | null>;
  /**
   * Cập nhật thông tin danh mục
   * @param {string} id - ID của danh mục
   * @param {Prisma.CategoryUpdateInput} data - Dữ liệu cập nhật
   * @returns {Promise<Category>} - Danh mục sau khi cập nhật
   */
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  /**
   * Xóa mềm danh mục
   * @param {string} id - ID của danh mục
   * @param {string} deletedBy - ID người thực hiện xóa
   * @returns {Promise<void>}
   */
  softDelete(id: string, deletedBy: string): Promise<void>;

  // Hierarchy methods
  /**
   * Tìm tất cả danh mục gốc (không có parent)
   * @returns {Promise<Category[]>} - Danh sách danh mục gốc
   */
  findRootCategories(): Promise<Category[]>;
  /**
   * Tìm tất cả danh mục con của một danh mục cha
   * @param {string} parentId - ID của danh mục cha
   * @returns {Promise<Category[]>} - Danh sách danh mục con
   */
  findChildCategories(parentId: string): Promise<Category[]>;
  /**
   * Tìm đường dẫn từ danh mục gốc đến danh mục hiện tại (breadcrumb)
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<Category[]>} - Mảng đường dẫn danh mục từ gốc đến hiện tại
   */
  findCategoryPath(categoryId: string): Promise<Category[]>;
  /**
   * Tìm tất cả danh mục con cháu của một danh mục (đệ quy)
   * @param {string} categoryId - ID của danh mục cha
   * @returns {Promise<Category[]>} - Danh sách tất cả danh mục con cháu
   */
  findAllDescendants(categoryId: string): Promise<Category[]>;

  // Query methods
  /**
   * Tìm kiếm danh mục theo tên (không phân biệt hoa thường)
   * @param {string} name - Tên danh mục cần tìm
   * @returns {Promise<Category[]>} - Danh sách danh mục phù hợp
   */
  searchByName(name: string): Promise<Category[]>;
  /**
   * Lấy tất cả danh mục với tùy chọn bao gồm cấu trúc phân cấp
   * @param {boolean} [includeHierarchy] - Có bao gồm cấu trúc phân cấp không
   * @returns {Promise<CategoryWithRelations[]>} - Danh sách tất cả danh mục
   */
  findAll(includeHierarchy?: boolean): Promise<CategoryWithRelations[]>;
  /**
   * Tìm kiếm danh mục theo bộ lọc
   * @param {CategoryFilters} filters - Bộ lọc tìm kiếm
   * @returns {Promise<Category[]>} - Danh sách danh mục phù hợp
   */
  findMany(filters: CategoryFilters): Promise<Category[]>;

  // Validation methods
  /**
   * Kiểm tra xem một danh mục có phải là cha của danh mục khác không
   * @param {string} categoryId - ID danh mục cần kiểm tra
   * @param {string} potentialParentId - ID danh mục có thể là cha
   * @returns {Promise<boolean>} - True nếu là quan hệ cha-con
   */
  isParentCategory(
    categoryId: string,
    potentialParentId: string
  ): Promise<boolean>;
  /**
   * Kiểm tra xem danh mục có chứa sản phẩm nào không
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<boolean>} - True nếu có sản phẩm
   */
  hasProducts(categoryId: string): Promise<boolean>;

  // Count methods
  /**
   * Đếm tổng số danh mục theo bộ lọc
   * @param {CategoryFilters} [filters] - Bộ lọc (tùy chọn)
   * @returns {Promise<number>} - Tổng số danh mục
   */
  count(filters?: CategoryFilters): Promise<number>;
  /**
   * Đếm số danh mục con của một danh mục cha
   * @param {string} parentId - ID của danh mục cha
   * @returns {Promise<number>} - Số lượng danh mục con
   */
  countChildren(parentId: string): Promise<number>;
  
}

export interface IProductCategoryRepository {
  // Basic CRUD
  /**
   * Tạo quan hệ giữa sản phẩm và danh mục
   * @param {Prisma.ProductCategoryCreateInput} data - Dữ liệu tạo quan hệ
   * @returns {Promise<ProductCategory>} - Quan hệ sản phẩm-danh mục vừa tạo
   */
  create(data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory>;
  /**
   * Tìm quan hệ sản phẩm-danh mục theo ID
   * @param {string} id - ID của quan hệ
   * @returns {Promise<ProductCategory | null>} - Quan hệ hoặc null
   */
  findById(id: string): Promise<ProductCategory | null>;
  /**
   * Xóa mềm quan hệ sản phẩm-danh mục
   * @param {string} id - ID của quan hệ
   * @param {string} deletedBy - ID người thực hiện xóa
   * @returns {Promise<void>}
   */
  softDelete(id: string, deletedBy: string): Promise<void>;

  // Query methods
  /**
   * Tìm tất cả quan hệ danh mục của một sản phẩm
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<ProductCategory[]>} - Danh sách quan hệ danh mục
   */
  findByProductId(productId: string): Promise<ProductCategory[]>;
  /**
   * Tìm tất cả quan hệ sản phẩm của một danh mục
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<ProductCategory[]>} - Danh sách quan hệ sản phẩm
   */
  findByCategoryId(categoryId: string): Promise<ProductCategory[]>;
  /**
   * Tìm tất cả sản phẩm trong một danh mục với phân trang
   * @param {string} categoryId - ID của danh mục
   * @param {PaginationParams} [pagination] - Tham số phân trang (tùy chọn)
   * @returns {Promise<Product[]>} - Danh sách sản phẩm trong danh mục
   */
  findProductsInCategory(
    categoryId: string,
    pagination?: PaginationParams
  ): Promise<Product[]>;

  // Bulk operations
  /**
   * Thêm một sản phẩm vào nhiều danh mục
   * @param {string} productId - ID của sản phẩm
   * @param {string[]} categoryIds - Danh sách ID danh mục
   * @param {string} createdBy - ID người tạo
   * @returns {Promise<void>}
   */
  addProductToCategories(
    productId: string,
    categoryIds: string[],
    createdBy: string
  ): Promise<void>;
  /**
   * Xóa sản phẩm khỏi nhiều danh mục
   * @param {string} productId - ID của sản phẩm
   * @param {string[]} categoryIds - Danh sách ID danh mục
   * @param {string} deletedBy - ID người thực hiện xóa
   * @returns {Promise<void>}
   */
  removeProductFromCategories(
    productId: string,
    categoryIds: string[],
    deletedBy: string
  ): Promise<void>;
  /**
   * Thay thế toàn bộ danh mục của sản phẩm (xóa cũ, thêm mới)
   * @param {string} productId - ID của sản phẩm
   * @param {string[]} categoryIds - Danh sách ID danh mục mới
   * @param {string} updatedBy - ID người cập nhật
   * @returns {Promise<void>}
   */
  replaceProductCategories(
    productId: string,
    categoryIds: string[],
    updatedBy: string
  ): Promise<void>;

  // Validation methods
  /**
   * Kiểm tra xem sản phẩm có thuộc danh mục không
   * @param {string} productId - ID của sản phẩm
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<boolean>} - True nếu sản phẩm thuộc danh mục
   */
  isProductInCategory(productId: string, categoryId: string): Promise<boolean>;

  // Count methods
  /**
   * Đếm số sản phẩm trong một danh mục
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<number>} - Số lượng sản phẩm trong danh mục
   */
  countProductsInCategory(categoryId: string): Promise<number>;
  /**
   * Đếm số danh mục mà một sản phẩm thuộc về
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<number>} - Số lượng danh mục của sản phẩm
   */
  countCategoriesForProduct(productId: string): Promise<number>;
}
