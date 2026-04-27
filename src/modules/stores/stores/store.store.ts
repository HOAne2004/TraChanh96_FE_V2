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

  // --- LOCATION STATE ---
  const userLat = ref<number | null>(null);
  const userLng = ref<number | null>(null);
  const isLocationLoading = ref(false);
  const locationError = ref<string | null>(null);

  // --- ACTIONS ---

  // 1. Lấy danh sách hệ thống cửa hàng (Có tính khoảng cách, check giờ mở cửa)
  const fetchActiveStores = async (params: GetCustomerStoresParams = { pageIndex: 1, pageSize: 50 }) => {
    loading.value = true;
    error.value = null;

    // Tự động gán tọa độ nếu đã có
    if (params.userLatitude === undefined && userLat.value !== null) {
      params.userLatitude = userLat.value;
    }
    if (params.userLongitude === undefined && userLng.value !== null) {
      params.userLongitude = userLng.value;
    }

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

  // 5. Yêu cầu quyền vị trí và fetch lại cửa hàng
  const requestUserLocation = () => {
    isLocationLoading.value = true;
    locationError.value = null;

    if (!navigator.geolocation) {
      locationError.value = 'Trình duyệt không hỗ trợ tính năng định vị.';
      isLocationLoading.value = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat.value = position.coords.latitude;
        userLng.value = position.coords.longitude;
        isLocationLoading.value = false;
        
        // Gọi lại fetchActiveStores kèm theo tọa độ mới
        fetchActiveStores({
          pageIndex: 1,
          pageSize: 50,
          userLatitude: userLat.value,
          userLongitude: userLng.value
        });
      },
      (geoError) => {
        isLocationLoading.value = false;
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            locationError.value = 'Bạn đã từ chối cấp quyền truy cập vị trí.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            locationError.value = 'Không thể xác định vị trí hiện tại.';
            break;
          case geoError.TIMEOUT:
            locationError.value = 'Hết thời gian yêu cầu vị trí.';
            break;
          default:
            locationError.value = 'Đã xảy ra lỗi không xác định khi lấy vị trí.';
            break;
        }
        // Fetch danh sách bình thường (không có tọa độ)
        fetchActiveStores({ pageIndex: 1, pageSize: 50 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return {
    // State
    stores,
    currentStore,
    totalStores,
    selectedStoreId,
    loading,
    error,
    userLat,
    userLng,
    isLocationLoading,
    locationError,
    
    // Actions
    fetchActiveStores,
    fetchStoreBySlug,
    setSelectedStore,
    fetchTableQrInfo,
    requestUserLocation
  };
});