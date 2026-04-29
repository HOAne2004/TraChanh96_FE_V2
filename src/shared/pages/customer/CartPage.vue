<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/modules/orders/stores/cart.store';
import { useToastStore } from '@/shared/store/toast.store';
import CartItem from '@/modules/orders/components/CartItem.vue';
import CartSummaryPanel from '@/modules/orders/components/CartSummaryPanel.vue';

const router = useRouter();
const cartStore = useCartStore();
const toastStore = useToastStore();

// Trích xuất State từ Pinia
const { activeCart, cartItems, totalItemCount, cartFinalTotal, isLoading, isUpdating } = storeToRefs(cartStore);

// GIẢ ĐỊNH: Lấy StoreId hiện tại mà khách đang xem từ Router/LocalStorage.
// Nếu làm chuỗi nhiều cửa hàng, bạn cần truyền storeId này động vào.
const CURRENT_STORE_ID = '00000000-0000-0000-0000-000000000000'; // Sửa lại bằng storeId thực tế

onMounted(async () => {
  // Khi vào trang giỏ hàng, nạp lại dữ liệu mới nhất từ BE
  await cartStore.fetchActiveCart(CURRENT_STORE_ID);
});

// Xử lý thay đổi số lượng (Cần gửi toàn bộ mảng lên BE để đồng bộ)
const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
  if (!activeCart.value?.orderId) return;

  // Tạo mảng request mới với số lượng được cập nhật
  const updatedItems = cartItems.value.map(item => ({
    productId: item.productId,
    sizeName: item.size,
    iceLevel: item.iceLevel,
    sugarLevel: item.sugarLevel,
    quantity: item.productId === productId ? newQuantity : item.quantity,
    notes: item.notes,
    toppingIds: item.toppings.map(t => t.toppingId)
  }));

  try {
    await cartStore.syncCartItems(activeCart.value.orderId, updatedItems);
  } catch (error) {
    toastStore.error('Không thể cập nhật số lượng món.');
  }
};

// Xử lý xóa món
const handleRemoveItem = async (productId: string) => {
  if (!activeCart.value?.orderId) return;

  const updatedItems = cartItems.value
    .filter(item => item.productId !== productId) // Lọc bỏ món cần xóa
    .map(item => ({
      productId: item.productId,
      sizeName: item.size,
      iceLevel: item.iceLevel,
      sugarLevel: item.sugarLevel,
      quantity: item.quantity,
      notes: item.notes,
      toppingIds: item.toppings.map(t => t.toppingId)
    }));

  try {
    await cartStore.syncCartItems(activeCart.value.orderId, updatedItems);
    toastStore.success('Đã xóa món khỏi giỏ hàng.');
  } catch (error) {
    toastStore.error('Lỗi khi xóa món.');
  }
};

const proceedToCheckout = () => {
  if (!activeCart.value?.orderId) return;
  // Chuyển sang trang Checkout, đính kèm OrderId
  router.push({ path: '/checkout', query: { orderId: activeCart.value.orderId } });
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]">
    <div class="flex items-center gap-3 mb-8">
      <div class="p-3 bg-primary-100 text-primary-600 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
    </div>

    <div v-if="isLoading && !activeCart" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <div v-else>
      <div v-if="totalItemCount > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div class="lg:col-span-8 card-base \!p-6">
          <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 class="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h2>
            <span class="bg-primary-50 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
              {{ totalItemCount }} món
            </span>
          </div>

          <div class="space-y-2 transition-opacity duration-200" :class="{ 'opacity-50 pointer-events-none': isUpdating }">
            <CartItem
              v-for="item in cartItems"
              :key="item.productId"
              :item="item"
              :is-loading="isUpdating"
              @update-quantity="handleUpdateQuantity"
              @remove="handleRemoveItem"
            />
          </div>
        </div>

        <div class="lg:col-span-4">
          <CartSummaryPanel
            :total-price="cartFinalTotal"
            :total-items="totalItemCount"
            :is-loading="isUpdating"
            @checkout="proceedToCheckout"
          />
        </div>

      </div>

      <div v-else class="card-base py-20 flex flex-col items-center justify-center text-center">
        <img src="@/assets/images/empty-cart.png" alt="Empty Cart" class="w-48 mb-6 opacity-80" /> <h2 class="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống trơn</h2>
        <p class="text-gray-500 mb-8 max-w-md">Có vẻ như bạn chưa chọn được thức uống yêu thích nào. Hãy lướt xem Menu và chọn cho mình một ly trà chanh mát lạnh nhé!</p>

        <router-link to="/menu" class="btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Quay lại thực đơn
        </router-link>
      </div>
    </div>
  </div>
</template>
