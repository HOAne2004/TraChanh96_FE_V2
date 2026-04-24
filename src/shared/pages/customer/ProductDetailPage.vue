<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/shared/store/toast.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useStoreStore } from '@/modules/stores/stores/store.store'; 

import ProductOptionForm from '@/modules/catalog/components/ProductOptionForm.vue';
import type { OptionChangePayload } from '@/modules/catalog/types/product';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const productStore = useProductStore();
const storeStore = useStoreStore(); 

// --- STATE ---
const isLoading = computed(() => productStore.isLoadingDetail);
const error = computed(() => productStore.error);
const product = computed(() => productStore.currentProductDetail);

const extraPrice = ref(0);
const currentConfig = ref<OptionChangePayload | null>(null);

// --- COMPUTED ---
const calculatedTotal = computed(() => {
  return (product.value?.basePriceAmount || 0) + extraPrice.value;
});

const isDisabledStatus = computed(() => {
  const status = product.value?.status;
  return status === 'Inactive' || status === 'ComingSoon' || status === 'OutOfStock';
});

// --- METHODS ---
const handlePriceUpdate = (price: number) => {
  extraPrice.value = price;
};

const handleConfigChange = (payload: OptionChangePayload) => {
  currentConfig.value = payload;
};

const getButtonText = () => {
  if (product.value?.status === 'Inactive') return 'Ngừng kinh doanh';
  if (product.value?.status === 'ComingSoon') return 'Sắp ra mắt';
  if (product.value?.status === 'OutOfStock') return 'Hết hàng tại quán';
  return 'Thêm vào giỏ';
};

const submitAddToCart = () => {
  if (!product.value || !currentConfig.value || isDisabledStatus.value) return;

  const cartItem = {
    productId: product.value.id,
    productName: product.value.name,
    basePrice: product.value.basePriceAmount,
    imageUrl: product.value.imageUrl,
    options: currentConfig.value,
    totalItemPrice: calculatedTotal.value,
    quantity: 1
  };

  console.log('GIỎ HÀNG TỪ TRANG CHI TIẾT:', cartItem);
  toastStore.success(`Đã thêm ${product.value.name} vào giỏ!`);
  // TODO: Gọi cartStore.add(cartItem) ở đây
};

// --- API CALL ---
onMounted(() => {
  // Cảnh báo nhẹ nếu lỡ vào thẳng link mà chưa chọn quán
  if (!storeStore.selectedStoreId) {
    toastStore.error('Vui lòng chọn cửa hàng trước để xem giá chính xác!');
    router.push('/menu'); // Tùy chọn: Đá về trang menu
    return;
  }

  const slug = route.params.slug as string;
  if (slug) {
    productStore.fetchProductDetail(slug);
  }
});

// --- FORMATTERS ---
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const formatSold = (sold: number) => {
  return sold > 999 ? (sold / 1000).toFixed(1) + 'k' : sold.toString();
};
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-24 md:pb-12 pt-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      
      <nav class="flex text-sm text-gray-500 mb-6 font-medium">
        <router-link to="/" class="hover:text-primary-600 transition-colors">Trang chủ</router-link>
        <span class="mx-2">/</span>
        <router-link to="/menu" class="hover:text-primary-600 transition-colors">Thực đơn</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-800 truncate">{{ product?.name || 'Đang tải...' }}</span>
      </nav>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-gray-500">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p>Đang pha chế dữ liệu...</p>
      </div>

      <div v-else-if="error" class="text-center py-32">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Ôi hỏng!</h2>
        <p class="text-red-500">{{ error }}</p>
        <router-link to="/menu" class="mt-6 inline-block bg-primary-500 text-white px-6 py-2 rounded-lg font-bold">
          Quay lại thực đơn
        </router-link>
      </div>

      <div v-else-if="product" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          
          <div class="lg:col-span-2 bg-gray-50 p-6 flex items-center justify-center relative">
            <div class="aspect-square w-full max-w-md relative">
              <img 
                :src="product.imageUrl" 
                :alt="product.name"
                class="w-full h-full object-cover rounded-2xl shadow-md transition-all duration-300"
                :class="{ 'opacity-50 grayscale': isDisabledStatus }" 
                v-fallback-img
              />
              
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span v-if="product.status === 'ComingSoon'" class="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Sắp ra mắt
                </span>
                <span v-else-if="product.status === 'OutOfStock' || product.status === 'Inactive'" class="bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Tạm hết
                </span>
                <span v-else-if="product.totalSold > 500" class="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                  🔥 HOT
                </span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-3 p-6 md:p-8 flex flex-col gap-2">
            
            <div class="mb-6 pb-6 border-b border-gray-100">
              <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{{ product.name }}</h1>
              
              <div class="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div class="flex items-center text-secondary-500 font-bold bg-secondary-50 px-2 py-1 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ product.totalRating > 0 ? product.totalRating.toFixed(1) : '5.0' }}
                </div>
                <div class="text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  Đã bán {{ formatSold(product.totalSold) }}
                </div>
              </div>

              <div class="text-3xl font-black text-primary-500" :class="{ 'text-gray-400': isDisabledStatus }">
                {{ formatPrice(product.basePriceAmount) }}
              </div>
            </div>

            <div :class="{ 'opacity-60 pointer-events-none': isDisabledStatus }">
              <ProductOptionForm 
                :product="product" 
                @update:price="handlePriceUpdate"
                @change="handleConfigChange"
              />
            </div>

            <div class="hidden md:block mt-4 pt-6 border-t border-gray-100">
              <button 
                @click="submitAddToCart"
                :disabled="isDisabledStatus"
                class="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-3 disabled:shadow-none"
              >
                <span>{{ getButtonText() }}</span>
                <span v-if="!isDisabledStatus" class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span v-if="!isDisabledStatus">{{ formatPrice(calculatedTotal) }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
        <SectionWrapper 
          v-if="product?.description || product?.ingredients" 
          title="Thông tin chi tiết"
        >
          <div class="text-gray-600 text-base leading-relaxed space-y-6 px-2 md:px-8 py-4">
            <div v-if="product.description">
              <p class="whitespace-pre-line">{{ product.description }}</p>
            </div>
            
            <div v-if="product.ingredients" class="bg-primary-50/50 p-4 rounded-xl border border-primary-100">
              <h4 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Thành phần chính
              </h4>
              <p>{{ product.ingredients }}</p>
            </div>
          </div>
        </SectionWrapper>
       
        <SectionWrapper title="Đánh giá">
          <div class="flex flex-col items-center justify-center py-32 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>Chưa có đánh giá</p>
          </div>
        </SectionWrapper>
    </div>

    <div v-if="product" class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
       <button 
          @click="submitAddToCart"
          :disabled="isDisabledStatus"
          class="w-full bg-primary-500 disabled:bg-gray-300 text-white font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:shadow-none"
        >
          <span>{{ getButtonText() }}</span>
          <span v-if="!isDisabledStatus">-</span>
          <span v-if="!isDisabledStatus">{{ formatPrice(calculatedTotal) }}</span>
        </button>
    </div>
  </main>
</template>