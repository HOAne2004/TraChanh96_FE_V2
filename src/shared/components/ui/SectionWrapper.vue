<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="relative container mx-auto mt-8 mb-4 p-4 sm:p-6 lg:p-8 bg-white pt-12 sm:pt-16 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-300 transition-colors duration-300 w-full">

    <div class="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 flex justify-center w-full px-4">
      <span class="px-6 sm:px-10 py-2 sm:py-3 rounded-full text-base sm:text-lg lg:text-2xl font-bold bg-slate-50 text-primary-600 whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
        {{ title }}
      </span>
    </div>

    <div class="w-full">
      <slot />
    </div>

  </div>
</template>
