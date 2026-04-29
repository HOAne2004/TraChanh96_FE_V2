<script setup lang="ts">
import { computed } from 'vue';
import type { CartItemResponse } from '@/modules/orders/types/order';
import { formatCurrency } from '@/shared/utils/formatters';

const props = defineProps<{
  item: CartItemResponse;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'updateQuantity', productId: string, newQuantity: number): void;
  (e: 'remove', productId: string): void;
}>();

// Hiển thị kích thước, đá, đường
const optionsDisplay = computed(() => {
  const parts = [];
  if (props.item.size) parts.push(`Size: ${props.item.size}`); // Backend trả về Enum string (S, M, L)
  if (props.item.iceLevel) parts.push(`Đá: ${props.item.iceLevel}`);
  if (props.item.sugarLevel) parts.push(`Đường: ${props.item.sugarLevel}`);
  return parts.join(' | ');
});

// Hiển thị Topping
const toppingsDisplay = computed(() => {
  if (!props.item.toppings?.length) return '';
  return props.item.toppings.map(t => `${t.toppingName} (x${t.quantity})`).join(', ');
});

</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2">
    <div class="shrink-0">
      <img :src="item.imageUrl" :alt="item.productName" v-fallback-img
           class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-bold text-gray-800 text-base sm:text-lg line-clamp-2">
            {{ item.productName }}
          </h3>
          <button @click="emit('remove', item.productId)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                  title="Xóa món">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>

        <p class="text-sm text-gray-500 mt-1">{{ optionsDisplay }}</p>
        <p v-if="toppingsDisplay" class="text-xs text-primary-600 italic mt-0.5">
          + Topping: {{ toppingsDisplay }}
        </p>
        <p v-if="item.notes" class="text-xs text-gray-400 mt-1">Ghi chú: {{ item.notes }}</p>
      </div>

      <div class="flex items-center justify-between mt-4">
        <span class="font-bold text-primary-600 text-lg">
          {{ formatCurrency(item.totalPrice) }}
        </span>

        <div class="flex items-center border border-gray-300 rounded-md h-8 bg-white">
          <button @click="emit('updateQuantity', item.productId, item.quantity - 1)"
                  :disabled="isLoading || item.quantity <= 1"
                  class="px-2 h-full text-gray-600 hover:bg-gray-100 rounded-l-md transition disabled:opacity-50">
            -
          </button>
          <span class="px-3 text-sm font-medium text-gray-800 min-w-\[2rem] text-center">
            {{ item.quantity }}
          </span>
          <button @click="emit('updateQuantity', item.productId, item.quantity + 1)"
                  :disabled="isLoading"
                  class="px-2 h-full text-gray-600 hover:bg-gray-100 rounded-r-md transition">
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
