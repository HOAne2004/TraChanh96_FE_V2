import apiClient from "@/shared/services/http/axios";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload, ToggleActivePayload } from "../types/category";
import type { ApiResponse } from "@/shared/types/api";

export const categoryService = {
  getCategories(): Promise<Category[]> {
    return apiClient
      .get<ApiResponse<Category[]>>('/catalog/categories')
      .then((res) => res.data.data);
  },

  getCategoryById(id: number): Promise<Category> {
    return apiClient
      .get<ApiResponse<Category>>(`/catalog/categories/${id}`)
      .then((res) => res.data.data);
  },

  createCategory(data: CreateCategoryPayload): Promise<number> {
    return apiClient
      .post<ApiResponse<number>>('/admin/catalog/categories', data)
      .then((res) => res.data.data);
  },

  updateCategory(id: number, data: UpdateCategoryPayload): Promise<string> {
    return apiClient
      .put<ApiResponse<number>>(`/admin/catalog/categories/${id}`, data)
      .then((res) => res.data.message || 'Cập nhật thành công');
  },

  toggleActive(data: ToggleActivePayload): Promise<boolean> {
    return apiClient
      .put<ApiResponse<boolean>>('/admin/catalog/categories/toggle-active', data)
      .then((res) => res.data.data);
  },

  deleteCategory(id: number): Promise<number> {
    return apiClient
      .delete<ApiResponse<number>>(`/admin/catalog/categories/${id}`)
      .then((res) => res.data.data);
  }

}
