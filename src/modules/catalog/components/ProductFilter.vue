<script setup lang="ts">
import { ref, watch } from 'vue';

interface FilterCategory {
  id: number;
  name: string;
}

const props = withDefaults(defineProps<{
  categories: FilterCategory[];
  title?: string;
  modelValue: number[]; // ID của category
  searchTerm?: string;  // BỔ SUNG: Từ khóa tìm kiếm
}>(), {
  title: 'Bộ lọc & Tìm kiếm',
  categories: () => [],
  modelValue: () => [],
  searchTerm: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void;
  (e: 'update:searchTerm', value: string): void; // BỔ SUNG: Emit khi gõ phím
}>();

const selectedCategories = ref<number[]>([...props.modelValue]);
const localSearchTerm = ref(props.searchTerm); // Lưu giá trị ô input

// --- WATCHERS ---
watch(() => props.modelValue, (newVal) => {
  selectedCategories.value = [...newVal];
}, { deep: true });

watch(() => props.searchTerm, (newVal) => {
  localSearchTerm.value = newVal;
});

// --- METHODS ---
const toggleCategory = (id: number) => {
  if (selectedCategories.value.includes(id)) {
    selectedCategories.value = selectedCategories.value.filter(cId => cId !== id);
  } else {
    selectedCategories.value.push(id);
  }
  emit('update:modelValue', selectedCategories.value);
};

const handleSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  localSearchTerm.value = value;
  emit('update:searchTerm', value); // Bắn sự kiện ra mỗi khi gõ
};

const clearAll = () => {
  selectedCategories.value = [];
  localSearchTerm.value = '';
  emit('update:modelValue', []);
  emit('update:searchTerm', '');
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
    
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
      <h3 class="font-bold text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-primary-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        {{ title }}
      </h3>

      <button
        v-if="selectedCategories.length > 0 || localSearchTerm"
        @click="clearAll"
        class="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
      >
        Xóa lặp
      </button>
    </div>

    <div class="p-5">
      <div class="mb-5 relative">
        <input 
          type="text" 
          :value="localSearchTerm"
          @input="handleSearchInput"
          placeholder="Tìm món ngon..." 
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <div v-if="categories.length === 0" class="text-center text-gray-400 text-sm py-4">
        Đang tải danh mục...
      </div>

      <div v-else class="flex flex-col gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="toggleCategory(cat.id)"
          class="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border text-left flex items-center justify-between"
          :class="[
            selectedCategories.includes(cat.id)
              ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-100 transform scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
          ]"
        >
          <span class="relative z-10 flex items-center gap-1.5">{{ cat.name }}</span>
          <span v-if="selectedCategories.includes(cat.id)" class="bg-white/20 rounded-full p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
      </div>

    </div>
  </div>
</template>