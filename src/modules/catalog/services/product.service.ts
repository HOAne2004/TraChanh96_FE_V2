import apiClient from "@/shared/services/http/axios";
import type { ApiResponse } from "@/shared/types/api";
import type { CustomerProductCard, ProductDetail, ProductFilterParams } from "../types/product";
import type { PagedResult } from "@/shared/types/api";

export const productService = {
  // Lấy danh sách sản phẩm cho khách hàng (có phân trang & lọc)
  getCatalogProducts(params: ProductFilterParams): Promise<PagedResult<CustomerProductCard>> {
    return apiClient
      .get<ApiResponse<PagedResult<CustomerProductCard>>>('/catalog/products', { params })
      .then((res) => res.data.data);
  },

  getProductBySlug(slug: string, storeId?: string): Promise<ProductDetail> {
    const url = storeId 
      ? `/catalog/products/${slug}?storeId=${storeId}` 
      : `/catalog/products/${slug}`;
    return apiClient
      .get<ApiResponse<ProductDetail>>(url)
      .then((res) => res.data.data);
  }
};
