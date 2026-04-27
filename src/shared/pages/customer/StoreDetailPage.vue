<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import defaultStoreImg from '@/assets/images/default-store.png';
// Stores
import { useStoreStore } from '@/modules/stores/stores/store.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useCategoryStore } from '@/modules/catalog/store/category.store';

// Components
import CatalogMenuSection from '@/modules/catalog/components/CatalogMenuSection.vue';
import QuickAddModal from '@/modules/catalog/components/QuickAddModal.vue';
import type { CustomerProductCard } from '@/modules/catalog/types/product';

const route = useRoute();
const router = useRouter();

const storeStore = useStoreStore();
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const slug = route.params.slug as string;

// State nội bộ
const isLoadingLocal = ref(true);
const isModalOpen = ref(false);
const selectedProductForModal = ref<CustomerProductCard | null>(null);

const currentStore = computed(() => storeStore.currentStore);

const loadData = async () => {
  isLoadingLocal.value = true;
  try {
    await storeStore.fetchStoreBySlug(slug);

    if (!currentStore.value) return;

    // LẤY MENU CHUNG: Tạm thời không truyền storeId để tất cả các quán đều hiện Full Menu
    await Promise.all([
      categoryStore.fetchCategories(),
      productStore.fetchProducts({ pageIndex: 1, pageSize: 100 })
    ]);

  } finally {
    isLoadingLocal.value = false;
  }
};

onMounted(loadData);

// Helpers
const handleOpenModal = (product: CustomerProductCard) => {
  selectedProductForModal.value = product;
  isModalOpen.value = true;
};

const mapSrc = computed(() => {
  if (!currentStore.value?.fullAddress) return '';
  const addressEnc = encodeURIComponent(currentStore.value.fullAddress);
  return `https://maps.google.com/maps?q=${addressEnc}&t=&z=15&ie=UTF8&output=embed`;
});

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const getDayName = (dayOfWeek: number) => {
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[dayOfWeek] || '';
};
</script>

<template>
  <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">

    <div v-if="isLoadingLocal" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="!currentStore" class="text-center py-32">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy cửa hàng</h1>
      <p class="text-gray-500 mb-6">Cửa hàng này không tồn tại hoặc đã ngừng hoạt động.</p>
      <button @click="router.push('/about-us')" class="btn-primary px-6">
        Xem danh sách cửa hàng
      </button>
    </div>

    <div v-else>
      <div class="mb-6 text-sm text-gray-500 flex items-center gap-2 font-medium">
        <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link>
        <span>/</span>
        <router-link to="/about-us" class="hover:text-primary-600">Hệ thống</router-link>
        <span>/</span>
        <span class="text-gray-800 truncate">{{ currentStore.name }}</span>
      </div>

      <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
        <div class="mb-8 rounded-2xl overflow-hidden shadow-sm aspect-\[21/9] relative bg-gray-200 group">
          <img
            :src="currentStore.imageUrl"
            :alt="currentStore.name"
            v-fallback-img="defaultStoreImg"
            class="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div class="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/90 via-black/40 to-transparent p-6 pt-20">
            <div class="flex items-center gap-3 mb-2">
              <span v-if="currentStore.isOpenNow" class="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Đang mở cửa
              </span>
              <span v-else class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Đang đóng cửa
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
              {{ currentStore.name }}
            </h1>
            <p class="text-sm text-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              {{ currentStore.fullAddress }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div class="lg:col-span-2 space-y-6">
            <div v-if="currentStore.description">
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
                <span class="w-1 h-6 bg-primary-500 rounded-full"></span>
                Giới thiệu
              </h2>
              <div class="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {{ currentStore.description }}
              </div>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
                <span class="w-1 h-6 bg-primary-500 rounded-full"></span>
                Vị trí
              </h2>
              <div class="h-64 bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                <iframe
                  width="100%"
                  height="100%"
                  frameborder="0"
                  style="border: 0"
                  :src="mapSrc"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1 space-y-6">

            <div class="bg-primary-50 p-5 rounded-2xl border border-primary-100">
              <h3 class="font-bold text-lg mb-3 text-primary-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Giờ hoạt động
              </h3>

              <div v-if="currentStore.isOpenNow" class="text-2xl font-bold text-gray-800">
                {{ currentStore.openTimeToday }} - {{ currentStore.closingTimeToday }}
              </div>
              <div v-else class="text-xl font-bold text-red-500">
                Hiện đang đóng cửa
              </div>

              <details class="mt-4 text-sm text-gray-600 group" v-if="currentStore.weeklySchedule?.length">
                <summary class="cursor-pointer font-semibold text-primary-600 hover:text-primary-700 outline-none select-none">
                  Xem lịch cả tuần
                </summary>
                <ul class="mt-3 space-y-2 bg-white/60 p-3 rounded-lg">
                  <li v-for="day in currentStore.weeklySchedule" :key="day.dayOfWeek" class="flex justify-between items-center border-b border-gray-200/50 pb-1 last:border-0 last:pb-0">
                    <span class="font-medium">{{ getDayName(day.dayOfWeek) }}</span>
                    <span v-if="day.isClosed" class="text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded">Nghỉ</span>
                    <span v-else>{{ day.openTime }} - {{ day.closeTime }}</span>
                  </li>
                </ul>
              </details>
            </div>

            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 class="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Tiện ích</h3>
              <ul class="space-y-3 text-sm text-gray-700">
                <li class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Wifi miễn phí <br />
                    <span v-if="currentStore.wifiPassword" class="text-xs text-gray-500 font-mono bg-gray-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                      Pass: {{ currentStore.wifiPassword }}
                    </span>
                  </span>
                </li>

                <li v-if="currentStore.openDate" class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
                  </svg>
                  Hoạt động từ: <span class="font-semibold">{{ formatDate(currentStore.openDate) }}</span>
                </li>
              </ul>

              <div class="mt-6 pt-4 border-t border-gray-200">
                <p class="text-xs text-gray-500 mb-1 font-semibold uppercase">Hotline:</p>
                <a
                  v-if="currentStore.phoneNumber"
                  :href="`tel:${currentStore.phoneNumber}`"
                  class="text-xl font-bold text-primary-600 hover:text-primary-700 block"
                >
                  {{ currentStore.phoneNumber }}
                </a>
                <span v-else class="text-gray-400 italic text-sm">Đang cập nhật</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <CatalogMenuSection
        :categories="categoryStore.categories"
        :products="productStore.products"
        :is-loading="productStore.isLoading"
        :disable-store-filter="true"
        @quick-add="handleOpenModal"
      />
    </div>
  </main>

  <QuickAddModal
    :is-open="isModalOpen"
    :product-summary="selectedProductForModal"
    @close="isModalOpen = false"
  />
</template>
