<script setup lang="ts">
import { computed } from 'vue';
import type { CustomerProductCard } from '../types/product';
import { useAuthStore } from '@/modules/identity/store/auth.store';
import { useToastStore } from '@/shared/store/toast.store';

const authStore = useAuthStore();
const toastStore = useToastStore();

// --- PROPS & EMITS ---
const props = defineProps<{
  product: CustomerProductCard;
}>();

const emit = defineEmits<{
  (e: 'quick-add', product: CustomerProductCard): void;
}>();

// --- COMPUTED: BUSINESS LOGIC ---

// 1. Kiểm tra Món Bán Chạy (HOT) - Giả sử mốc là 500 ly
const isBestSeller = computed(() => props.product.totalSold >= 500);

// 2. Kiểm tra Món Mới (NEW) - Trong vòng 14 ngày kể từ lúc PublishedAt
const isNew = computed(() => {
  const dateString = props.product.publishedAt || props.product.createdAt;
  if (!dateString) return false;

  const launchDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - launchDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 14 && props.product.status === 'Active';
});

// 3. Phân loại Trạng thái Cửa hàng (Hết hàng / Sắp ra mắt)
const availabilityStatus = computed(() => {
  if (props.product.status === 'Inactive') {
    return { label: 'Tạm hết hàng', class: 'bg-gray-500' };
  }
  if (props.product.status === 'ComingSoon') {
    return { label: 'Sắp ra mắt', class: 'bg-primary-600' };
  }
  return null;
});

// 4. Trạng thái vô hiệu hóa
const isDisabled = computed(() => !!availabilityStatus.value);


// --- METHODS ---
// KHÔI PHỤC LẠI HÀM CLICK GIỎ HÀNG
const handleQuickAdd = () => {
  if (isDisabled.value) return;

  if (!authStore.token) {
    toastStore.warning('Vui lòng đăng nhập để mua hàng!');
    authStore.openLoginModal();
    return;
  }

  // Bắn dữ liệu ra cho MenuPage hứng và mở Modal
  emit('quick-add', props.product);
};


// --- FORMATTERS ---
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatSold = (sold: number) => {
  return sold > 999 ? (sold / 1000).toFixed(1) + 'k' : sold.toString();
};
</script>

<template>
  <div class="group shrink-0 w-full max-w-[220px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 isolate z-0"
    :class="{ 'opacity-80': isDisabled }">
    <div v-if="availabilityStatus" class="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/30 pointer-events-none">
      <span class="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm" :class="availabilityStatus.class">
        {{ availabilityStatus.label }}
      </span>
    </div>

    <router-link :to="`/products/${product.slug}`" class="block flex-1 flex-col h-full">
      <div class="relative w-full aspect-square overflow-hidden bg-gray-50">
        <img
          :src="product.imageUrl"
          :alt="product.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          :class="{ 'grayscale': isDisabled }"
          loading="lazy"
          v-fallback-img
        />

        <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-secondary-500 shadow-sm flex items-center gap-1">
          <span>{{ product.totalRating > 0 ? product.totalRating.toFixed(1) : '5.0' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-3 h-3" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
          </svg>
        </div>

        <div class="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          <span
            v-if="isBestSeller"
            class="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse"
          >
            🔥 HOT
          </span>
          <span
            v-if="isNew"
            class="bg-primary-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm"
          >
            NEW
          </span>
        </div>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-bold text-gray-800 text-base mb-1 line-clamp-2 min-h-\[3rem\] group-hover:text-primary-600 transition-colors">
          {{ product.name }}
        </h3>

        <div class="mb-3">
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Đã bán {{ formatSold(product.totalSold) }}
          </span>
        </div>

        <div class="mt-auto flex items-end justify-between relative z-30">
          <div class="flex flex-col">
            <span class="font-extrabold text-lg" :class="isDisabled ? 'text-gray-400' : 'text-primary-500'">
              {{ formatPrice(product.basePrice) }}
            </span>
          </div>

          <button
            v-if="!isDisabled"
            @click.prevent="handleQuickAdd"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white"
            title="Tùy chọn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>

          <span
            v-else
            class="text-xs font-medium text-gray-400 group-hover:text-primary-600 flex items-center gap-1 transition-colors"
          >
            Chi tiết
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
