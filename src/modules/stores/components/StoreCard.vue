<script setup lang="ts">
import IconSvgLocation from '@/assets/icons/IconSvgLocation.svg'
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
          <IconSvgLocation class="w-4 h-4 mr-1" />
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
        <IconSvgLocation class="w-5 h-5 shrink-0 mt-0.5 text-primary-500" />
        <div class="flex flex-col gap-1.5">
          <span class="line-clamp-2" :title="store.fullAddress">{{ store.fullAddress }}</span>
          <span
            v-if="store.distanceKm !== null && store.distanceKm !== undefined"
            class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md w-max border border-green-100"
          >
            <IconSvgLocation class="w-3 h-3" />
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