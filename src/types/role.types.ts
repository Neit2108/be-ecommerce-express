import { PaginationParams } from "./common";

export interface RoleFilters extends PaginationParams{

}

export interface RoleResponse {
    id: string;
    name: string;
    description?: string;
}