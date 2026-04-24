<script setup lang="ts">
import { computed } from 'vue';
import type { StoreCustomerList } from '@/modules/stores/types/store';

const props = defineProps<{
  stores: StoreCustomerList[];
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

// Two-way binding cho thẻ <select>
const selectedStoreId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Gộp chung logic tìm kiếm thông tin quán đang chọn để tối ưu hiệu năng (tránh gọi hàm find nhiều lần trên template)
const activeStoreInfo = computed(() => {
  if (!selectedStoreId.value) return null;
  return props.stores.find((s) => s.publicId === selectedStoreId.value) || null;
});
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
    <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 text-primary-500"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
        />
      </svg>
      Chọn cửa hàng
    </h3>

    <div class="relative">
      <select
        v-model="selectedStoreId"
        class="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition cursor-pointer text-sm truncate"
      >
        <option :value="null" disabled>Hãy chọn cửa hàng gần bạn</option>

        <option v-for="store in stores" :key="store.publicId" :value="store.publicId">
          {{ store.name }}
        </option>
      </select>

      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <div v-if="activeStoreInfo" class="mt-4 text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
      <div class="flex items-start gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 shrink-0 text-primary-500"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <span class="line-clamp-2">{{ activeStoreInfo.fullAddress }}</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 text-primary-500 shrink-0"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span v-if="activeStoreInfo.isOpenNow && activeStoreInfo.closingTimeToday" class="text-primary-600 font-medium">
          Đang mở cửa (Đóng lúc {{ activeStoreInfo.closingTimeToday }})
        </span>
        <span v-else-if="!activeStoreInfo.isOpenNow && activeStoreInfo.closingTimeToday" class="text-red-500 font-medium">
          Đang đóng cửa (Nghỉ từ {{ activeStoreInfo.closingTimeToday }})
        </span>
        <span v-else class="text-red-500 font-medium">
          Đang đóng cửa
        </span>
      </div>
    </div>
    
    <p v-else class="text-sm text-amber-600 mt-3 flex items-center gap-1.5 font-medium bg-amber-50 p-2 rounded-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-4 h-4 shrink-0"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      Bạn cần chọn cửa hàng để đặt hàng
    </p>
  </div>
</template>