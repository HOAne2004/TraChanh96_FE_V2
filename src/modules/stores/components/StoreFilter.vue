<script setup lang="ts">
import IconSvgInfo from '@/assets/icons/IconSvgInfo.svg'
import IconSvgStore from '@/assets/icons/IconSvgStore.svg'
import IconSvgLocation from '@/assets/icons/IconSvgLocation.svg'
import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg'

import { ref, computed } from 'vue';
import type { StoreCustomerList } from '@/modules/stores/types/store';
import { useStoreStore } from '@/modules/stores/stores/store.store';
import AppLoading from '@/shared/components/ui/AppLoading.vue';

const props = defineProps<{
  stores: StoreCustomerList[];
  modelValue: string | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const storeStore = useStoreStore();
const isExpanded = ref(false);

// --- DRAGGING STATE & LOGIC ---
const x = ref<number | null>(null)
const y = ref<number | null>(null)
const isDragging = ref(false)
let startX = 0
let startY = 0
let touchStartX = 0
let touchStartY = 0
let hasDragged = false
const dragThreshold = 5

const handleTouchStart = (e: TouchEvent) => {
  if (typeof window !== 'undefined' && window.innerWidth >= 768) return
  if (props.disabled) return // Don't drag if filter is disabled
  const touch = e.touches[0]
  if (!touch) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  startX = touch.clientX - rect.left
  startY = touch.clientY - rect.top

  touchStartX = touch.clientX
  touchStartY = touch.clientY
  hasDragged = false
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  if (!touch) return

  // Prevent default scroll behavior
  e.preventDefault()

  const clientX = touch.clientX
  const clientY = touch.clientY

  if (Math.abs(clientX - touchStartX) > dragThreshold || Math.abs(clientY - touchStartY) > dragThreshold) {
    hasDragged = true
  }

  let newX = clientX - startX
  let newY = clientY - startY

  const buttonSize = 56 // w-14/h-14 = 56px
  const maxX = window.innerWidth - buttonSize - 10
  const maxY = window.innerHeight - buttonSize - 10

  newX = Math.max(10, Math.min(newX, maxX))
  newY = Math.max(10, Math.min(newY, maxY))

  x.value = newX
  y.value = newY
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleButtonClick = () => {
  if (hasDragged) return
  isExpanded.value = !isExpanded.value
}

const mobileStyle = computed(() => {
  if (typeof window === 'undefined') return {}
  if (window.innerWidth >= 768) return {}

  const style: any = {
    position: 'fixed',
    zIndex: 98,
  }

  if (x.value !== null && y.value !== null) {
    style.left = `${x.value}px`
    style.top = `${y.value}px`
    style.bottom = 'auto'
    style.right = 'auto'
  }
  return style
})

// Two-way binding cho thẻ <select>
const selectedStoreId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Gộp chung logic tìm kiếm thông tin quán đang chọn để tối ưu hiệu năng
const activeStoreInfo = computed(() => {
  if (!selectedStoreId.value) return null;
  return props.stores.find((s) => s.publicId === selectedStoreId.value) || null;
});
</script>

<template>
  <div class="md:space-y-3">
    <!-- Mobile Toggle Button (Floating FAB) -->
    <button
      v-if="!isExpanded"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleButtonClick"
      :disabled="disabled"
      class="md:hidden fixed bottom-[170px] right-6 z-[99] w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 touch-none"
      :class="disabled ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'hover:bg-primary-700'"
      :style="mobileStyle"
    >
      <span class="flex items-center justify-center">
        <IconSvgStore class="w-6 h-6" />
      </span>
    </button>

    <!-- Mobile Backdrop -->
    <div
      v-if="isExpanded"
      @click="isExpanded = false"
      class="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] transition-opacity duration-300"
    ></div>

    <!-- Filter content (Modal on mobile, Sidebar on desktop) -->
    <div
      :class="[
        isExpanded || disabled
          ? 'block'
          : 'hidden md:block',
        isExpanded && !disabled
          ? 'fixed inset-x-4 top-1/2 -translate-y-1/2 z-[1000] max-h-[85vh] overflow-y-auto'
          : 'relative'
      ]"
      class="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      <AppLoading :show="storeStore.isLocationLoading" overlay text="Đang định vị..." />
      <div
        class="flex items-center justify-between mb-3 cursor-pointer"
        @click="!disabled && (isExpanded = false)"
      >
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          <IconSvgStore class="w-6 h-6 text-primary-500" />
          Chọn cửa hàng
        </h3>

        <div class="flex items-center gap-2" @click.stop>
          <button
            @click="storeStore.requestUserLocation()"
            :disabled="storeStore.isLocationLoading || disabled"
            class="text-xs font-medium text-primary-600 flex items-center gap-1.5 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors"
          >
            <IconSvgLocation class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Tìm quán gần tôi</span>
            <span class="sm:hidden">Gần tôi</span>
          </button>

          <!-- Close button (Visible on mobile) -->
          <button
            v-if="!disabled"
            @click="isExpanded = false"
            class="md:hidden p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IconSvgCancel class="h-5 w-5" />
          </button>
        </div>
      </div>

      <p v-if="storeStore.locationError" class="text-xs text-red-500 mb-3 font-medium">
        {{ storeStore.locationError }}
      </p>

      <div class="relative">
        <select
          v-model="selectedStoreId"
          :disabled="disabled"
          class="w-full appearance-none border text-gray-900 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm truncate"
          :class="disabled ? 'opacity-70 cursor-not-allowed bg-gray-200 border-gray-200' : 'bg-gray-50 border-gray-300 cursor-pointer'"
        >
          <option :value="null" disabled>Hãy chọn cửa hàng gần bạn</option>

          <option v-for="store in stores" :key="store.publicId" :value="store.publicId">
            {{ store.name }}
          </option>
        </select>

        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
          <IconSvgLocation class="w-4 h-4" />
        </div>
      </div>

      <div v-if="activeStoreInfo" class="mt-4 text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
        <div class="flex items-start gap-2">
          <IconSvgStore class="w-4 h-4 shrink-0 text-primary-500" />
          <span class="line-clamp-2">{{ activeStoreInfo.fullAddress }}</span>
        </div>

        <div class="flex items-center gap-2">
          <IconSvgStore class="w-4 h-4 text-primary-500 shrink-0" />
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
        <IconSvgInfo class="w-4 h-4 shrink-0" />
        Bạn cần chọn cửa hàng để đặt hàng
      </p>
    </div>
  </div>
</template>
