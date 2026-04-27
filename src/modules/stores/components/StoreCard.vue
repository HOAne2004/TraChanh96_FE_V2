<script setup lang="ts">
import { computed } from 'vue';
import type { StoreCustomerList } from '../types/store';
import defaultStoreImg from '@/assets/images/default-store.png';

const props = defineProps<{
  store: StoreCustomerList;
}>();

const emit = defineEmits<{
  (e: 'select', slug: string): void;
}>();

// Sửa lại Link Google Maps cho chuẩn xác (Link cũ của bạn bị sai domain)
const mapLink = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.store.fullAddress)}`;
});
</script>

<template>
  <div
    class="shrink-0 w-80 snap-start bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group cursor-pointer"
    @click="emit('select', store.slug)"
  >
    <div class="relative h-48 overflow-hidden bg-gray-50">
      <img
        :src="store.imageUrl"
        :alt="store.name"
        v-fallback-img="defaultStoreImg"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div class="absolute top-3 left-3">
        <span
          v-if="store.isOpenNow"
          class="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
        >
          Đang mở cửa
        </span>
        <span
          v-else
          class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
        >
          Đóng cửa
        </span>
      </div>



      <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-8">
        <div class="flex items-center text-white text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-if="store.isOpenNow && store.closingTimeToday">
            Đóng cửa lúc {{ store.closingTimeToday }}
          </span>
          <span v-else-if="!store.isOpenNow && store.closingTimeToday">
             Nghỉ từ {{ store.closingTimeToday }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-5 flex flex-col gap-3 flex-1">
      <h4 class="font-bold text-gray-900 text-lg line-clamp-1" :title="store.name">
        {{ store.name }}
      </h4>

      <div class="flex items-start gap-2 text-gray-600 text-sm flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5 text-primary-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div class="flex flex-col gap-1.5">
          <span class="line-clamp-2" :title="store.fullAddress">{{ store.fullAddress }}</span>
          <span
            v-if="store.distanceKm !== null && store.distanceKm !== undefined"
            class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md w-max border border-green-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h3.25a.75.75 0 00.75-.75v-3.25z" clip-rule="evenodd" />
            </svg>
            Cách bạn {{ store.distanceKm.toFixed(1) }} km
          </span>
        </div>
      </div>
    </div>

    <div class="p-5 pt-0 flex gap-3">
      <a
        :href="mapLink"
        target="_blank"
        class="btn-outline flex-1 text-center flex items-center justify-center text-sm"
        @click.stop
      >
        Chỉ đường
      </a>
      
      <button
        class="btn-primary flex-1 text-sm"
        @click.stop="emit('select', store.slug)"
      >
        Chọn quán
      </button>
    </div>
  </div>
</template>