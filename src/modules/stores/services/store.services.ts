import apiClient from "@/shared/services/http/axios";
import type { ApiResponse, PagedResult } from "@/shared/types/api";
import type { StoreCustomerList, GetCustomerStoresParams } from "../types/store";
import type { TableQrInfo } from "../types/table";

export const storeService = {
  /**
   * Lấy danh sách cửa hàng cho khách hàng
   * Hỗ trợ tìm kiếm, phân trang, tính khoảng cách (nếu có tọa độ) và check trạng thái mở cửa.
   */
  getCustomerStores(params: GetCustomerStoresParams): Promise<PagedResult<StoreCustomerList>> {
    return apiClient
      .get<ApiResponse<PagedResult<StoreCustomerList>>>('/stores/public', { params })
      .then((res) => res.data.data);
  },

  /**
   * Lấy thông tin (Quán, Khu vực, Bàn) khi khách Dine-in quét mã QR tại bàn.
   * Dùng để điều hướng khách vào đúng menu của cửa hàng và gắn thông tin bàn vào giỏ hàng.
   */
  getTableByQrToken(token: string): Promise<TableQrInfo> {
    return apiClient
      .get<ApiResponse<TableQrInfo>>(`/stores/public/table-qr/${token}`)
      .then((res) => res.data.data);
  }
};