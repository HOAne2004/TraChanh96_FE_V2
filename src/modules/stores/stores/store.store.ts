import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storeService } from '../services/store.service';
import type { 
  StoreCustomerList, 
  StoreCustomerDetail, 
  GetCustomerStoresParams, 
  TableQrInfo 
} from '../types/store';
import { extractErrorMessage } from '@/shared/utils/errorHandler';

export const useStoreStore = defineStore('storeStore', () => {
  // --- STATE ---
  const stores = ref<StoreCustomerList[]>([]);
  const currentStore = ref<StoreCustomerDetail | null>(null);
  const totalStores = ref(0);
  
  // Biến cực kỳ quan trọng: Dùng để chia sẻ ID quán đang chọn cho module Catalog (Sản phẩm) và Cart (Giỏ hàng)
  const selectedStoreId = ref<string | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  // 1. Lấy danh sách hệ thống cửa hàng (Có tính khoảng cách, check giờ mở cửa)
  const fetchActiveStores = async (params: GetCustomerStoresParams = { pageIndex: 1, pageSize: 50 }) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await storeService.getCustomerStores(params);
      stores.value = data.items;
      totalStores.value = data.totalCount;
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải danh sách cửa hàng');
    } finally {
      loading.value = false;
    }
  };

  // 2. Lấy chi tiết 1 quán theo SLUG (Dùng cho trang StoreDetailView)
  const fetchStoreBySlug = async (slug: string) => {
    loading.value = true;
    error.value = null;
    currentStore.value = null; // Reset lại dữ liệu cũ tránh bị chớp giật UI

    try {
      const data = await storeService.getStoreBySlug(slug);
      currentStore.value = data;
      
      // TỰ ĐỘNG ĐỒNG BỘ: Đánh dấu luôn ID quán này để productStore có thể gọi lấy Menu
      selectedStoreId.value = data.publicId; 
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải thông tin chi tiết cửa hàng');
    } finally {
      loading.value = false;
    }
  };

  // 3. Hàm set tay ID quán (Dùng khi người dùng chọn quán ở Dropdown)
  const setSelectedStore = (storeId: string) => {
    selectedStoreId.value = storeId;
  };

  // 4. Lấy thông tin khi khách hàng quét mã QR tại bàn
  const fetchTableQrInfo = async (token: string) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await storeService.getTableByQrToken(token);
      
      // TỰ ĐỘNG ĐỒNG BỘ: Khách quét QR nghĩa là khách đang ngồi ở quán đó
      selectedStoreId.value = data.storePublicId;
      
      return data;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Mã QR không hợp lệ hoặc bàn đã bị khóa');
      error.value = msg;
      throw new Error(msg); // Ném lỗi ra để component hiển thị Toast
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    stores,
    currentStore,
    totalStores,
    selectedStoreId,
    loading,
    error,
    
    // Actions
    fetchActiveStores,
    fetchStoreBySlug,
    setSelectedStore,
    fetchTableQrInfo
  };
});