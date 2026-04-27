import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productService } from '../services/product.service';
import type { CustomerProductCard, ProductDetail, ProductFilterParams } from '../types/product';
import { extractErrorMessage } from '@/shared/utils/errorHandler';
import { useStoreStore } from '@/modules/stores/stores/store.store';

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

    const storeStore = useStoreStore();
    const finalParams = { ...params };
    // TẠM THỜI COMMENT LẠI ĐỂ LẤY FULL MENU CHO MỌI QUÁN
    // if (storeStore.selectedStoreId) {
    //   finalParams.storeId = storeStore.selectedStoreId;
    // }
    try {
      const data = await productService.getCatalogProducts(finalParams);
      products.value = data.items;
      totalProducts.value = data.totalCount;
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải thực đơn');
    } finally {
      isLoading.value = false;
    }
  };

  // 2. Lấy chi tiết 1 sản phẩm khi khách hàng bấm vào (ví dụ: bấm vào "Trà Đào Cam Sả")
  const fetchProductDetail = async (slug: string) => {
    isLoadingDetail.value = true;
    error.value = null;
    currentProductDetail.value = null;
    const storeStore = useStoreStore();
    const currentStoreId = storeStore.selectedStoreId || undefined;

    try {
      // Truyền thêm currentStoreId vào service
      const data = await productService.getProductBySlug(slug, currentStoreId);
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
