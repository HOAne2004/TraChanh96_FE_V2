<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/shared/utils/formatters';
import AppLoading from '@/shared/components/ui/AppLoading.vue';

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
  <div class="card-base sticky top-24 relative overflow-hidden">
    <AppLoading :show="isLoading" overlay text="Đang xử lý..." />
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
      <span>TIẾN HÀNH THANH TOÁN</span>
    </button>
  </div>
</template>
