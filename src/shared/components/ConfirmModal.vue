<script setup lang="ts">
import { useConfirmStore } from '@/shared/store/confirm.store';

const confirmStore = useConfirmStore();
</script>

<template>
  <div
    v-if="confirmStore.isOpen"
    class="fixed inset-0 z-\[9999\] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="confirmStore.cancel"
  >
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative animate-fade-in-up">

      <div class="mb-4 flex justify-center">
        <div v-if="confirmStore.options.type === 'danger'" class="rounded-full bg-red-100 p-3 text-red-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        </div>

      <h3 class="text-xl font-bold text-center text-gray-800 mb-2">
        {{ confirmStore.options.title }}
      </h3>
      <p class="text-center text-gray-600 mb-8">
        {{ confirmStore.options.message }}
      </p>

      <div class="flex gap-3 w-full">
        <button @click="confirmStore.cancel" class="btn-outline flex-1">
          {{ confirmStore.options.cancelText || 'Hủy' }}
        </button>
        <button
          @click="confirmStore.confirm"
          :class="confirmStore.options.type === 'danger' ? 'btn-danger' : 'btn-primary'"
          class="flex-1"
        >
          {{ confirmStore.options.confirmText || 'Xác nhận' }}
        </button>
      </div>

    </div>
  </div>
</template>
