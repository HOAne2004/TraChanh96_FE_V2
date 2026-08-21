<script setup lang="ts">
import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg'
import { useToastStore } from '@/shared/store/toast.store';

const toastStore = useToastStore();

const getTypeClass = (type: string) => {
  switch (type) {
    case 'success': return 'bg-white border-l-4 border-primary-500 text-gray-800';
    case 'error': return 'bg-white border-l-4 border-red-500 text-gray-800';
    case 'warning': return 'bg-white border-l-4 border-secondary-500 text-gray-800';
    case 'info': return 'bg-white border-l-4 border-blue-500 text-gray-800';
    default: return 'bg-white border-l-4 border-gray-500 text-gray-800';
  }
};
</script>

<template>
  <Teleport to="body">

    <div class="fixed top-20 right-4 z-[99999] flex flex-col gap-3 w-80 pointer-events-none">

      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-center justify-between p-4 rounded-lg shadow-lg pointer-events-auto transform transition-all duration-300"
          :class="getTypeClass(toast.type)"
        >
          <span class="text-sm font-medium">{{ toast.message }}</span>

          <button @click="toastStore.removeToast(toast.id)" class="ml-4 hover:opacity-75 focus:outline-none">
            <IconSvgCancel class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>

    </div>

  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
