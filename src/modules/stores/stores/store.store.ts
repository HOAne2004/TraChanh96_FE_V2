import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storeService } from '../services/store.services';
import type { StoreCustomerList, GetCustomerStoresParams } from '../types/store';
import type { TableQrInfo } from '../types/table';
import { extractErrorMessage } from '@/shared/utils/errorHandler';

export const useStoreStore = defineStore('storeStore', () => {
  // --- STATE ---
  
  // 1. Danh sách cửa hàng
  const stores = ref<StoreCustomerList[]>([]);
  const totalStores = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 2. Trạng thái người dùng chọn cửa hàng (RẤT QUAN TRỌNG dùng cho Menu & Cart)
  // Bạn có thể cân nhắc dùng useLocalStorage từ @vueuse/core để giữ state này khi F5 trang
  const selectedStoreId = ref<string | null>(localStorage.getItem('selectedStoreId') || null);

  // 3. Trạng thái quét QR tại bàn (Dine-in)
  const currentDineInInfo = ref<TableQrInfo | null>(null);
  const isScanningQr = ref(false);

  // 4. Vị trí hiện tại của user (dành cho tính khoảng cách)
  const userLocation = ref<{ lat: number; lng: number } | null>(null);


  // --- GETTERS ---
  
  // Lấy ra toàn bộ thông tin của cửa hàng đang được chọn
  const selectedStoreDetail = computed(() => {
    if (!selectedStoreId.value) return null;
    return stores.value.find(s => s.publicId === selectedStoreId.value) || null;
  });

  // Kiểm tra xem khách có đang ở chế độ ăn tại quán (quét QR) hay không
  const isDineInMode = computed(() => currentDineInInfo.value !== null);


  // --- ACTIONS ---

  // 1. Lấy danh sách quán (ưu tiên gửi kèm tọa độ nếu có)
  const fetchStores = async (params: GetCustomerStoresParams = { pageIndex: 1, pageSize: 10 }) => {
    isLoading.value = true;
    error.value = null;
    try {
      // Gắn thêm tọa độ user vào params nếu đã lấy được vị trí
      const finalParams = { ...params };
      if (userLocation.value) {
        finalParams.userLatitude = userLocation.value.lat;
        finalParams.userLongitude = userLocation.value.lng;
      }

      const data = await storeService.getCustomerStores(finalParams);
      stores.value = data.items;
      totalStores.value = data.totalCount;
    } catch (err) {
      error.value = extractErrorMessage(err, 'Lỗi khi tải danh sách cửa hàng');
    } finally {
      isLoading.value = false;
    }
  };

  // 2. Hành động User chủ động chọn 1 cửa hàng (Take-away/Delivery)
  const selectedStore = (storeId: string) => {
    selectedStoreId.value = storeId;
    localStorage.setItem('selectedStoreId', storeId); // Lưu lại để F5 không mất
    
    // Nếu khách đổi quán thủ công, ta nên xóa trạng thái bàn (nếu trước đó có)
    currentDineInInfo.value = null; 
  };

  // 3. Hành động quét QR tại bàn
  const scanTableQr = async (token: string) => {
    isScanningQr.value = true;
    error.value = null;
    try {
      const data = await storeService.getTableByQrToken(token);
      currentDineInInfo.value = data;
      
      // TỰ ĐỘNG CHỌN QUÁN theo thông tin mã QR
      selectedStoreId.value = data.storePublicId;
      localStorage.setItem('selectedStoreId', data.storePublicId);
      
      return true; // Trả về true để UI biết quét thành công và chuyển trang
    } catch (err) {
      error.value = extractErrorMessage(err, 'Mã QR không hợp lệ hoặc bàn đã bị khóa');
      return false;
    } finally {
      isScanningQr.value = false;
    }
  };

  // 4. Tiện ích: Xin quyền lấy vị trí hiện tại (HTML5 Geolocation)
  const requestLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve();
        },
        (err) => {
          reject(err); // User từ chối quyền hoặc lỗi thiết bị
        }
      );
    });
  };

  return {
    // State
    stores,
    totalStores,
    isLoading,
    error,
    selectedStoreId,
    currentDineInInfo,
    isScanningQr,
    userLocation,
    
    // Getters
    selectedStoreDetail,
    isDineInMode,

    // Actions
    fetchStores,
    selectedStore,
    scanTableQr,
    requestLocation
  };
});