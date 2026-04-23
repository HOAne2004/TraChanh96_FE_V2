import apiClient from '@/shared/services/http/axios';
import type { AddressDto, AddressFormRequest } from '../types/address';
import type { ApiResponse } from "@/shared/types/api";

const BASE_URL = '/identity/users/me/addresses';

export const addressService = {
  // 1. Lấy danh sách địa chỉ
  getMyAddresses(): Promise<AddressDto[]> {
    return apiClient
      .get<ApiResponse<AddressDto[]>>(BASE_URL)
      .then((res) => res.data.data);
  },

  // 2. Lấy chi tiết 1 địa chỉ (dùng khi click nút Sửa)
  getAddressById(id: number): Promise<AddressDto> {
    return apiClient
      .get<ApiResponse<AddressDto>>(`${BASE_URL}/${id}`)
      .then((res) => res.data.data);
  },

  // 3. Thêm địa chỉ mới
  addAddress(data: AddressFormRequest): Promise<string> {
    return apiClient
      .post<ApiResponse<null>>(BASE_URL, data)
      .then((res) => res.data.message || 'Thêm địa chỉ thành công');
  },

  // 4. Cập nhật địa chỉ
  updateAddress(id: number, data: AddressFormRequest): Promise<string> {
    const payload = {
      ...data,
      addressId: id
    };
    return apiClient
      .put<ApiResponse<null>>(`${BASE_URL}/${id}`, payload)
      .then((res) => res.data.message || 'Cập nhật địa chỉ thành công');
  },

  // 5. Xóa địa chỉ
  deleteAddress(id: number): Promise<string> {
    return apiClient
      .delete<ApiResponse<null>>(`${BASE_URL}/${id}`)
      .then((res) => res.data.message || 'Đã xóa địa chỉ');
  }
};
