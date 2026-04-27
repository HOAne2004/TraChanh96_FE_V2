<script setup lang="ts">
import { ref, computed } from 'vue';
import ProductCard from '@/modules/catalog/components/ProductCard.vue';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';
import StoreFilter from '@/modules/stores/components/StoreFilter.vue';
import ProductFilter from '@/modules/catalog/components/ProductFilter.vue';
import { useStoreStore } from '@/modules/stores/stores/store.store';
import type { CustomerProductCard } from '@/modules/catalog/types/product';
import type { Category } from '@/modules/catalog/types/category';

interface Props {
  categories: Category[];
  products: CustomerProductCard[];
  isLoading: boolean;
  disableStoreFilter?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'quick-add', product: CustomerProductCard): void;
}>();

const storeStore = useStoreStore();

const selectedCategoryIds = ref<number[]>([]);
const currentSearchTerm = ref('');

const activeCategories = computed(() => {
  // Chỉ hiện những danh mục có chứa sản phẩm
  const availableCatIds = new Set(props.products.map(p => p.categoryId));
  return props.categories.filter(c => availableCatIds.has(c.id));
});

const displayedSections = computed(() => {
  let cats = props.categories;

  if (selectedCategoryIds.value.length > 0) {
    cats = cats.filter(c => selectedCategoryIds.value.includes(c.id));
  }

  const searchTerm = currentSearchTerm.value.toLowerCase().trim();

  const grouped = cats.map(cat => {
    let catProducts = props.products.filter(p => p.categoryId === cat.id);
    if (searchTerm) {
      catProducts = catProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    return {
      id: cat.id,
      name: cat.name,
      products: catProducts
    };
  });

  return grouped.filter(group => group.products.length > 0);
});
</script>

<template>
  <div id="menu-section" class="mt-12">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"
    v-if="disableStoreFilter">
      <span class="p-2 bg-primary-100 rounded-xl text-primary-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
      Thực đơn
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
      <div class="md:col-span-1 sticky top-24 space-y-6">
        <StoreFilter
          :stores="storeStore.stores"
          v-model="storeStore.selectedStoreId"
          :disabled="disableStoreFilter"
        />
        <ProductFilter
          :categories="activeCategories"
          v-model="selectedCategoryIds"
          v-model:search-term="currentSearchTerm"
        />
      </div>

      <div class="md:col-span-3">
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <div v-else-if="displayedSections.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <p class="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button v-if="selectedCategoryIds.length > 0 || currentSearchTerm" @click="selectedCategoryIds = []; currentSearchTerm = ''" class="text-primary-600 font-bold mt-2 hover:underline">
            Xóa bộ lọc
          </button>
        </div>

        <div v-else class="flex flex-col gap-10">
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
                @quick-add="$emit('quick-add', product)"
              />
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  </div>
</template>
