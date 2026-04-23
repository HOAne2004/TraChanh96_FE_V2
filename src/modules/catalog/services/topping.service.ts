// src/modules/catalog/services/topping.service.ts
import apiClient from "@/shared/services/http/axios";
import type { Topping } from '../types/topping';
import type { ApiResponse } from "@/shared/types/api";

export const ToppingService = {
//Topping đang làm ẩu chưa khớp với BE sau này phát triển Admin để ý
  async getAllToppings(): Promise<Topping[]> {
    const response = await apiClient.get<ApiResponse<Topping[]>>('/catalog/toppings');
    return response.data.data;
  },

  async createTopping(payload: Topping) {
    const response = await apiClient.post<ApiResponse<Topping>>('/catalog/toppings', payload);
    return response.data.data;
  },

  async updateTopping(id: number, payload: Topping) {
    const response = await apiClient.put<ApiResponse<Topping>>(`/catalog/toppings/${id}`, payload);
    return response.data.data;
  },

  async deleteTopping(id: number) {
    const response = await apiClient.delete<ApiResponse<Topping>>(`/catalog/toppings/${id}`);
    return response.data;
  }
};