import apiClient from '@/shared/services/http/axios'
import type { ApiResponse, PagedResult } from '@/shared/types/api'
import type {
  UserAdminDto,
  CreateUserByAdminPayload,
  AssignRolePayload,
  UpdateUserByAdminPayload,
} from '../types/admin'

const BASE_URL = '/identity/admin/users'

export const adminUserService = {
  getUsers(params: any): Promise<PagedResult<UserAdminDto>> {
    return apiClient
      .get<ApiResponse<PagedResult<UserAdminDto>>>(BASE_URL, { params })
      .then((res) => res.data.data)
  },

  getUserById(id: string): Promise<UserAdminDto> {
    return apiClient
      .get<ApiResponse<UserAdminDto>>(`${BASE_URL}/${id}`)
      .then((res) => res.data.data)
  },

  createUser(data: CreateUserByAdminPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<string>>(BASE_URL, data)
      .then((res) => res.data.message || 'Tạo tài khoản thành công')
  },

updateUser(data: UpdateUserByAdminPayload): Promise<string> {
  return apiClient.put<ApiResponse<string>>(`${BASE_URL}/${data.id}`, data)
    .then((res) => res.data.message || 'Cập nhật tài khoản thành công')
}
,
  assignRoles(id: string, roleIds: string[]): Promise<string> {
    return apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/${id}/roles`, roleIds)
      .then((res) => res.data.message || 'Cấp quyền thành công')
  },

  lockUser(id: string, lockoutDays: number): Promise<string> {
    return apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/${id}/lock`, { lockoutDays })
      .then((res) => res.data.message || 'Đã khóa tài khoản')
  },

  unlockUser(id: string): Promise<string> {
    return apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/${id}/unlock`)
      .then((res) => res.data.message || 'Đã mở khóa')
  },

  deleteUser(id: string): Promise<string> {
    return apiClient
      .delete<ApiResponse<null>>(`${BASE_URL}/${id}`)
      .then((res) => res.data.message || 'Đã xóa người dùng')
  },

  restoreUser(id: string): Promise<string> {
    return apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/${id}/restore`)
      .then((res) => res.data.message || 'Đã khôi phục')
  },
}
