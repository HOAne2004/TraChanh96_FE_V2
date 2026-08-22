<template>
  <div v-if="show" class="flex flex-col items-center justify-center p-4" :class="overlayClasses">
    <!-- Spinner hiện đại với màu sắc từ main.css -->
    <div class="relative flex items-center justify-center">
      <!-- Vòng tròn nền (mờ nhạt) -->
      <div class="absolute w-12 h-12 border-4 border-primary-100 rounded-full"></div>
      
      <!-- Vòng xoay chính (màu primary) -->
      <div class="absolute w-12 h-12 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      
      <!-- Vòng xoay nhỏ bên trong (ngược chiều, màu secondary) -->
      <div class="absolute w-8 h-8 border-4 border-secondary-400 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
    </div>
    
    <!-- Text loading -->
    <span v-if="text" class="mt-4 text-sm font-medium text-gray-600 animate-pulse">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: 'Đang xử lý...'
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullScreen: {
    type: Boolean,
    default: false
  }
});

const overlayClasses = computed(() => {
  if (props.fullScreen) {
    return 'fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm';
  }
  if (props.overlay) {
    return 'absolute inset-0 z-40 bg-white/70 backdrop-blur-[2px]';
  }
  return '';
});
</script>

<style scoped>
/* Không cần thêm CSS tùy chỉnh vì đã dùng class của Tailwind/CSS variables từ main.css */
</style>
