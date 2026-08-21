<script setup lang="ts">
import IconSvgCup from '@/assets/icons/IconSvgCup.svg'
import { ref, computed } from 'vue';

import ProductCard from '@/modules/catalog/components/ProductCard.vue';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';
import StoreFilter from '@/modules/stores/components/StoreFilter.vue';
import ProductFilter from '@/modules/catalog/components/ProductFilter.vue';

import { useStoreStore } from '@/modules/stores/stores/store.store';
import type { CustomerProductCard } from '@/modules/catalog/types/product';
import type { Category } from '@/modules/catalog/types/category';
import AppLoading from '@/shared/components/ui/AppLoading.vue';

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
        <IconSvgCup class="w-6 h-6" />
      </span>
      Thực đơn
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
      <div class="md:col-span-1 sticky top-24 space-y-6 z-[100] md:z-auto">
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
        <AppLoading v-if="isLoading" :show="true" text="Đang tải danh sách..." />

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
