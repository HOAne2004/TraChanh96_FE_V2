import apiClient from "@/shared/services/http/axios";
import type { ApiResponse } from "@/shared/types/api";
import type {
  CustomerProductCard,
  ProductDetail,
  ProductFilterParams,
  PagedResult
} from "../types/product";

export const productService = {
  // Lấy danh sách sản phẩm cho khách hàng (có phân trang & lọc)
  getCatalogProducts(params: ProductFilterParams): Promise<PagedResult<CustomerProductCard>> {
    return apiClient
      .get<ApiResponse<PagedResult<CustomerProductCard>>>('/catalog/products', { params })
      .then((res) => res.data.data);
  },

  // Lấy chi tiết sản phẩm theo Slug (Khi khách click vào 1 món)
  getProductBySlug(slug: string): Promise<ProductDetail> {
    return apiClient
      .get<ApiResponse<ProductDetail>>(`/catalog/products/${slug}`)
      .then((res) => res.data.data);
  }
};
