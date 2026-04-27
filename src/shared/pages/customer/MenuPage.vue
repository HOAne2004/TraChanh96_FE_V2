<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

import { useCategoryStore } from '@/modules/catalog/store/category.store';
import { useProductStore } from '@/modules/catalog/store/product.store';
import { useToastStore } from '@/shared/store/toast.store';
import { useStoreStore } from '@/modules/stores/stores/store.store';

import type { CustomerProductCard, CartItemPayload } from '@/modules/catalog/types/product';

import CatalogMenuSection from '@/modules/catalog/components/CatalogMenuSection.vue';
import QuickAddModal from '@/modules/catalog/components/QuickAddModal.vue';

const isModalOpen = ref(false);
const selectedProductForModal = ref<CustomerProductCard | null>(null);

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const toastStore = useToastStore();
const storeStore = useStoreStore();

// Trạng thái chung
const isLoading = computed(() => categoryStore.isLoading || productStore.isLoading);
const error = computed(() => categoryStore.error || productStore.error);

watch(() => storeStore.selectedStoreId, () => {
  productStore.fetchProducts({ pageIndex: 1, pageSize: 100 });
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
  <main class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">

      <div v-if="error" class="text-center text-red-500 py-10 font-medium">
        {{ error }}
      </div>

      <CatalogMenuSection
        v-else
        :categories="categoryStore.categories"
        :products="productStore.products"
        :is-loading="isLoading"
        @quick-add="handleOpenModal"
      />
    </div>
  </main>
  <QuickAddModal
    :is-open="isModalOpen"
    :product-summary="selectedProductForModal"
    @close="isModalOpen = false"
    @add-to-cart="handleAddToCart"
  />
</template>


