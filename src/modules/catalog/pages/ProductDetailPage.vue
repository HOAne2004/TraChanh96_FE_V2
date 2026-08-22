<script setup lang="ts">
import IconSvgDocument from '@/assets/icons/IconSvgDocument.svg'
import IconSvgEdit from '@/assets/icons/IconSvgEdit.svg'
import IconSvgLock from '@/assets/icons/IconSvgLock.svg'
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/shared/store/toast.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useStoreStore } from '@/modules/stores/stores/store.store';

import ProductOptionForm from '@/modules/catalog/components/ProductOptionForm.vue';
import type { OptionChangePayload } from '@/modules/catalog/types/product';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';
import AppLoading from '@/shared/components/ui/AppLoading.vue';

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

  if (!storeStore.selectedStoreId) {
    toastStore.warning('Vui lòng chọn cửa hàng trước khi thêm vào giỏ hàng!');
    return;
  }

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

      <AppLoading v-if="isLoading" :show="true" text="Đang pha chế dữ liệu..." />

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
                  <IconSvgLock class="h-4 w-4 mr-1" />
                  {{ product.averageRating > 0 ? product.averageRating.toFixed(1) : '5.0' }}
                  <span class="text-gray-400 font-normal ml-1 text-xs" v-if="product.ratingCount > 0">({{ product.ratingCount }})</span>
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
                <IconSvgEdit class="w-5 h-5 text-primary-500" />
                Thành phần chính
              </h4>
              <p>{{ product.ingredients }}</p>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Đánh giá">
          <div class="flex flex-col items-center justify-center py-32 text-gray-500">
            <IconSvgDocument class="h-16 w-16 mb-4 text-gray-200" />
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
