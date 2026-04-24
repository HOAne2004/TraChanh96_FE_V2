import apiClient from "@/shared/services/http/axios";
import type { ApiResponse, PagedResult } from "@/shared/types/api";
import type { 
  StoreCustomerList, 
  GetCustomerStoresParams, 
  StoreCustomerDetail, 
  TableQrInfo 
} from "../types/store";

export const storeService = {
  /**
   * 1. Lấy danh sách cửa hàng cho khách hàng
   * Hỗ trợ tìm kiếm, phân trang, tính khoảng cách (nếu có tọa độ) và check trạng thái mở cửa.
   */
  getCustomerStores(params: GetCustomerStoresParams): Promise<PagedResult<StoreCustomerList>> {
    return apiClient
      .get<ApiResponse<PagedResult<StoreCustomerList>>>('/stores', { params })
      .then((res) => res.data.data);
  },

  /**
   * 2. Lấy thông tin chi tiết 1 cửa hàng theo SLUG
   * Bao gồm giờ hoạt động hôm nay, lịch cả tuần và danh sách bàn (Dành cho trang Chi tiết/Đặt bàn)
   */
  getStoreBySlug(slug: string): Promise<StoreCustomerDetail> {
    return apiClient
      .get<ApiResponse<StoreCustomerDetail>>(`/stores/${slug}`)
      .then((res) => res.data.data);
  },

  /**
   * 3. Lấy thông tin (Quán, Khu vực, Bàn) khi khách Dine-in quét mã QR tại bàn.
   * Dùng để điều hướng khách vào đúng menu của cửa hàng và gắn thông tin bàn vào giỏ hàng.
   */
  getTableByQrToken(token: string): Promise<TableQrInfo> {
    // Lưu ý: Đã xóa chữ /public/ để chuẩn hóa với Controller Backend
    return apiClient
      .get<ApiResponse<TableQrInfo>>(`/stores/table-qr/${token}`)
      .then((res) => res.data.data);
  }
};