import { PaginationParams } from "./common";

export interface CategoryIncludes {
  parentCategory?: boolean;
  childCategories?: boolean;
  products?: boolean;
}

export interface CategoryFilters extends PaginationParams {
    searchTerm?: string;
    parentId?: string;
}