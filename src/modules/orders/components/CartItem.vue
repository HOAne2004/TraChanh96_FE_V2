<script setup lang="ts">
import IconSvgStore from '@/assets/icons/IconSvgStore.svg'
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
            <IconSvgStore class="w-5 h-5" />
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
