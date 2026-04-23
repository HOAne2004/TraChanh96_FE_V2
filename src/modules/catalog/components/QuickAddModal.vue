
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ProductOptionForm from './ProductOptionForm.vue';
import type { CustomerProductCard, OptionChangePayload, CartItemPayload } from '../types/product';
import { useProductStore } from '@/modules/catalog/store/product.store';

const props = defineProps<{
  isOpen: boolean;
  productSummary: CustomerProductCard | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-to-cart', payload: CartItemPayload): void;
}>();

const productStore = useProductStore();

// --- STATE ---
const isLoadingDetail = computed(() => productStore.isLoadingDetail);
const error = computed(() => productStore.error);
const productDetail = computed(() => productStore.currentProductDetail);

const extraPrice = ref(0);
const currentConfig = ref<OptionChangePayload | null>(null);

// Tính tổng tiền = Giá gốc (summary) + Giá tùy chọn (form)
const calculatedTotal = computed(() => {
  const base = props.productSummary?.basePrice || 0;
  return base + extraPrice.value;
});

// Lắng nghe Form phát ra giá tiền
const handlePriceUpdate = (price: number) => {
  extraPrice.value = price;
};

// Lắng nghe Form phát ra cấu hình
const handleConfigChange = (payload: OptionChangePayload) => {
  currentConfig.value = payload;
};

const closeModal = () => {
  emit('close');
};

const submitAddToCart = () => {
  if (!props.productSummary || !currentConfig.value) return;

  // Gom toàn bộ thông tin thành 1 cục Item Giỏ hàng
  const cartItem = {
    productId: props.productSummary.id,
    productName: props.productSummary.name,
    basePrice: props.productSummary.basePrice,
    imageUrl: props.productSummary.imageUrl,
    options: currentConfig.value,
    totalItemPrice: calculatedTotal.value,
    quantity: 1
  };

  emit('add-to-cart', cartItem);
  closeModal();
};

// --- LOGIC FETCH DỮ LIỆU CHI TIẾT ---
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.productSummary) {
    extraPrice.value = 0;
    currentConfig.value = null;

    // Gọi API qua store
    productStore.fetchProductDetail(props.productSummary.slug);
  }
});

// Format tiền
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-\[50\]"
        @click="closeModal"
      ></div>
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-\[60\] pointer-events-none"
      >
        <div
          class="bg-white w-full max-h-[90vh] md:max-h-[85vh] md:max-w-md md:rounded-2xl rounded-t-2xl shadow-2xl pointer-events-auto flex flex-col relative"
          @click.stop
        >
          <button
            @click="closeModal"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <div class="px-5 pt-6 pb-4 border-b border-gray-100 flex gap-4 shrink-0">
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
              <img
                :src="productSummary?.imageUrl"
                :alt="productSummary?.name"
                class="w-full h-full object-cover"
                v-fallback-img
              />
            </div>
            <div class="flex flex-col justify-center pr-8">
              <h3 class="text-lg font-bold text-gray-900 leading-tight mb-1">{{ productSummary?.name }}</h3>
              <p class="text-primary-600 font-extrabold">{{ formatPrice(productSummary?.basePrice || 0) }}</p>
            </div>
          </div>

          <div class="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <div v-if="isLoadingDetail" class="py-10 flex flex-col items-center justify-center text-gray-400">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
              <p class="text-sm">Đang tải tùy chọn...</p>
            </div>

            <div v-else-if="error" class="py-10 text-center text-red-500 font-medium">
              {{ error }}
            </div>

            <ProductOptionForm
              v-else-if="productDetail"
              :product="productDetail"
              @update:price="handlePriceUpdate"
              @change="handleConfigChange"
            />
          </div>

          <div class="p-4 border-t border-gray-100 bg-white md:rounded-b-2xl rounded-b-none shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <button
              @click="submitAddToCart"
              :disabled="isLoadingDetail || !!error"
              class="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 rounded-xl transition-colors shadow-md shadow-primary-500/30 flex items-center justify-center gap-2"
            >
              <span>Thêm vào giỏ</span>
              <span class="w-1.5 h-1.5 rounded-full bg-white/50 mx-1"></span>
              <span>{{ formatPrice(calculatedTotal) }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<style scoped>
/* Hiệu ứng mờ dần cho Backdrop */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Hiệu ứng trượt từ dưới lên cho Modal */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%); /* Trượt từ dưới cùng màn hình lên */
}

/* Ẩn scrollbar xấu xí nhưng vẫn cuộn được */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
</style>
