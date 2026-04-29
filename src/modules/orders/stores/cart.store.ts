// src/modules/orders/stores/cart.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { customerOrderService } from '../services/order.service';
import type {
  ActiveCartResponse,
  CreateDraftOrderPayload,
  OrderItemRequest,
  CheckoutOrderPayload,
  CheckoutResultResponse
} from '../types/order';
import { extractErrorMessage } from '@/shared/utils/errorHandler';

export const useCartStore = defineStore('cart', () => {
  // ==========================================
  // 1. STATE (Trạng thái giỏ hàng)
  // ==========================================
  const activeCart = ref<ActiveCartResponse | null>(null);
  const isLoading = ref<boolean>(false);
  const isUpdating = ref<boolean>(false); // Dành riêng cho hiệu ứng khi đang thêm/sửa món
  const error = ref<string | null>(null);

  // ==========================================
  // 2. GETTERS (Dữ liệu tính toán)
  // ==========================================
  const cartItems = computed(() => activeCart.value?.items || []);

  // Tổng số ly nước trong giỏ (dùng để hiện bong bóng đỏ trên Icon Giỏ hàng ở Header)
  const totalItemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartSubTotal = computed(() => activeCart.value?.subTotal || 0);
  const cartFinalTotal = computed(() => activeCart.value?.finalTotal || 0);
  const currentOrderId = computed(() => activeCart.value?.orderId || null);
  const currentStoreId = computed(() => activeCart.value?.storeId || null);

  // ==========================================
  // 3. ACTIONS (Hành động gọi API & Cập nhật State)
  // ==========================================

  // Khởi tạo: Lấy giỏ hàng nháp khi khách vào quán
  const fetchActiveCart = async (storeId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const cart = await customerOrderService.getActiveCart(storeId);
      activeCart.value = cart; // Có thể là null nếu khách chưa có giỏ hàng, hợp lệ!
    } catch (err: unknown) { // Dùng unknown thay vì any theo chuẩn TS
      error.value = extractErrorMessage(err, 'Lỗi khi tải giỏ hàng');
      activeCart.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Tạo giỏ hàng nháp mới (Chỉ gọi khi khách bấm thêm món đầu tiên mà chưa có giỏ)
  const createDraftOrder = async (payload: CreateDraftOrderPayload): Promise<string | null> => {
    isUpdating.value = true;
    error.value = null;
    try {
      const newOrderId = await customerOrderService.createDraftOrder(payload);
      return newOrderId;
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Không thể tạo giỏ hàng mới');
      return null;
    } finally {
      isUpdating.value = false;
    }
  };

  // Đồng bộ (Thêm/Sửa/Xóa) danh sách món ăn lên Server
  const syncCartItems = async (orderId: string, items: OrderItemRequest[]) => {
    isUpdating.value = true;
    error.value = null;
    try {
      await customerOrderService.updateOrderItems(orderId, items);
      // Cập nhật thành công thì phải gọi lại fetchActiveCart để lấy giá tiền mới nhất đã được Server làm tròn
      if (currentStoreId.value) {
        await fetchActiveCart(currentStoreId.value);
      }
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Lỗi khi cập nhật món ăn');
      throw err; // Ném lỗi ra để Component (UI) có thể hiện Toast báo lỗi
    } finally {
      isUpdating.value = false;
    }
  };

  // Hàm tiện ích: Thêm 1 món vào giỏ (Tự xử lý logic nếu chưa có giỏ thì tạo mới)
  const addItemToCart = async (storeId: string, orderType: number, newItem: OrderItemRequest) => {
    try {
      let orderIdToUpdate = currentOrderId.value;

      // 1. Nếu chưa có giỏ hàng, tạo giỏ mới trước
      if (!orderIdToUpdate) {
        const createdId = await createDraftOrder({ storeId, orderType });
        if (!createdId) throw new Error("Không thể khởi tạo đơn hàng");
        orderIdToUpdate = createdId;
      }

      // 2. Gom mảng items hiện tại (map về dạng Request) và push món mới vào
      const currentItemsRequest: OrderItemRequest[] = cartItems.value.map(item => ({
        productId: item.productId,
        sizeName: item.size,
        iceLevel: item.iceLevel,
        sugarLevel: item.sugarLevel,
        quantity: item.quantity,
        notes: item.notes,
        toppingIds: item.toppings.map(t => t.toppingId)
      }));

      // Chú ý: Ở Backend hàm AddItem đã lo việc gộp món trùng lặp (AreToppingsExactMatch)
      // Nên FE chỉ việc push thẳng món mới vào mảng và gửi đi, BE sẽ tự gom!
      currentItemsRequest.push(newItem);

      // 3. Gửi lên BE
      await syncCartItems(orderIdToUpdate, currentItemsRequest);

    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Không thể thêm món vào giỏ');
      throw err;
    }
  };

  // Chốt đơn hàng
  const checkoutCart = async (paymentMethodId: string, idempotencyKey: string): Promise<CheckoutResultResponse | null> => {
    if (!currentOrderId.value) return null;

    isUpdating.value = true;
    error.value = null;
    try {
      const result = await customerOrderService.checkout(
        currentOrderId.value,
        { paymentMethodId },
        idempotencyKey
      );

      // Chốt đơn thành công -> Xóa giỏ hàng local
      activeCart.value = null;

      return result;
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Lỗi khi chốt đơn');
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  return {
    // State
    activeCart,
    isLoading,
    isUpdating,
    error,
    // Getters
    cartItems,
    totalItemCount,
    cartSubTotal,
    cartFinalTotal,
    currentOrderId,
    // Actions
    fetchActiveCart,
    createDraftOrder,
    syncCartItems,
    addItemToCart,
    checkoutCart
  };
});
