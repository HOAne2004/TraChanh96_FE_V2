import apiClient from '@/shared/services/http/axios';
import type { AddressDto, AddressFormRequest } from '../types/address';

const BASE_URL = '/identity/users/me/addresses';

export const addressService = {
  // 1. Lấy danh sách địa chỉ
  async getMyAddresses(): Promise<AddressDto[]> {
    const response = (await apiClient.get(BASE_URL)) as Record<string, unknown>;
    return (response.data || response.Data || response || []) as AddressDto[];
  },

  // 2. Lấy chi tiết 1 địa chỉ (dùng khi click nút Sửa)
  async getAddressById(id: number): Promise<AddressDto> {
    const response = (await apiClient.get(`${BASE_URL}/${id}`)) as Record<string, unknown>;
    return (response.data || response.Data || response) as AddressDto;
  },

  // 3. Thêm địa chỉ mới
  async addAddress(data: AddressFormRequest): Promise<string> {
    const response = (await apiClient.post(BASE_URL, data)) as Record<string, unknown>;
    return (response.message || response.Message || 'Thêm địa chỉ thành công') as string;
  },

  async updateAddress(id: number, data: AddressFormRequest): Promise<string> {
    const payload = {
      ...data,
      addressId: id
    };

    const response = (await apiClient.put(`${BASE_URL}/${id}`, payload)) as Record<string, unknown>;
    return (response.message || response.Message || 'Cập nhật địa chỉ thành công') as string;
  },

  // 5. Xóa địa chỉ
  async deleteAddress(id: number): Promise<string> {
    const response = (await apiClient.delete(`${BASE_URL}/${id}`)) as Record<string, unknown>;
    return (response.message || response.Message || 'Đã xóa địa chỉ') as string;
  }
};
