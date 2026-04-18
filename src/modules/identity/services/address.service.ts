import apiClient from '@/shared/services/http/axios';
import type { AddressDto, AddressFormRequest } from '../types/address';

const BASE_URL = '/identity/users/me/addresses';

export const addressService = {
  // 1. Lấy danh sách địa chỉ
  async getMyAddresses(): Promise<AddressDto[]> {
    const response: any = await apiClient.get(BASE_URL);
    return response.data || response.Data || response || [];
  },

  // 2. Lấy chi tiết 1 địa chỉ (dùng khi click nút Sửa)
  async getAddressById(id: number): Promise<AddressDto> {
    const response: any = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data || response.Data || response;
  },

  // 3. Thêm địa chỉ mới
  async addAddress(data: AddressFormRequest): Promise<string> {
    const response: any = await apiClient.post(BASE_URL, data);
    return response.message || response.Message || 'Thêm địa chỉ thành công';
  },

  async updateAddress(id: number, data: AddressFormRequest): Promise<string> {
    const response: any = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.message || response.Message || 'Cập nhật địa chỉ thành công';
  },

  // 5. Xóa địa chỉ
  async deleteAddress(id: number): Promise<string> {
    const response: any = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.message || response.Message || 'Đã xóa địa chỉ';
  }
};
