<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Stores
import { useStoreStore } from '@/modules/stores/stores/store.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useCategoryStore } from '@/modules/catalog/store/category.store';

// Components
import ProductCard from '@/modules/catalog/components/ProductCard.vue';
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
const activeCategoryId = ref<number | 'all'>('all');
const isModalOpen = ref(false);
const selectedProductForModal = ref<CustomerProductCard | null>(null);

const currentStore = computed(() => storeStore.currentStore);

// Logic Menu
const displayedProducts = computed(() => {
  let products = productStore.products;
  if (activeCategoryId.value !== 'all') {
    products = products.filter((p) => p.categoryId === activeCategoryId.value);
  }
  return products;
});

const activeCategories = computed(() => {
  // Chỉ hiện những danh mục có chứa sản phẩm tại quán này
  const availableCatIds = new Set(productStore.products.map(p => p.categoryId));
  return categoryStore.categories.filter(c => availableCatIds.has(c.id));
});

const loadData = async () => {
  isLoadingLocal.value = true;
  try {
    await storeStore.fetchStoreBySlug(slug);
    
    if (!currentStore.value) {
      return; 
    }

    // Sau khi có thông tin chi tiết quán, lấy Menu của quán đó
    await Promise.all([
      categoryStore.fetchCategories(),
      // Truyền đúng publicId của quán hiện tại vào hàm lấy Sản phẩm
      productStore.fetchProducts({ storeId: currentStore.value.publicId, pageIndex: 1, pageSize: 100 })
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
  return `http://googleusercontent.com/maps.google.com/maps?q=${addressEnc}&t=&z=15&ie=UTF8&output=embed`;
});
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
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
          <div class="mb-8 rounded-2xl overflow-hidden shadow-sm aspect-\[21/9\] relative bg-gray-200 group">
            <img
              :src="currentStore.imageUrl"
              :alt="currentStore.name"
              v-fallback-img
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
              <h3 class="font-bold text-lg mb-3 text-primary-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Giờ hoạt động
              </h3>
              <p v-if="currentStore.closingTimeToday" class="text-xl font-bold text-gray-800">
                Đóng cửa lúc: {{ currentStore.closingTimeToday }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Cập nhật theo ngày hôm nay</p>
            </div>

            <div class="h-32 md:h-full bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200 min-h-[150px]">
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

        <div id="menu-section" class="mt-12">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <span class="p-2 bg-primary-100 rounded-xl text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Thực đơn tại quán
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            <div class="md:col-span-1 sticky top-24">
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 bg-gray-50 border-b font-bold text-gray-700">
                  Danh mục món
                </div>
                <ul class="flex flex-col">
                  <li>
                    <button
                      @click="activeCategoryId = 'all'"
                      class="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-l-4"
                      :class="activeCategoryId === 'all' ? 'border-primary-500 text-primary-700 font-bold bg-primary-50' : 'border-transparent text-gray-600'"
                    >
                      Tất cả món
                    </button>
                  </li>
                  <li v-for="cat in activeCategories" :key="cat.id">
                    <button
                      @click="activeCategoryId = cat.id"
                      class="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-l-4"
                      :class="activeCategoryId === cat.id ? 'border-primary-500 text-primary-700 font-bold bg-primary-50' : 'border-transparent text-gray-600'"
                    >
                      {{ cat.name }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="md:col-span-3">
              <div v-if="productStore.isLoading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
              
              <div v-else-if="displayedProducts.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                <p class="text-gray-500 text-lg">Quán hiện chưa phục vụ món trong danh mục này.</p>
                <button v-if="activeCategoryId !== 'all'" @click="activeCategoryId = 'all'" class="text-primary-600 font-bold mt-2 hover:underline">
                  Xem tất cả món
                </button>
              </div>

              <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <ProductCard
                  v-for="product in displayedProducts"
                  :key="product.id"
                  :product="product"
                  @quick-add="handleOpenModal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <QuickAddModal 
    :is-open="isModalOpen"
    :product-summary="selectedProductForModal"
    @close="isModalOpen = false"
  />
</template>