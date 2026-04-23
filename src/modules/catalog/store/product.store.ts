import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productService } from '../services/product.service';
import type { CustomerProductCard, ProductDetail, ProductFilterParams } from '../types/product';
import { extractErrorMessage } from '@/shared/utils/errorHandler';

export const useProductStore = defineStore('customerProduct', () => {
  // --- STATE ---
  const products = ref<CustomerProductCard[]>([]);
  const totalProducts = ref(0);

  const currentProductDetail = ref<ProductDetail | null>(null);

  const isLoading = ref(false);
  const isLoadingDetail = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  // 1. Lấy danh sách hiển thị Menu
  const fetchProducts = async (params: ProductFilterParams = { pageIndex: 1, pageSize: 12 }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await productService.getCatalogProducts(params);
      products.value = data.items;
      totalProducts.value = data.totalCount;
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      isLoading.value = false;
    }
  };

  // 2. Lấy chi tiết 1 sản phẩm khi khách hàng bấm vào (ví dụ: bấm vào "Trà Đào Cam Sả")
  const fetchProductDetail = async (slug: string) => {
    isLoadingDetail.value = true;
    error.value = null;
    currentProductDetail.value = null; // Reset lại data cũ
    try {
      const data = await productService.getProductBySlug(slug);
      currentProductDetail.value = data;
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải chi tiết sản phẩm');
    } finally {
      isLoadingDetail.value = false;
    }
  };

  return {
    // State
    products,
    totalProducts,
    currentProductDetail,
    isLoading,
    isLoadingDetail,
    error,
    // Actions
    fetchProducts,
    fetchProductDetail
  };
});
