import apiClient from "@/shared/services/http/axios";
import type { ApiResponse } from "@/shared/types/api";
import type {
  CreateDraftOrderPayload,
  OrderItemRequest,
  CheckoutOrderPayload,
  ActiveCartResponse,
  OrderResponse,
  StoreOrderSummaryResponse,
  StoreDashboardMetricsResponse,
  OrderStatus,
  CustomerOrderSummaryResponse
} from "../types/order";

// Giả định bạn có type PagedResult dùng chung ở shared
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface CheckoutResultResponse {
  orderId: string;
  paymentUrl: string | null;
}

// ======================================================
// 1. DÀNH CHO KHÁCH HÀNG (Customer App/Web)
// ======================================================
export const customerOrderService = {
  // Lấy giỏ hàng đang nháp
  getActiveCart(storeId: string): Promise<ActiveCartResponse | null> {
    return apiClient
      .get<ApiResponse<ActiveCartResponse | null>>(`/orders/active-cart`, { params: { storeId } })
      .then((res) => res.data.data);
  },

  // Tạo giỏ hàng mới
  createDraftOrder(data: CreateDraftOrderPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<string>>('/orders', data)
      .then((res) => res.data.data); // Trả về OrderId
  },

  // Cập nhật món trong giỏ hàng
  updateOrderItems(orderId: string, items: OrderItemRequest[]): Promise<string> {
    return apiClient
      .post<ApiResponse<string>>(`/orders/${orderId}/items`, items)
      .then((res) => res.data.message || 'Cập nhật thành công');
  },

  // Chọn địa chỉ giao hàng
  setDeliveryAddress(orderId: string, addressId: number): Promise<string> {
    // Axios tự động parse primitive types thành JSON nếu config header đúng, nhưng bọc vào object thì an toàn hơn.
    // Ở BE bạn để [FromBody] int addressId, Axios sẽ gửi payload thuần túy là 1 số.
    return apiClient
      .put<ApiResponse<string>>(`/orders/${orderId}/delivery-address`, addressId)
      .then((res) => res.data.message || 'Cập nhật địa chỉ thành công');
  },

  // Chọn bàn tại quán
  setDineInTable(orderId: string, tableId: string): Promise<string> {
    return apiClient
      .put<ApiResponse<string>>(`/orders/${orderId}/dine-in-table`, `"${tableId}"`) // Chú ý bọc chuỗi GUID trong ngoặc kép để chuẩn JSON
      .then((res) => res.data.message || 'Cập nhật bàn thành công');
  },

  // Chốt đơn và lấy link thanh toán
  checkout(orderId: string, payload: CheckoutOrderPayload, idempotencyKey: string): Promise<CheckoutResultResponse> {
    return apiClient
      .post<ApiResponse<CheckoutResultResponse>>(`/orders/${orderId}/checkout`, `"${payload.paymentMethodId}"`, {
        headers: {
          'Idempotency-Key': idempotencyKey // Truyền Header chống trùng lặp theo đúng thiết kế BE
        }
      })
      .then((res) => res.data.data);
  },

  // Hủy đơn hàng
  cancelOrder(orderId: string, reason: string): Promise<string> {
    return apiClient
      .post<ApiResponse<string>>(`/orders/${orderId}/cancel`, `"${reason}"`)
      .then((res) => res.data.message || 'Hủy đơn thành công');
  },

  // Lấy chi tiết 1 đơn hàng
  getOrderById(orderId: string): Promise<OrderResponse> {
    return apiClient
      .get<ApiResponse<OrderResponse>>(`/orders/${orderId}`)
      .then((res) => res.data.data);
  },

  // Lấy lịch sử mua hàng
  getCustomerOrderHistory(params?: { status?: OrderStatus[]; pageIndex?: number; pageSize?: number }): Promise<PagedResult<CustomerOrderSummaryResponse>> {
    return apiClient
      .get<ApiResponse<PagedResult<CustomerOrderSummaryResponse>>>('/orders/history', {
        params,
        // Dùng serializer để format mảng status thành status=1&status=2... cho .NET hiểu
        paramsSerializer: { indexes: null }
      })
      .then((res) => res.data.data);
  }
};

// ======================================================
// 2. DÀNH CHO NHÂN VIÊN (POS / Dashboard)
// ======================================================
export const staffOrderService = {
  // Lấy danh sách đơn hàng cho màn hình POS/Bếp
  getStoreOrders(storeId: string, params?: { status?: OrderStatus; search?: string; pageIndex?: number; pageSize?: number }): Promise<PagedResult<StoreOrderSummaryResponse>> {
    return apiClient
      .get<ApiResponse<PagedResult<StoreOrderSummaryResponse>>>(`/staff/stores/${storeId}/orders`, { params })
      .then((res) => res.data.data);
  },

  // Lấy thống kê cho Dashboard
  getDashboardMetrics(storeId: string): Promise<StoreDashboardMetricsResponse> {
    return apiClient
      .get<ApiResponse<StoreDashboardMetricsResponse>>(`/staff/stores/${storeId}/dashboard-metrics`)
      .then((res) => res.data.data);
  },

  // Các thao tác cập nhật trạng thái đơn hàng
  confirmCashPayment(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/confirm-cash`).then(res => res.data.message);
  },

  confirmOrder(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/confirm`).then(res => res.data.message);
  },

  startPreparing(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/start-preparing`).then(res => res.data.message);
  },

  markOrderReady(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/ready`).then(res => res.data.message);
  },

  shipOrder(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/ship`).then(res => res.data.message);
  },

  completeOrder(orderId: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/complete`).then(res => res.data.message);
  },

  cancelOrderAsStaff(orderId: string, reason: string): Promise<string> {
    return apiClient.post<ApiResponse<string>>(`/staff/orders/${orderId}/cancel`, `"${reason}"`).then(res => res.data.message);
  }
};
