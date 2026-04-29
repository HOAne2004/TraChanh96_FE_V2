<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/shared/utils/formatters';

const props = defineProps<{
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'checkout'): void;
}>();

const hasItems = computed(() => props.totalItems > 0);
</script>

<template>
  <div class="card-base sticky top-24">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
    <div class="border-b border-gray-200 mb-4"></div>

    <div class="flex justify-between items-center mb-3 text-gray-600">
      <span>Số lượng món:</span>
      <span class="font-medium">{{ totalItems }} ly</span>
    </div>

    <div class="flex justify-between items-center font-bold text-lg text-primary-600 mt-4">
      <span>Tổng cộng:</span>
      <span>{{ formatCurrency(totalPrice) }}</span>
    </div>

    <p class="text-xs text-gray-400 mt-2 text-center italic">
      (Chưa bao gồm phí vận chuyển và mã giảm giá)
    </p>

    <button @click="emit('checkout')"
            :disabled="!hasItems || isLoading"
            class="btn-primary w-full mt-6 py-3 text-lg relative flex items-center justify-center">
      <span v-if="isLoading" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
         <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         Đang xử lý...
      </span>
      <span v-else>TIẾN HÀNH THANH TOÁN</span>
    </button>
  </div>
</template>
