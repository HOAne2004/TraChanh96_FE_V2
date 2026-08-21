<script setup lang="ts">
import IconSvgInfo from '@/assets/icons/IconSvgInfo.svg'
import { useConfirmStore } from '@/shared/store/confirm.store';

const confirmStore = useConfirmStore();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="confirmStore.isOpen"
      class="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="confirmStore.cancel"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative animate-fade-in-up">
  
        <div class="mb-4 flex justify-center">
          <div v-if="confirmStore.options.type === 'danger'" class="rounded-full bg-red-100 p-3 text-red-600">
            <IconSvgInfo class="w-8 h-8" />
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
  </Teleport>
</template>
