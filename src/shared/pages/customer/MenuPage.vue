<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

import { useCategoryStore } from '@/modules/catalog/store/category.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useToastStore } from '@/shared/store/toast.store';
import { useStoreStore } from '@/modules/stores/stores/store.store';

import type { CustomerProductCard, CartItemPayload } from '@/modules/catalog/types/product';

import ProductFilter from '@/modules/catalog/components/ProductFilter.vue';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';
import ProductCard from '@/modules/catalog/components/ProductCard.vue';
import QuickAddModal from '@/modules/catalog/components/QuickAddModal.vue';
import StoreFilter from '@/modules/stores/components/StoreFilter.vue';

const isModalOpen = ref(false);
const selectedProductForModal = ref<CustomerProductCard | null>(null);

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const toastStore = useToastStore();
const storeStore = useStoreStore();

// Trạng thái chung
const isLoading = computed(() => categoryStore.isLoading || productStore.isLoading);
const error = computed(() => categoryStore.error || productStore.error);

// Bộ lọc đang chọn
const selectedCategoryIds = ref<number[]>([]);
const currentSearchTerm = ref('');

// --- LOGIC DEBOUNCE GỌI API ---
// Tạo một biến lưu id của bộ đếm giờ (timeout)
let searchTimeout: ReturnType<typeof setTimeout>;

// Hàm gọi API thực sự (chỉ gọi khi cần)
const fetchProductsByFilter = () => {
  productStore.fetchProducts({ 
    pageIndex: 1, 
    pageSize: 100, 
    searchTerm: currentSearchTerm.value || undefined // Truyền xuống API Backend
  });
};

// Lắng nghe biến searchTerm thay đổi. Khi gõ phím, nó sẽ hủy lệnh gọi API cũ và tạo lệnh mới trễ 500ms
watch(currentSearchTerm, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchProductsByFilter();
  }, 500); // Đợi 500ms (nửa giây) sau khi ngừng gõ mới gọi API
});

// Lắng nghe khi category thay đổi, gọi API ngay lập tức
watch(selectedCategoryIds, () => {
  fetchProductsByFilter();
}, { deep: true });

watch(() => storeStore.selectedStoreId, () => {
  fetchProductsByFilter();
});

// Data gộp: Vừa lọc theo CategoryId (nếu có click), vừa tự động bỏ nhóm rỗng
const displayedSections = computed(() => {
  let cats = categoryStore.categories;
  const products = productStore.products;

  // 1. Lọc Danh mục nếu người dùng click vào Sidebar
  if (selectedCategoryIds.value.length > 0) {
    cats = cats.filter(c => selectedCategoryIds.value.includes(c.id));
  }

  // 2. Map sản phẩm vào từng danh mục
  const grouped = cats.map(cat => ({
    id: cat.id,
    name: cat.name,
    products: products.filter(p => p.categoryId === cat.id)
  }));

  // 3. Ẩn đi những danh mục không có sản phẩm nào
  return grouped.filter(group => group.products.length > 0);
});

const handleOpenModal = (product: CustomerProductCard) => {
  selectedProductForModal.value = product;
  isModalOpen.value = true;
};

// HÀM NHẬN DỮ LIỆU TỪ MODAL ĐỂ THÊM VÀO GIỎ
const handleAddToCart = (payload: CartItemPayload) => {
  toastStore.success(`Đã thêm ${payload.productName} vào giỏ!`);
  console.log('Đã nhận cục dữ liệu hoàn chỉnh để thêm vào giỏ:', payload);
  // (Sau này sẽ gọi cartStore ở đây)
};
onMounted(() => {
  Promise.all([
    categoryStore.fetchCategories(),
    productStore.fetchProducts({ pageIndex: 1, pageSize: 100 })
  ]);
});
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">

      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Thực đơn <span class="text-primary-600">Trà Chanh 1996</span>
        </h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

        <div class="hidden md:block md:col-span-4 lg:col-span-3">
          <div class="sticky top-24 space-y-6">
            <StoreFilter 
              :stores="storeStore.stores" 
              v-model="storeStore.selectedStoreId" 
            />
            <ProductFilter
              :categories="categoryStore.categories"
              v-model="selectedCategoryIds"
              v-model:search-term="currentSearchTerm" 
            />
          </div>
        </div>

        <div class="col-span-1 md:col-span-8 lg:col-span-9">

          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-500">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
            <p>Đang tải danh sách sản phẩm...</p>
          </div>

          <div v-else-if="error" class="text-center text-red-500 py-10 font-medium">
            {{ error }}
          </div>

          <div v-else>

            <div v-if="displayedSections.length > 0" class="flex flex-col gap-10">
              <SectionWrapper
                v-for="section in displayedSections"
                :key="section.id"
                :title="section.name"
              >
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                  <ProductCard
                    v-for="product in section.products"
                    :key="product.id"
                    :product="product"
                    @quick-add="handleOpenModal"
                  />
                </div>
              </SectionWrapper>
            </div>

            <div v-else class="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-gray-300 mb-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h3>
              <p class="text-gray-500 mb-6 text-sm">
                {{ selectedCategoryIds.length > 0 ? 'Không có sản phẩm nào thuộc danh mục bạn chọn.' : 'Danh sách sản phẩm đang được cập nhật.' }}
              </p>
              <button
                v-if="selectedCategoryIds.length > 0"
                @click="selectedCategoryIds = []"
                class="btn-outline"
              >
                Xóa bộ lọc
              </button>
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
    @add-to-cart="handleAddToCart"
  />
</template>


