// ==========================================
// 1. ENUMS (Đồng bộ với Backend Domain)
// ==========================================
export enum OrderStatus {
  Draft = 1,
  AwaitingPayment = 2,
  PaymentFailed = 3,
  Pending = 4,
  Confirmed = 5,
  Preparing = 6,
  Ready = 7,
  Shipping = 8,
  Completed = 9,
  Cancelled = 10,
}

export enum OrderType {
  DineIn = 1,
  Takeaway = 2,
  Delivery = 3,
}

export enum PaymentStatus {
  Pending = 1,
  Paid = 2,
  Failed = 3,
  Refunded = 4,
}

// Giả định các Enum dùng chung (có thể bạn đã khai báo ở shared/types)
export enum Size { S = 1, M = 2, L = 3, XL = 4, }
export enum IceLevel {
  None = 1,     // Không đá
  Warm = 2,     // Ấm
  Hot = 3,      // Nóng
  I30 = 30,     // 30% Đá
  I50 = 50,     // 50% Đá
  I70 = 70,     // 70% Đá
  I100 = 100    // 100% Đá
}
export enum SugarLevel {
  S0 = 1,       // Không đường
  S30 = 30,     // 30% Đường
  S50 = 50,     // 50% Đường
  S70 = 70,     // 70% Đường
  S100 = 100    // 100% Đường
}


// ==========================================
// 2. PAYLOADS (Dữ liệu gửi lên từ FE - Commands)
// ==========================================

// Ánh xạ từ OrderItemRequest trong AddOrderItemsCommand.cs
export interface OrderItemRequest {
  productId: string;
  sizeName: Size;
  iceLevel?: IceLevel | null;
  sugarLevel?: SugarLevel | null;
  quantity: number;
  notes?: string | null;
  toppingIds: string[]; // List<Guid> chuyển thành mảng string
}

// Payload dùng để gọi hàm AddOrderItems (Thêm món vào giỏ)
export interface AddOrderItemsPayload {
  orderId: string;
  items: OrderItemRequest[];
}

// Payload dùng để gọi hàm ApplyVoucher (Áp dụng mã giảm giá)
export interface ApplyVoucherPayload {
  orderId: string;
  voucherCode: string;
}

export interface CancelOrderPayload {
  reason: string;
}

// Ánh xạ từ CreateDraftOrderCommand.cs
export interface CreateDraftOrderPayload {
storeId: string;
customerId?: string | null;
orderType: number; // Ánh xạ tới OrderType enum
currency?: string; // Thường mặc định là "VND"
}

// Ánh xạ từ CheckoutOrderCommand.cs
// Lưu ý: orderId được truyền qua URL, idempotencyKey được truyền qua Header, nên Body chỉ cần paymentMethodId.
export interface CheckoutOrderPayload {
paymentMethodId: string;
}

// Ánh xạ từ CheckoutResultResponse.cs (Kết quả trả về sau khi chốt đơn)
export interface CheckoutResultResponse {
orderId: string;
paymentUrl: string | null; // Sẽ là null nếu khách chọn thanh toán bằng Tiền mặt
}

// Ánh xạ từ ProcessPaymentWebhookCommand.cs
// (Thường API này do cổng thanh toán VNPay/MoMo gọi trực tiếp vào Server, nhưng có thể khai báo để dùng trong môi trường Test/MocK trên FE).
export interface ProcessPaymentWebhookPayload {
orderId: string;
transactionId: string;
isSuccess: boolean;
errorMessage?: string | null;
}

// ==========================================
// 3. RESPONSES (Dữ liệu nhận về từ BE - Queries)
// ==========================================

// --- 1. GetActiveCartQuery (Giỏ hàng nháp hiện tại) ---
export interface CartItemToppingResponse {
  toppingId: string;
  toppingName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  productName: string;
  imageUrl?: string;
  size: Size;
  iceLevel?: IceLevel | null;
  sugarLevel?: SugarLevel | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
  toppings: CartItemToppingResponse[];
}

export interface ActiveCartResponse {
  orderId: string;
  orderCode: string;
  storeId: string;
  customerId?: string | null;
  orderType: OrderType;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  items: CartItemResponse[];
}

// --- 2. GetCustomerOrderHistoryQuery (Lịch sử đơn của khách) ---
export interface CustomerOrderSummaryResponse {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  orderType: OrderType;
  finalTotal: number;
  currency: string;
  createdAt: string; // C# DateTime sẽ parse thành ISO String
  thumbnailImageUrl?: string | null;
}

// --- 3. GetOrderByIdQuery (Chi tiết 1 đơn hàng) ---
export interface OrderToppingResponse {
  toppingId: string;
  toppingName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  imageUrl?: string;
  size: Size;
  iceLevel?: IceLevel | null;
  sugarLevel?: SugarLevel | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
  toppings: OrderToppingResponse[];
}

export interface OrderResponse {
  orderId: string;
  orderCode: string;
  storeId: string;
  customerId?: string | null;
  orderStatus: OrderStatus;
  orderType: OrderType;
  paymentMethodId?: string | null;
  paymentStatus: PaymentStatus;
  appliedVoucherCode?: string | null;
  tableId?: string | null;
  deliveryAddress?: string | null;
  customerNotes?: string | null;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  createdAt: string;
  items: OrderItemResponse[];
}

// --- 4. GetStoreDashboardMetricsQuery (Thống kê cho nhân viên) ---
export interface StoreDashboardMetricsResponse {
  totalOrdersToday: number;
  totalRevenueToday: number;
  pendingOrdersCount: number;
  readyOrdersCount: number;
  shippingOrdersCount: number;
  cancelledOrdersCount: number;
}

// --- 5. GetStoreOrdersQuery (Danh sách đơn cho màn hình POS/Bếp) ---
export interface StoreOrderToppingBrief {
  quantity: number;
  toppingName: string;
}

export interface StoreOrderItemBrief {
  quantity: number;
  productName: string;
  size: Size;
  iceLevel?: IceLevel | null;
  sugarLevel?: SugarLevel | null;
  notes?: string | null;
  toppings: StoreOrderToppingBrief[];
  imageUrl?: string | null;
}

export interface StoreOrderSummaryResponse {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  orderType: OrderType;
  finalTotal: number;
  currency: string;
  createdAt: string;
  items: StoreOrderItemBrief[];
}
