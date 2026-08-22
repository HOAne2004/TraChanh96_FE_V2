import apiClient from '@/shared/services/http/axios';
import type { ApiResponse, PagedResult } from "@/shared/types/api";
import type { RoleAdminDto, PermissionGroupDto, CreateRolePayload, UpdateRolePayload } from '../types/admin';

const BASE_URL = '/identity/admin/roles';

export const adminRoleService = {
  getRoles(params: any): Promise<PagedResult<RoleAdminDto>> {
    return apiClient.get<ApiResponse<PagedResult<RoleAdminDto>>>(BASE_URL, { params }).then(res => res.data.data);
  },

  getRoleById(id: string): Promise<RoleAdminDto> {
    return apiClient.get<ApiResponse<RoleAdminDto>>(`${BASE_URL}/${id}`).then(res => res.data.data);
  },

  createRole(data: CreateRolePayload): Promise<string> {
    return apiClient.post<ApiResponse<string>>(BASE_URL, data).then(res => res.data.message || 'Tạo vai trò thành công');
  },

  updateRole(id: string, data: UpdateRolePayload): Promise<string> {
    return apiClient.put<ApiResponse<null>>(`${BASE_URL}/${id}`, data).then(res => res.data.message || 'Cập nhật thành công');
  },

  deleteRole(id: string): Promise<string> {
    return apiClient.delete<ApiResponse<null>>(`${BASE_URL}/${id}`).then(res => res.data.message || 'Đã xóa vai trò');
  },

  getPermissionMatrix(): Promise<PermissionGroupDto[]> {
    return apiClient.get<ApiResponse<PermissionGroupDto[]>>(`${BASE_URL}/permissions/matrix`).then(res => res.data.data);
  },

  updateRolePermissions(id: string, permissionCodes: string[]): Promise<string> {
    return apiClient.put<ApiResponse<null>>(`${BASE_URL}/${id}/permissions`, permissionCodes).then(res => res.data.message || 'Cập nhật ma trận quyền thành công');
  }
};
